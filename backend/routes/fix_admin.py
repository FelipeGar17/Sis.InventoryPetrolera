"""
Endpoint de emergencia para arreglar el hash del admin
SE AUTO-ELIMINA DESPUÉS DE UN USO EXITOSO
"""
from flask import Blueprint, jsonify
from backend.config.database import db
from backend.models.user import User
from flask_bcrypt import Bcrypt
import os

bp = Blueprint('fix', __name__, url_prefix='/api/emergency')
bcrypt = Bcrypt()

# Flag para auto-destrucción
ALREADY_USED = False

@bp.route('/fix-admin-hash', methods=['POST'])
def fix_admin_hash():
    """
    POST /api/emergency/fix-admin-hash
    Regenera el hash del usuario admin con ID=1
    Solo se puede usar UNA VEZ
    """
    global ALREADY_USED
    
    if ALREADY_USED:
        return jsonify({
            'error': 'Este endpoint ya fue utilizado y está deshabilitado',
            'message': 'Elimina el archivo backend/routes/fix_admin.py y reinicia la app'
        }), 403
    
    try:
        # Buscar usuario con id=1
        admin = User.query.get(1)
        
        if not admin:
            return jsonify({'error': 'No existe usuario con ID=1'}), 404
        
        # Generar hash correcto
        correct_hash = bcrypt.generate_password_hash('admin123').decode('utf-8')
        
        # Actualizar
        admin.password_hash = correct_hash
        admin.username = 'admin'
        admin.role = 'ADMIN'
        admin.status = 'ACTIVO'
        db.session.commit()
        
        # Verificar
        if bcrypt.check_password_hash(admin.password_hash, 'admin123'):
            ALREADY_USED = True  # Auto-deshabilitar
            return jsonify({
                'success': True,
                'message': '✓ Hash del admin regenerado correctamente',
                'user': {
                    'id': admin.id,
                    'username': admin.username,
                    'role': admin.role,
                    'status': admin.status
                },
                'hash': admin.password_hash[:60] + '...',
                'test': 'Password válida ✓',
                'warning': '⚠️ Este endpoint ahora está deshabilitado. Elimina fix_admin.py'
            }), 200
        else:
            return jsonify({'error': 'Hash generado pero verificación falló'}), 500
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
