# backend/services/sql_service.py
import os
from dotenv import load_dotenv
import re
from . import query_runner
from . import schema_loader
from . import sql_generator

# Load env vars
load_dotenv()


def get_schema_description(db_config, yaml_path: str = None) -> str:
    """
    Extract schema for a given DB config and return as description string.
    Optionally cache/save to yaml_path.

    Args:
        db_config: connection details
        yaml_path: optional file path to save YAML
    """
    schema = schema_loader.extract_schema_to_yaml(
        db_config, yaml_path or "structured/schema.yaml"
    )

    # Use the simpler schema_to_description (always detailed, includes PKs/FKs)
    return schema_loader.schema_to_description(schema)



import re

def make_presentable(rows, schema, sql, max_rows=10):
    """
    Convert raw DB rows -> human-friendly list of dicts.
    Handles both dict rows (RealDictCursor) and tuple rows.
    Uses schema to only keep descriptive columns if rows are large.
    """
    if not rows:
        return rows

    # If too many rows, truncate
    rows = rows[:max_rows]

    # If rows are already dicts (RealDictCursor)
    if isinstance(rows[0], dict):
        dict_rows = rows
    else:
        # Parse selected columns from SQL (naive approach)
        match = re.search(r"select (.+?) from", sql, re.IGNORECASE | re.DOTALL)
        if match:
            col_segment = match.group(1).strip()
            if col_segment != "*":
                col_names = [c.strip() for c in col_segment.split(",")]
            else:
                col_names = [c["name"] for t in schema["tables"] for c in t["columns"]]
        else:
            col_names = [f"col{i}" for i in range(len(rows[0]))]

        # Convert tuple rows → dict rows
        dict_rows = [dict(zip(col_names, row)) for row in rows]

    # Optional heuristic: filter to descriptive columns if row is very wide
    if dict_rows and len(dict_rows[0]) > 6:
        keep = [c for c in dict_rows[0].keys() if any(k in c.lower() for k in ["name", "title", "email", "desc"])]
        if keep:
            dict_rows = [{k: r.get(k) for k in keep} for r in dict_rows]

    return dict_rows



def handle_meta_query(question: str, schema_dict: dict):
    q_lower = question.lower()
    if "table" in q_lower and ("name" in q_lower or "list" in q_lower):
        return {
            "sql": None,
            "params": [],
            "rows": [t["name"] for t in schema_dict.get("tables", [])],
            "note": "Returned table names from schema directly (no SQL executed)."
        }
    return None




def run_nl_sql(query: str, db_config):
    """
    Given a natural language query and a db_config, generate SQL and execute.
    """
    # 1. Extract schema once
    schema = schema_loader.extract_schema_to_yaml(db_config)
    schema_desc = schema_loader.schema_to_description(schema)

    # 2. Handle meta queries before LLM
    meta = handle_meta_query(query, schema)
    if meta:
        return meta

    # 3. Ask LLM for SQL
    sql, params = sql_generator.generate_sql(schema_desc, query)
    if not sql:
        return {"error": "Could not generate SQL"}

    # 4. Run query
    rows = query_runner.run_query(sql, params, dict(db_config))

    # 5. Post-process: make presentable
    presentable = make_presentable(rows, schema, sql)

    return {
        "sql": sql,
        "params": params,
        "rows": presentable
    }
