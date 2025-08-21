from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def classify_query(query, all_schemas):
    """
    Args:
        query (str): User query
        all_schemas (dict): {db_name: schema_dict}
    
    Returns:
        dict: {"mode": "SQL"|"RAG", "db_name": str|None}
    """
    schema_texts = []
    for db_name, schema in all_schemas.items():
        tables = ", ".join([t["name"] for t in schema["tables"]])
        schema_texts.append(f"- {db_name}: {tables}")
    
    schema_list = "\n".join(schema_texts)

    prompt = f"""
    You are a classifier that decides if a user query should be answered by SQL (structured DB query) or RAG (document retrieval).
    
    Databases and their tables:
    {schema_list}
    
    Rules:
    - If the question is about tabular, numeric, or relational data (employees, sales, customers, etc.), classify as SQL and pick the **most relevant database**.
    - If the question is about concepts, explanations, or text from uploaded documents, classify as RAG and set db_name to null.
    
    Return ONLY a JSON object like:
    {{
      "mode": "SQL" or "RAG",
      "db_name": "database_name" or null
    }}
    
    Question: {query}
    """

    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=100
    )
    
    import json
    try:
        return json.loads(res.choices[0].message.content.strip())
    except Exception:
        # fallback: if parsing fails
        return {"mode": "RAG", "db_name": None}
