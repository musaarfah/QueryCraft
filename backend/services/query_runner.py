import psycopg2
import psycopg2.extras
import re

FORBIDDEN = ["insert ", "update ", "delete ", "drop ", "alter ", "create ", ";", "--"]

def validate_sql(sql: str):
    s = sql.strip().lower()
    if not s.startswith("select"):
        raise ValueError("Only SELECT queries are allowed.")
    for kw in FORBIDDEN:
        if kw in s:
            raise ValueError(f"Forbidden SQL token: {kw}")
    return True

def run_query(sql, params, db_config, limit=1000):
    print("DEBUG in run_query got db_config type:", type(db_config))  # <--- add this

    validate_sql(sql)

    # Convert $1, $2 → %s for psycopg2
    sql = re.sub(r"\$\d+", "%s", sql)

    if "limit" not in sql.lower():
        sql += f" LIMIT {limit}"

    conn = psycopg2.connect(**db_config)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(sql, params or None)
    rows = cur.fetchall()
    conn.close()

    return rows
