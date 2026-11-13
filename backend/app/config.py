import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    PROJECT_NAME: str = "Cloud Deployment & CI/CD – School Management Platform"
    CANDIDATE_NAME: str = "Prince Kumar"
    REGISTRATION_NUMBER: str = "12314718"
    COMPANY: str = "ALGIONS AI LABS PRIVATE LIMITED"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/school_db"
    )

    # JWT Authentication
    SECRET_KEY: str = os.getenv("SECRET_KEY", "algions-devops-secret-key-super-secure-2026-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:80",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:80",
        "https://localhost",
        "https://127.0.0.1",
    ]

    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()
