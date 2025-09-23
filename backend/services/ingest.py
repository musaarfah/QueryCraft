import os
import uuid
import fitz
from docx import Document
import pypandoc

def extract_text_from_pdf(file_path):
    text = []
    with fitz.open(file_path) as doc:
        for page in doc:
            text.append(page.get_text())
    return "\n".join(text)

def extract_text_from_pdf_stream(body):
    data = body.read()
    text = []
    with fitz.open(stream=data, filetype="pdf") as doc:
        for page in doc:
            text.append(page.get_text())
    return "\n".join(text)

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    return "\n".join(p.text for p in doc.paragraphs)

def extract_text_from_odt(file_path):
    return pypandoc.convert_file(file_path, 'plain', format='odt')

def extract_text_from_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def extract_text(file_path: str) -> str:
    if not os.path.exists(file_path):
        raise FileNotFoundError(file_path)
    lower = file_path.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    if lower.endswith(".docx"):
        return extract_text_from_docx(file_path)
    if lower.endswith(".odt"):
        return extract_text_from_odt(file_path)
    if lower.endswith(".txt"):
        return extract_text_from_txt(file_path)
    raise ValueError("Unsupported file format")

def make_document_id(filename: str) -> str:
    stem = os.path.splitext(os.path.basename(filename))[0]
    return f"{stem}-{uuid.uuid4().hex[:8]}"
