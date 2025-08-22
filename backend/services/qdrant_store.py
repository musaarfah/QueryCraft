import uuid
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue, PayloadSchemaType
from .chunk_embed import embedding_dim

def get_qdrant_client(host=None, port=None, url=None, api_key=None,timeout: float = 30.0) -> QdrantClient:
    if url:
        return QdrantClient(url=url, api_key=api_key, prefer_grpc=False, timeout=timeout)
    return QdrantClient(host=host or "localhost", port=int(port or 6333), timeout=timeout)

def ensure_collection(client: QdrantClient, collection_name: str, vector_size: int):
    collections = [c.name for c in client.get_collections().collections]
    if collection_name not in collections:
        client.recreate_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
            payload_schema={
                "document_id": PayloadSchemaType.KEYWORD
            }
        )

    # Ensure document_id is indexed for filtering
    try:
        client.create_payload_index(
            collection_name=collection_name,
            field_name="document_id",
            field_schema=PayloadSchemaType.KEYWORD  # just use this
        )
    except Exception as e:
        print(f"Payload index creation skipped (probably exists): {e}")


def upsert_chunks(
    client: QdrantClient,
    collection: str,
    vectors,
    chunks: List[str],
    document_id: str,
    source_name: str,
):
    points = []
    for i, (vec, text) in enumerate(zip(vectors, chunks)):
        points.append(PointStruct(
            id=str(uuid.uuid4()),
            vector=vec,
            payload={
                "document_id": document_id,
                "chunk_index": i,
                "source": source_name,
                "text": text,
            }
        ))
    client.upsert(collection_name=collection, points=points)

def search_chunks(
    client: QdrantClient,
    collection: str,
    query_vector,
    limit: int = 5,
    filter_by_doc: Optional[str] = None,
):
    flt = None
    if filter_by_doc:
        flt = Filter(
            must=[FieldCondition(key="document_id", match=MatchValue(value=filter_by_doc))]
        )

    # Option 1: Using query_points (recommended for newer versions)
    try:
        results = client.query_points(
            collection_name=collection,
            query=query_vector,
            limit=limit,
            with_payload=True,
            query_filter=flt,
        )
        
        return [
            {
                "id": str(point.id),
                "score": float(point.score),
                "payload": point.payload,
            }
            for point in results.points
        ]
    except AttributeError:
        # Option 2: Fallback to search method for older versions
        results = client.search(
            collection_name=collection,
            query_vector=query_vector,
            limit=limit,
            with_payload=True,
            query_filter=flt,
        )
        
        return [
            {
                "id": str(point.id),
                "score": float(point.score),
                "payload": point.payload,
            }
            for point in results
        ]

def list_documents(client: QdrantClient, collection: str):
    # List unique document_ids (cheap approach: scroll and aggregate)
    unique = set()
    for point in client.scroll(collection, with_payload=True, limit=2048)[0]:
        unique.add(point.payload.get("document_id"))
    return sorted([u for u in unique if u])

def delete_document(client: QdrantClient, collection: str, document_id: str):
    flt = Filter(
        must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
    )
    client.delete(collection_name=collection, points_selector=flt)
