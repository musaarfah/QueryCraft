from services.schema_loader import schema_to_description
from services.sql_generator import generate_sql
from services.query_runner import run_query
from services.rag import make_answer
from services.classifier import classify_query   # new

def query_router(user_query, schema_dict, db_config):
    decision = classify_query(user_query, schema_dict)

    if decision == "SQL":
        schema_desc = schema_to_description(schema_dict)
        sql, params = generate_sql(schema_desc, user_query)
        if not sql:
            return {"error": "Could not generate SQL"}
        rows = run_query(sql, params, db_config)
        return {"type": "structured", "sql": sql, "params": params, "rows": rows}
    else:
        result = make_answer(user_query)
        return {"type": "unstructured", "answer": result}
