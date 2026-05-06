from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""

    # Redis
    redis_url: str = "redis://localhost:6379"

    # CORS
    cors_origins: str = "http://localhost:5173"

    # App
    debug: bool = True
    app_name: str = "CyberSphere AI"
    app_version: str = "1.0.0"

    # ML
    enable_ml_inference: bool = False  # Toggled on in Wave 5
    model_dir: str = "ml/models"

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
