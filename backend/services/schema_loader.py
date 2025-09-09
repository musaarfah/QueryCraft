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


from typing import Dict, Any, Optional


def schema_to_description(
    schema_dict: Dict[str, Any],
    *,
    max_cols: Optional[int] = None,
    sort_cols: bool = False,
    verbose: bool = False
) -> str:
    """
    Convert schema dict -> string for prompts or docs.

    Args:
        schema_dict: {"tables":[ {"name": "...", "columns":[{"name":"", "type":""}, ...]}, ... ]}
        max_cols: if set, show only the first max_cols columns per table and append a "... (+N more)" marker
        sort_cols: if True, sort columns by name (makes output deterministic)
        verbose: if True, produce multiline, indented output. Otherwise produce compact single-line table summaries.

    Returns:
        str: nicely formatted schema description
    """
    parts = []
    tables = schema_dict.get("tables", []) or []

    # sort tables alphabetically for deterministic output
    tables = sorted(tables, key=lambda t: (t.get("name") or "").lower())

    for table in tables:
        tname = table.get("name") or "<unknown_table>"
        raw_cols = table.get("columns") or []

        col_items = []
        for c in raw_cols:
            cname = (c.get("name") or "").strip()
            ctype = (c.get("type") or "").strip()
            if not cname:
                # skip malformed column entries
                continue

            # heuristic to identify primary key-like columns
            lname = cname.lower()
            tname_l = tname.lower()
            is_pk = (
                lname == "id"
                or lname == f"{tname_l}_id"
                or lname == f"{tname_l}id"
                or lname.endswith("_id")
                or lname.endswith("id") and (len(lname) <= 6)  # loose heuristic for short 'id' suffices
            )
            pk_marker = " [PK]" if is_pk else ""

            # backtick column names for clarity (preserves spaces/underscores)
            if ctype:
                col_items.append(f"`{cname}` ({ctype}){pk_marker}")
            else:
                col_items.append(f"`{cname}`{pk_marker}")

        if sort_cols:
            col_items = sorted(col_items, key=lambda s: s.lower())

        total_cols = len(col_items)
        display_cols = col_items
        if max_cols is not None and total_cols > max_cols:
            display_cols = col_items[:max_cols]
            display_cols.append(f"... (+{total_cols - max_cols} more)")

        if verbose:
            # multiline, indented list (good for logs and inspection)
            table_block = [f"Table `{tname}` ({total_cols} columns):"]
            for ci in display_cols:
                table_block.append(f"  - {ci}")
            parts.append("\n".join(table_block))
        else:
            # compact single-line representation (better for LLM prompts)
            parts.append(f"Table `{tname}`: {', '.join(display_cols)}")

    return "\n\n".join(parts)

