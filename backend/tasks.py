import io
from celery import shared_task
from sqlalchemy.orm import Session

from config import settings
from celery_app import celery_app
from s3_client import get_object_stream
from services.ingest import extract_text_from_pdf_stream
from services.chunk_embed import chunk_text, embed_texts
from services.qdrant_store import get_qdrant_client, upsert_chunks
from db import Documents, SessionLocal


@celery_app.task(name="process_document_task")
def process_document_task(record_id: str, document_id: str, s3_key: str, filename: str) -> None:
    db: Session = SessionLocal()
    try:
        # Stream file from S3
        body = get_object_stream(settings.S3_BUCKET, s3_key)
        # NOTE: Support only PDF stream path here; fall back to temp-file for other types if needed
        text = extract_text_from_pdf_stream(body)

        # Chunk + embed
        chunks = chunk_text(text)
        vectors = embed_texts(chunks, settings.EMBED_MODEL)

        # Upsert into Qdrant
        qdrant = get_qdrant_client(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY, timeout=30.0)
        from services.chunk_embed import embedding_dim  # ensure collection exists if needed
        from services.qdrant_store import ensure_collection
        ensure_collection(qdrant, settings.COLLECTION_NAME, embedding_dim(settings.EMBED_MODEL))
        upsert_chunks(qdrant, settings.COLLECTION_NAME, vectors, chunks, document_id, filename)

        # Update DB status
        rec = db.get(Documents, document_id)
        if rec:
            rec.status = "processed"
            rec.chunks = len(chunks)
        db.commit()
    except Exception as e:
        rec = db.get(Documents, document_id)
        if rec:
            rec.status = "error"
        db.commit()
        raise
    finally:
        db.close()


