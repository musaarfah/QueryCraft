from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def classify_query(query, all_schemas):
    """
    Classify a query as SQL, RAG, or SQL+RAG.
    
    Args:
        query (str): User query
        all_schemas (dict): {db_name: schema_dict}
        client: OpenAI client
    
    Returns:
        dict: {"mode": "SQL"|"RAG"|"SQL+RAG", "db_name": str|None}
    """

    # Build schema descriptions with tables + columns
    schema_texts = []
    for db_name, schema in all_schemas.items():
        table_descs = []
        for t in schema["tables"]:
            cols = [c["name"] for c in t["columns"][:5]]  # limit to 5 cols for brevity
            col_list = ", ".join(cols)
            table_descs.append(f"{t['name']}({col_list})")
        schema_texts.append(f"- {db_name}: {', '.join(table_descs)}")
    
    schema_list = "\n".join(schema_texts)

    # Stronger classification prompt
    prompt = f"""
You are a query classifier that decides if a user query should be answered by SQL (structured database query) or RAG (document/text retrieval).

Available Databases (with sample tables and columns):
{schema_list}

### Classification Guidelines:
1. **SQL (Structured Data)**  
   - Use SQL when the query is about tabular, numeric, or relational data (e.g., employees, sales, customers, orders).  
   - Look for keywords like "total", "count", "list", "find", "who", "which customer", "sales in", "employees from", etc.  
   - If the query mentions a **person/entity name** and the schema contains `firstname`, `lastname`, `name`, or similar columns, prefer SQL.  
   - When multiple databases could fit, pick the one where the **table and column names** best match the query.  

2. **RAG (Document/Text Retrieval)**  
   - Use RAG when the query asks about **textual content** such as definitions, explanations, legal clauses, sections of laws, policies, or concepts.  
   - Look for queries mentioning "explain", "what is", "describe", "summarize", "clause", "section", "theory", "concept", or "policy".  
   - Example: "Explain Section 10 of the Constitution", "Summarize the Monitor Theory", or "What is Clause 5 about?".  

3. **SQL+RAG (Ambiguous Cases)**  
   - If the query could logically require **both** (e.g., check if someone exists in DB but also explain their role from documents), classify as `SQL+RAG`.  
   - Provide the best guess for `db_name` in this case.  

Return ONLY a JSON object like:
{{
  "mode": "SQL" or "RAG" or "SQL+RAG",
  "db_name": "database_name" or null
}}

### Examples:
Q: Who is Laura Ansell?
A: {{ "mode": "SQL", "db_name": "northwind" }}

Q: Explain the concept of Monitor Theory.
A: {{ "mode": "RAG", "db_name": null }}

Q: Show me the total sales in 2023.
A: {{ "mode": "SQL", "db_name": "salesdb" }}

Q: Summarize Section 10 of the Constitution.
A: {{ "mode": "RAG", "db_name": null }}

Q: List employees hired after 2020.
A: {{ "mode": "SQL", "db_name": "hrdb" }}

Q: Who is John Smith, and what role does he play in company policy?
A: {{ "mode": "SQL+RAG", "db_name": "hrdb" }}

Now classify the following query:
Question: {query}
"""

    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=200
    )
    
    import json
    try:
        return json.loads(res.choices[0].message.content.strip())
    except Exception:
        return {"mode": "RAG", "db_name": None}
