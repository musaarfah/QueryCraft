# backend/services/sql_service.py
import os
from dotenv import load_dotenv
from . import query_runner
from . import schema_loader
from . import sql_generator

# Load env vars
load_dotenv()


def get_schema_description(db_config, yaml_path=None):
    """
    Extract schema for a given DB config and return as description string.
    Optionally cache/save to yaml_path.
    """
    schema = schema_loader.extract_schema_to_yaml(db_config, yaml_path or "structured/schema.yaml")
    return schema_loader.schema_to_description(schema)


def run_nl_sql(query: str, db_config):
    """
    Given a natural language query and a db_config, generate SQL and execute.
    """
    schema_desc = get_schema_description(db_config)
    sql, params = sql_generator.generate_sql(schema_desc, query)
    if not sql:
        return {"error": "Could not generate SQL"}

    rows = query_runner.run_query(sql, params, dict(db_config))
    return {
        "sql": sql,
        "params": params,
        "rows": rows
    }
