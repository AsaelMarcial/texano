from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Base de Datos
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "pos_texano"
    DB_PASSWORD: str = "tu_password_seguro"
    DB_NAME: str = "pos_texano"

    # JWT
    JWT_SECRET: str = "cambiar_en_produccion"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 480

    # Admin seed
    ADMIN_EMAIL: str = "admin@texano.com"
    ADMIN_PASSWORD: str = "admin123"
    ADMIN_NOMBRE: str = "Administrador"
    ADMIN_APELLIDO: str = "Texano"

    # Servidor
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    APP_RELOAD: bool = True

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.DB_USER}:{self.DB_PASSWORD}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()

