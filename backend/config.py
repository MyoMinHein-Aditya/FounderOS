from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./test.db"
    ENVIRONMENT: str = "dev"
    SECRET_KEY: str = "super_secret"
    ALGORITHM: str = "HS256"
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
