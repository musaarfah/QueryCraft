import os
import json
import re
from openai import OpenAI
from dotenv import load_dotenv
from services.prompt_manager import load_prompts


load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

OPENAI_MODEL = "gpt-4o-mini"




def generate_sql(schema_description, question):
    prompts = load_prompts()
    base_prompt = prompts.get("sql_generator_prompt")

    if not base_prompt:
        raise ValueError("SQL generator prompt not found in prompts.json")



    try:
        prompt = base_prompt.format(schema_description=schema_description, question=question)

        
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