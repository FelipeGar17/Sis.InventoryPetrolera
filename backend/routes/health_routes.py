"""
Rutas de salud del sistema (health check)
Equivalente a un @RestController en Spring
"""
from flask import Blueprint, jsonify
from backend.config.database import test_connection

# Blueprint = agrupación de rutas (como @RequestMapping en Spring)
bp = Blueprint('health', __name__, url_prefix='/api/health')

@bp.route('/', methods=['GET'])
def health_check():
    """
    GET /api/health/
    Verifica que la API esté funcionando
    """
    return jsonify({
        'status': 'OK',
        'message': 'API funcionando correctamente',
        'service': 'Sistema de Inventario Petrolera'
    }), 200

@bp.route('/db', methods=['GET'])
def database_check():
    """
    GET /api/health/db
    Verifica la conexión a la base de datos
    """
    success, message = test_connection()
    
    return jsonify({
        'status': 'OK' if success else 'ERROR',
        'database': 'MySQL',
        'message': message
    }), 200 if success else 500
