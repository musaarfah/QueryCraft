import os
from dotenv import load_dotenv
import yaml

load_dotenv()

class Settings:
    def __init__(self):
        # Load multiple DBs from YAML
        with open("databases.yaml", "r") as f:
            self.DATABASES = yaml.safe_load(f)["databases"]

        # Environment configs
        self.FLASK_ENV = os.getenv("FLASK_ENV", "production")
        self.PORT = int(os.getenv("PORT", "8000"))

        self.QDRANT_URL  = os.getenv("QDRANT_URL")
        self.QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.OPENAI_MODEL   = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        self.EMBED_MODEL = os.getenv("EMBED_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        self.COLLECTION_NAME = os.getenv("COLLECTION_NAME", "company_docs")
        self.TOP_K = int(os.getenv("TOP_K", "5"))

        self.STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "storage"))
        self.DOCS_DIR = os.path.join(self.STORAGE_DIR, "documents")

        # 🔑 Admin key for securing /prompts and /update_prompt
        self.ADMIN_API_KEY = os.getenv("ADMIN_API_KEY", "changeme")  # fallback to 'changeme'

        # Default DB (from env, for backward compatibility)
        self.DB_CONFIG = {
            "host": os.getenv("PG_HOST", "localhost"),
            "port": int(os.getenv("PG_PORT", 5432)),
            "dbname": os.getenv("PG_DBNAME", "company_db"),
            "user": os.getenv("PG_USER", "postgres"),
            "password": os.getenv("PG_PASSWORD", "4321"),
        }

        self.AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
        self.AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
        self.S3_BUCKET = os.getenv("S3_BUCKET")

        # Celery / Redis
        self.REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

settings = Settings()
os.makedirs(settings.DOCS_DIR, exist_ok=True)
