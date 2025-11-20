"""
Configuración de la base de datos
Equivalente a tu @Configuration de JPA en Spring
"""

from flask_sqlalchemy import SQLAlchemy

# Instancia global de SQLAlchemy (como EntityManager en JPA)
db = SQLAlchemy()


def init_db(app):
    """Inicializa la base de datos y crea las tablas"""
    with app.app_context():
        # Importar modelos para que SQLAlchemy los reconozca
        from backend.models import article
        from backend.models import user
        from backend.models import report

        # Crear todas las tablas si no existen
        db.create_all()
        print("✓ Base de datos inicializada correctamente")


def test_connection():
    """Prueba la conexión a la base de datos"""
    try:
        from sqlalchemy import text

        db.session.execute(text("SELECT 1"))
        return True, "Conexión exitosa a MySQL"
    except Exception as e:
        return False, f"Error de conexión: {str(e)}"
