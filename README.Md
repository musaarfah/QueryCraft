# QueryCraft

A hybrid **Retrieval-Augmented Generation (RAG)** application that supports:

- Answering natural-language questions from **uploaded documents** (Unstructured Mode)
- Generating and (optionally) executing **SQL queries** from natural-language (Structured Mode)

Built with:
- **Flask** (Python) backend
- **Next.js** (TypeScript) frontend
- **Qdrant (Cloud)** as vector DB (vector search)
- **OpenAI GPT-4** for LLM reasoning and query augmentation
- **Gunicorn + Nginx** for production backend
- **Vercel** for frontend hosting
- **GoDaddy** domain for production API hostname

> Note: A Docker image exists for backend testing, but production runs natively on an **EC2 Ubuntu** instance (you determined EC2 direct deployment to be more efficient for your workload).

---

## 🔧 Features

### 🔍 Unstructured Mode
- Upload PDF / DOCX / TXT (or text extracted from files)
- Chunk documents, build embeddings, and index them in **Qdrant Cloud**
- Perform semantic similarity search to retrieve relevant chunks
- Use **GPT-4** to synthesize final answers and optionally cite sources

### 📊 Structured Mode
- Generate safe SQL (or accept SQL) for structured database queries
- Optionally run queries against configured databases and return rows
- Return structured response format when query is DB-related

### ⚙️ Production & Dev Tools
- REST API endpoints consumed by a Next.js frontend
- Backend served by Gunicorn behind Nginx on EC2 Ubuntu
- Frontend deployed to Vercel (TypeScript)
- Domain configured via GoDaddy with HTTPS (Certbot / Let's Encrypt)
- Optional Dockerfile for local / staging testing

---

## 🗂 Project Structure (example)

```text

/ (repo root)
├── .gitignore
├── README.md # <-- you are editing this
├── frontend/
│ ├── app/ # Next.js app router (pages under app/)
│ ├── public/
│ ├── next.config.js
│ └── package.json
└── backend/
├── services/ # all backend modules / routes / helpers live here
│ ├── routes/
│ │ ├── structured.py
│ │ └── unstructured.py
│ ├── qdrant_client.py
│ ├── openai_client.py
│ ├── storage_manager.py
│ └── doc_processor.py
├── storage/ # uploaded documents are stored here (PDF/DOCX/TXT, etc.)
├── app.py # Flask app entry point
├── config.py # central config and env-loader helpers
├── Dockerfile
├── .env # example local env (do not commit secrets)
└── requirements.txt

```
## ⚙️ Installation (local development)

### 1. Clone repository
```bash
git clone <repo-url>
cd QueryCraft
```

## Backend (Flask)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # macOS / Linux
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
```

### Run dev server:
```bash
export FLASK_APP=app.py
export FLASK_ENV=development
flask run --host=127.0.0.1 --port=8000
```

### Or run with Gunicorn locally:
```bash
gunicorn --workers 2 --bind 127.0.0.1:8000 app:app
```
- To run on Gunicorn u have to ensure debug set to False and Use_Reloader is set to false

### API Endpoints (overview)
```text
GET /health
Response: { "status": "ok" }

POST /upload-doc
Content-type: multipart/form-data with file
Response: { "OK":"True","document_id": "<id>","chunks":"len(chunks") }

GET /list-docs
Response: { "documents": ["id1","id2", ...] }

POST /delete-doc
JSON body: { "document_id": "<id>" }
Response: {  "OK":"True", "deleted_document_id": "<id>" }

POST /query
JSON body: { "query": "<text>" }
Response: either:
Unstructured: { "type":"unstructured", "answer":"...", "sources":[ ... ] }
Structured: { "type":"structured", "db":"<db>", "sql":"...", "rows":[ ... ] }

```

## Frontend (Next.js + TypeScript)

```bash
cd ../frontend
npm install
# or pnpm install
```

### Create .env.local:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run dev
```bash
npm run dev
# visit http://localhost:3000
```

- note that the backend is made with Flask(CORS) Since it needs to access frontend on Port 3000

