"""
Configuración principal de Flask
Similar a tu clase @SpringBootApplication en Spring
"""
from flask import Flask
from flask_cors import CORS
from backend.config.config import Config
from backend.config.database import db, init_db

def create_app():
    """Factory para crear la aplicación Flask"""
    app = Flask(__name__, 
                static_folder='../frontend/static',
                template_folder='../frontend/templates')
    
    # Cargar configuración
    app.config.from_object(Config)
    
    # Habilitar CORS (permitir peticiones desde el frontend)
    CORS(app)
    
    # Inicializar base de datos
    db.init_app(app)
    init_db(app)
    
    # Registrar rutas (blueprints = controllers en Spring)
    register_blueprints(app)
    
    return app

def register_blueprints(app):
    """Registra todas las rutas de la API"""
    from backend.routes import main_routes
    from backend.routes import health_routes
    from backend.routes import article_routes
    from backend.routes import auth_routes
    from backend.routes import user_routes
    from backend.routes import report_routes
    from backend.routes import fix_admin  # EMERGENCIA - ELIMINAR DESPUÉS DE USAR
    
    app.register_blueprint(main_routes.bp)
    app.register_blueprint(health_routes.bp)
    app.register_blueprint(article_routes.bp)
    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(user_routes.bp)
    app.register_blueprint(report_routes.bp)
    app.register_blueprint(fix_admin.bp)  # EMERGENCIA
