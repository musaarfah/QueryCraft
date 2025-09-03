import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

from config import settings
from services.ingest import extract_text, make_document_id
from services.chunk_embed import chunk_text, embed_texts, embedding_dim, get_embedder
from services.qdrant_store import (
    get_qdrant_client, ensure_collection, upsert_chunks,
    search_chunks, list_documents, delete_document
)
from services.rag import make_answer
from services.schema_loader import extract_schema_to_yaml
from services.classifier import classify_query
from services.sql_service import run_nl_sql
from services.schema_manager import load_db_schemas



# ---- App setup ----
app = Flask(__name__)
CORS(app)

# ---- Qdrant client & collection ----
qdrant = get_qdrant_client(
    url=settings.QDRANT_URL,
    api_key=settings.QDRANT_API_KEY,
    timeout=30.0  # increase from default

)

vector_size = embedding_dim(settings.EMBED_MODEL)
ensure_collection(qdrant, settings.COLLECTION_NAME, vector_size)

# Warm embedder once
_ = get_embedder(settings.EMBED_MODEL)


DB_CONFIGS_PATH = "db_configs.json"

def load_db_configs():
    if not os.path.exists(DB_CONFIGS_PATH):
        return {}
    with open(DB_CONFIGS_PATH, "r") as f:
        return json.load(f)

def save_db_configs(configs):
    with open(DB_CONFIGS_PATH, "w") as f:
        json.dump(configs, f, indent=2)



@app.get("/health")
def health():
    return jsonify({"ok": True, "collection": settings.COLLECTION_NAME})

@app.get("/list-docs")
def list_docs():
    docs = list_documents(qdrant, settings.COLLECTION_NAME)
    return jsonify({"documents": docs})

@app.post("/upload-doc")
def upload_doc():
    """
    multipart/form-data:
      - file: (pdf/docx/odt/txt)
      - document_id (optional): custom id; if omitted, derived from filename
    """
    if "file" not in request.files:
        return jsonify({"error": "file missing"}), 400

    f = request.files["file"]
    if not f.filename:
        return jsonify({"error": "empty filename"}), 400

    document_id = request.form.get("document_id") or make_document_id(f.filename)
    save_path = os.path.join(settings.DOCS_DIR, f"{document_id}_{f.filename}")
    f.save(save_path)

    try:
        text = extract_text(save_path)
        chunks = chunk_text(text)
        vectors = embed_texts(chunks, settings.EMBED_MODEL)
        upsert_chunks(
            qdrant, settings.COLLECTION_NAME, vectors,
            chunks, document_id=document_id, source_name=f.filename
        )
        return jsonify({
            "ok": True,
            "document_id": document_id,
            "chunks": len(chunks)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.post("/delete-doc")
def delete_doc():
    """
    JSON:
      - document_id: str
    """
    data = request.get_json(force=True)
    doc_id = data.get("document_id")
    if not doc_id:
        return jsonify({"error": "document_id is required"}), 400

    delete_document(qdrant, settings.COLLECTION_NAME, doc_id)
    return jsonify({"ok": True, "deleted_document_id": doc_id})

@app.post("/add_db")
def add_db():
    """
    JSON: {
      "name": "HR",
      "host": "...",
      "port": 5432,
      "dbname": "hr_db",
      "user": "postgres",
      "password": "..."
    }
    """
    data = request.get_json(force=True)
    db_name = data.get("name")
    if not db_name:
        return jsonify({"error": "Database name required"}), 400

    configs = load_db_configs()
    configs[db_name] = {
        "host": data["host"],
        "port": data["port"],
        "dbname": data["dbname"],
        "user": data["user"],
        "password": data["password"],
    }
    save_db_configs(configs)

    return jsonify({"success": True, "databases": list(configs.keys())})


@app.get("/list_dbs")
def list_dbs():
    """
    Returns list of configured databases
    Response: {
      "databases": ["db1", "db2", ...]
    }
    """
    configs = load_db_configs()
    return jsonify({"databases": list(configs.keys())})



@app.post("/query")
def query():
    """
    JSON:
      - query: str
      - db_selection: "auto" | "manual"
      - db_name: str (only if manual)
      - top_k, filter_document_id (for RAG)
    """
    data = request.get_json(force=True)
    q = data.get("query", "").strip()
    db_selection = data.get("db_selection", "auto")
    db_name = data.get("db_name")

    if not q:
        return jsonify({"error": "query is required"}), 400

    configs = load_db_configs()
    schemas = load_db_schemas(configs)   # <-- build schemas


    if db_selection == "manual":
        # user forces DB
        if not db_name or db_name not in configs:
            return jsonify({"error": "Invalid db_name"}), 400
        try:
            result = run_nl_sql(q, configs[db_name])
            return jsonify({"type": "structured", "db": db_name, **result})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    else:
        # auto → classifier decides if SQL or RAG
        decision = classify_query(q, schemas)
        mode = decision.get("mode")
        db_name = decision.get("db_name")

        if mode == "SQL":
            if not db_name or db_name not in configs:
                return jsonify({"error": f"No suitable database found"}), 400
            try:
                result = run_nl_sql(q, configs[db_name])
                return jsonify({"type": "structured", "db": db_name, **result})
            except Exception as e:
                return jsonify({"error": str(e)}), 500
        else:
            # fallback → RAG (unchanged)
            top_k = int(data.get("top_k", settings.TOP_K))
            filter_doc = data.get("filter_document_id")

            q_vec = embed_texts([q], settings.EMBED_MODEL)[0]
            hits = search_chunks(
                qdrant, settings.COLLECTION_NAME, q_vec,
                limit=top_k, filter_by_doc=filter_doc
            )

            answer = make_answer(
                settings.OPENAI_API_KEY, settings.OPENAI_MODEL, q, hits
            )

            sources = [
                {
                    "document_id": h["payload"]["document_id"],
                    "source": h["payload"]["source"],
                    "chunk_index": h["payload"]["chunk_index"],
                    "score": h["score"]
                } for h in hits
            ]

            return jsonify({"type": "unstructured", "answer": answer, "sources": sources})






if __name__ == "__main__":
    app.run(host="0.0.0.0", port=settings.PORT, debug=False, use_reloader=False)
