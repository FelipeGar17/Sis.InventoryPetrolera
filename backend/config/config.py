"""
Configuración de la aplicación
Similar a application.properties en Spring Boot
"""

import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()


class Config:
    """Clase de configuración principal"""

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ENV = os.getenv("FLASK_ENV", "development")
    DEBUG = ENV == "development"

    # Base de datos MySQL
    # Priorizar DATABASE_URL (Railway/Heroku style) o construir desde componentes
    DATABASE_URL = os.getenv("DATABASE_URL")

    if DATABASE_URL:
        # Si existe DATABASE_URL completa, usarla directamente
        # Forzar pymysql si Railway/Heroku usan mysql:// en lugar de mysql+pymysql://
        if DATABASE_URL.startswith("mysql://"):
            DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)
        SQLALCHEMY_DATABASE_URI = DATABASE_URL
    else:
        # Si no, construir desde componentes individuales
        DB_HOST = os.getenv("DB_HOST", "localhost")
        DB_PORT = os.getenv("DB_PORT", "3306")
        DB_USER = os.getenv("DB_USER", "root")
        DB_PASSWORD = os.getenv("DB_PASSWORD", "")
        DB_NAME = os.getenv("DB_NAME", "inventario_petrolera")
        SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

    # SQLAlchemy (ORM - equivalente a JPA/Hibernate)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = ENV == "development"  # Solo en desarrollo
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    # JSON
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = True

    # CORS (para producción)
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
