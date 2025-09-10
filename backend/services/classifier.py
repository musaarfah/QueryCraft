from openai import OpenAI
import os
from services.prompt_manager import load_prompts


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

    prompts = load_prompts()
    base_prompt = prompts.get("classifier_prompt")

    if not base_prompt:
        raise ValueError("Classifier prompt not found in prompts.json")


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
    prompt = base_prompt.format(query=query, schema_list=schema_list)

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
