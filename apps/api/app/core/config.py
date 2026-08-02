from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str = 'sqlite+aiosqlite:///./fraudshield.db'
    SECRET_KEY: str = 'insecure_dev_secret_key_override_in_prod'
    ALGORITHM: str = 'HS256'
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: list[str] = ['http://localhost:3000']
    ENVIRONMENT: str = 'development'
    MODEL_DIR: str = '../../ml/models'
    LOG_LEVEL: str = 'INFO'
    APP_NAME: str = 'FraudShield AI'
    APP_VERSION: str = '1.0.0'
    
    model_config = SettingsConfigDict(env_file='.env', case_sensitive=True)

@lru_cache
def get_settings() -> Settings:
    return Settings()
