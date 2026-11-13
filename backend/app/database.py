import logging
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger("school_platform")

raw_db_url = settings.DATABASE_URL

# Normalize postgresql:// to postgresql+psycopg2:// for SQLAlchemy 2.0
if raw_db_url.startswith("postgresql://") and not raw_db_url.startswith("postgresql+"):
    database_url = raw_db_url.replace("postgresql://", "postgresql+psycopg2://", 1)
else:
    database_url = raw_db_url

# Handle SQLite vs PostgreSQL connect arguments
connect_args = {}
if database_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    engine = create_engine(
        database_url,
        connect_args=connect_args,
        echo=False
    )
else:
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_connection() -> bool:
    """Verifies active connectivity to the database engine."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")
        return False


def init_db():
    """Idempotently initialize database tables if connected."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.warning(f"Database schema auto-creation skipped or deferred: {e}")
