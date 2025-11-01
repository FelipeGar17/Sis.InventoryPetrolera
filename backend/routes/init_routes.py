"""
Rutas de inicialización (SOLO PARA SETUP INICIAL)
ELIMINAR EN PRODUCCIÓN después de usar
"""
from flask import Blueprint, jsonify
from backend.config.database import db
from backend.models.user import User
from flask_bcrypt import Bcrypt

bp = Blueprint('init', __name__, url_prefix='/api/init')
bcrypt = Bcrypt()

@bp.route('/admin', methods=['POST'])
def init_admin():
    """
    POST /api/init/admin
    Crea o regenera el usuario administrador con hash correcto
    ⚠️ ELIMINAR ESTE ENDPOINT EN PRODUCCIÓN DESPUÉS DE USAR
    """
    try:
        # Buscar admin existente
        admin = User.query.filter_by(username='admin').first()
        
        # Generar hash correcto
        correct_hash = bcrypt.generate_password_hash('admin123').decode('utf-8')
        
        if admin:
            # Actualizar admin existente
            old_hash = admin.password_hash[:60]
            admin.password_hash = correct_hash
            admin.status = 'ACTIVO'
            admin.role = 'ADMIN'
            admin.email = 'admin@petrolera.com'
            admin.full_name = 'Administrador del Sistema'
            db.session.commit()
            
            # Verificar que funciona
            if bcrypt.check_password_hash(admin.password_hash, 'admin123'):
                return jsonify({
                    'message': 'Usuario admin actualizado correctamente',
                    'user': admin.to_dict(),
                    'old_hash': old_hash,
                    'new_hash': admin.password_hash[:60],
                    'password_test': 'OK ✓'
                }), 200
            else:
                return jsonify({'error': 'Hash generado pero verificación falló'}), 500
        else:
            # Crear nuevo admin
            admin = User(
                username='admin',
                email='admin@petrolera.com',
                password_hash=correct_hash,
                full_name='Administrador del Sistema',
                role='ADMIN',
                status='ACTIVO'
            )
            db.session.add(admin)
            db.session.commit()
            
            return jsonify({
                'message': 'Usuario admin creado correctamente',
                'user': admin.to_dict(),
                'hash': admin.password_hash[:60],
                'password_test': 'OK ✓'
            }), 201
            
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/check', methods=['GET'])
def check_admin():
    """
    GET /api/init/check
    Verifica el estado del usuario admin
    """
    try:
        admin = User.query.filter_by(username='admin').first()
        
        if not admin:
            return jsonify({
                'exists': False,
                'message': 'No existe usuario admin'
            }), 404
        
        # Intentar verificar la contraseña
        password_valid = False
        error_msg = None
        try:
            password_valid = bcrypt.check_password_hash(admin.password_hash, 'admin123')
        except Exception as e:
            error_msg = str(e)
        
        return jsonify({
            'exists': True,
            'user': admin.to_dict(),
            'hash_sample': admin.password_hash[:60] + '...',
            'hash_length': len(admin.password_hash),
            'password_valid': password_valid,
            'error': error_msg
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
