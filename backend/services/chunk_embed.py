from langchain.text_splitter import RecursiveCharacterTextSplitter  # langchain-text-splitter (installed with langchain or separately)
from sentence_transformers import SentenceTransformer
import numpy as np

# Keep a single global model instance (warm, fast)
_model_cache = {}

def get_embedder(model_name: str):
    if model_name not in _model_cache:
        _model_cache[model_name] = SentenceTransformer(model_name)
    return _model_cache[model_name]

def chunk_text(text: str, chunk_size=700, chunk_overlap=100):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    return splitter.split_text(text)

def embed_texts(texts, model_name: str):
    model = get_embedder(model_name)
    # batch encode for speed
    vectors = model.encode(texts, batch_size=64, convert_to_numpy=True, show_progress_bar=False, normalize_embeddings=True)
    # ensure float32
    return np.asarray(vectors, dtype=np.float32)

def embedding_dim(model_name: str) -> int:
    # MiniLM-L6-v2 = 384
    model = get_embedder(model_name)
    return int(model.get_sentence_embedding_dimension())
