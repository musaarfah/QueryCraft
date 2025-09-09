# backend/services/sql_service.py
import os
from dotenv import load_dotenv
import re
from . import query_runner
from . import schema_loader
from . import sql_generator

# Load env vars
load_dotenv()


def get_schema_description(db_config, yaml_path=None, for_prompt: bool = True):
    """
    Extract schema for a given DB config and return as description string.
    Optionally cache/save to yaml_path.

    Args:
        db_config: connection details
        yaml_path: optional file path to save YAML
        for_prompt: if True, returns compact prompt-friendly schema
                    if False, returns verbose schema for debugging
    """
    schema = schema_loader.extract_schema_to_yaml(
        db_config, yaml_path or "structured/schema.yaml"
    )

    if for_prompt:
        # compact version: fewer columns, good for LLM
        return schema_loader.schema_to_description(
            schema, max_cols=5, sort_cols=True, verbose=False
        )
    else:
        # detailed version: all columns, multiline, for inspection
        return schema_loader.schema_to_description(
            schema, sort_cols=True, verbose=True
        )



def make_presentable(rows, schema, sql, max_rows=10):
    """
    Convert raw DB rows -> human-friendly list of dicts.
    Uses schema to only keep descriptive columns if rows are large.
    """
    if not rows:
        return rows

    # If too many rows, truncate
    if len(rows) > max_rows:
        rows = rows[:max_rows]

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

    # Convert to list of dicts
    dict_rows = [dict(zip(col_names, row)) for row in rows]

    # Optional heuristic: filter to descriptive columns if row is very wide
    if len(col_names) > 6:  
        keep = [c for c in col_names if any(k in c.lower() for k in ["name", "title", "email", "desc"])]
        if keep:
            dict_rows = [{k: r[k] for k in keep if k in r} for r in dict_rows]

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
    schema_desc = schema_loader.schema_to_description(schema, max_cols=5, sort_cols=True)

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
