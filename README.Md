# QueryCraft

A hybrid **Retrieval-Augmented Generation (RAG)** application that supports:

- Answering natural-language questions from **uploaded documents** (Unstructured Mode)
- Generating and (optionally) executing **SQL queries** from natural-language (Structured Mode)

**Live App:** [https://query-craft-kappa.vercel.app/](https://query-craft-kappa.vercel.app/)


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
### Example curl:
```bash
curl "${API_URL}/health"
curl -F "file=@/path/to/doc.pdf" "${API_URL}/upload-doc"
curl "${API_URL}/list-docs"
curl -X POST -H "Content-Type: application/json" -d '{"document_id":"abc"}' "${API_URL}/delete-doc"
curl -X POST -H "Content-Type: application/json" -d '{"query":"How many users registered this month?"}' "${API_URL}/query"
```

- You can also Test in Postman for POST methods.


### Backend .env (example)

```bash
FLASK_ENV=production
FLASK_APP=app.py

# OpenAI
OPENAI_API_KEY=sk-...

# Qdrant
QDRANT_API_KEY=xxxxx
QDRANT_URL=https://<your-qdrant-host>

# Optional structured DB
DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_USER=...
DB_PASSWORD=...

# App
PORT=8000
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

## Production Deployment

### Backend — EC2 (Ubuntu) + Gunicorn + Nginx
1. Create and Ubuntu Instance on AWS management console
2. Amazon Linux is not feasible for alot of requirements.
3. Provision EC2 (Ubuntu). Open inbound ports: 22 (SSH), 80, 443. Restrict SSH by IP
4. Configure an additional inbound rule by opening Port 8000 to access backend on local machine.
5. SSH into instance, install packages
```bash
sudo apt update
sudo apt install python3 python3-venv python3-pip nginx certbot python3-certbot-nginx -y
```
6. Clone backend, create venv, install requirements.
7. manually test the app first
8. Create systemd service file
9. Configure Nginx site 
10. Enable and reload Nginx
11. Create an A-record for api.yourdomain.com pointing to your EC2 public IPv4.
12. Wait for DNS to propagate
13. Use Certbot on EC2 to provision Let’s Encrypt certs (Nginx integration will auto-configure HTTPS).
14. Step 13 is only necessary if your frontend is on Vercel.

## Qdrant + OpenAI (RAG flow)

### Indexing
Extract text from uploaded documents → chunk (e.g., 500–1000 tokens per chunk) → compute embeddings using chosen model → upload vectors + metadata to Qdrant collection.

### Query
Build embedding for query → Qdrant search → return top K chunks → construct prompt (include selected chunks + user query) → call OpenAI GPT-4 to synthesize final answer and optionally ask it to cite sources or produce SQL if the flow requires.

### Structured Flow
When request looks DB-related, generate SQL (by rules or using LLM + safety layer), parameterize placeholders, then execute against your DB and return rows.

### Tips
- Keep Qdrant and OpenAI keys in env vars.
- Cache embedding results / GPT outputs for repeated queries to reduce cost and latency.
- Tune Qdrant indexing (HNSW params) for latency vs recall tradeoffs.

## Dockerfile (backend) — for local testing
```bash
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```
- Image useful for local dev / CI. Production currently uses native EC2 deployment.

## Troubleshooting & Common Pitfalls

### Nginx config errors
client_max_body_size=100M is invalid — use client_max_body_size 100M;.

### Socket permission 
If UNIX socket cannot be accessed by Nginx, either set proper permissions or bind Gunicorn to 127.0.0.1:8000 and proxy to that.

### RDS Database
If you have your databases established locally u need to make your Databases on Aurora & RDS available on AWS and dump your sql in there and after that add the inbound rule to your RDS Security Group for it to be able to be accesed.

### Limitations of AWS free tier
You have to be careful of resource used, use only what is available 1gb RAM otherwise it may lead to OOM Kills and crash the entire instance.

### Certbot fails 
Confirm domain resolves to EC2 IP before running Certbot.

### High OpenAI cost 
Cache results and consider smaller models for non-critical flows.

