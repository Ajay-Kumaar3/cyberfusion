from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Always resolve .env relative to this file, not the CWD
_env_path = Path(__file__).parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_env_path),
        env_file_encoding="utf-8-sig",  # handles Windows BOM
        extra="ignore",
    )

    database_url: str = "postgresql+psycopg://user:pass@host/db?sslmode=require"
    gemini_api_key: str = ""
    frontend_origin: str = "http://localhost:3000"


settings = Settings()
