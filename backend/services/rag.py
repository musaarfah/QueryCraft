from openai import OpenAI

def make_answer(openai_api_key: str, model: str, question: str, contexts: list) -> str:
    client = OpenAI(api_key=openai_api_key)

    context_text = "\n\n".join([c["payload"]["text"] for c in contexts])

    prompt = f"""You are a helpful assistant.
Answer ONLY using the provided context. If the context is insufficient, say so clearly, then provide the closest relevant info from the context.

Question: {question}

Context:
{context_text}

Answer:
"""

    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role":"system","content":"You are a knowledgeable assistant."},
            {"role":"user","content": prompt}
        ],
        temperature=0.4,
        max_tokens=400,
    )
    return resp.choices[0].message.content
