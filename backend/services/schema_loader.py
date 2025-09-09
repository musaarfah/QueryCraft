import psycopg2
import yaml
import os

def extract_schema_to_yaml(db_config, yaml_path="structured_schema.yaml"):
    """
    Extracts schema from PostgreSQL and saves to YAML.
    """
    conn = psycopg2.connect(**db_config)
    cur = conn.cursor()

    cur.execute("""
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
    """)

    schema_data = {}
    for table, column, col_type in cur.fetchall():
        if table not in schema_data:
            schema_data[table] = []
        schema_data[table].append({"name": column, "type": col_type})

    yaml_schema = {
        "tables": [
            {"name": table, "description": "", "columns": cols}
            for table, cols in schema_data.items()
        ]
    }

    with open(yaml_path, "w") as f:
        yaml.dump(yaml_schema, f, sort_keys=False)

    cur.close()
    conn.close()
    return yaml_schema


def schema_to_description(schema_dict):
    """
    Convert schema dict → string for OpenAI prompt.
    Include PKs, FKs, and column details.
    """
    parts = []
    for table in schema_dict.get("tables", []):
        tname = table.get("name")
        pk = [c["name"] for c in table["columns"] if c.get("is_primary")]
        fks = [f"{c['name']} → {c['references']}" for c in table["columns"] if c.get("references")]
        cols = [f"{c['name']} ({c['type']})" for c in table["columns"]]
        
        desc = f"Table {tname}:\n  Columns: {', '.join(cols)}"
        if pk:
            desc += f"\n  Primary Key: {', '.join(pk)}"
        if fks:
            desc += f"\n  Foreign Keys: {', '.join(fks)}"
        parts.append(desc)
    return "\n\n".join(parts)