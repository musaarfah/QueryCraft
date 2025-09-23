from typing import Generator

from sqlalchemy import create_engine, Column, String, Integer, DateTime, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from config import settings


def _build_pg_url() -> str:
    cfg = settings.DB_CONFIG
    return (
        f"postgresql+psycopg2://{cfg['user']}:{cfg['password']}@"
        f"{cfg['host']}:{cfg['port']}/{cfg['dbname']}"
    )


engine = create_engine(_build_pg_url(), pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


class Documents(Base):
    __tablename__ = "documents"
    __table_args__ = {"schema": "public"}

    # Existing schema:
    # id         | text (not null)
    # file_url   | text
    # status     | text
    # chunks     | integer default 0
    # created_at | timestamp without time zone default now()
    id = Column(String, primary_key=True)  # use document_id as id
    file_url = Column(String)
    status = Column(String)
    chunks = Column(Integer)
    created_at = Column(DateTime, server_default=text("now()"))


def init_db() -> None:
    # Using an existing table managed outside migrations; no-op to avoid DDL.
    return None


def get_db_session() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


