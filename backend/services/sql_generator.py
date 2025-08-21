import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

OPENAI_MODEL = "gpt-4o-mini"

PROMPT_TEMPLATE = """
You are a precise SQL generator for PostgreSQL.

Return ONLY a valid JSON object:
{{"sql": "...", "params": [...]}}

Rules:
- Only SELECT queries allowed, no mutation (INSERT, UPDATE, DELETE, DROP).
- Use numbered placeholders $1, $2 ... for params.
- Use schema below:
{schema_description}

User Question: {question}
Output:
"""

def generate_sql(schema_description, question):
    try:
        prompt = PROMPT_TEMPLATE.format(schema_description=schema_description, question=question)
        
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0
        )

        res = response.choices[0].message.content.strip()
        start, end = res.find("{"), res.rfind("}")
        if start == -1 or end == -1:
            return "", []

        try:
            parsed = json.loads(res[start:end+1])
            return parsed.get("sql", ""), parsed.get("params", [])
        except json.JSONDecodeError:
            return "", []
            
    except Exception as e:
        # Log the error but don't expose details to client
        print(f"Error in generate_sql: {e}")
        return "", []