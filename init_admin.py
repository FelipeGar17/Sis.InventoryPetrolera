"""
Script para inicializar el usuario administrador
Ejecutar una sola vez en producción
"""
from app import create_app
from backend.config.database import db
from backend.models.user import User
from flask_bcrypt import Bcrypt

def init_admin_user():
    """Crea o actualiza el usuario administrador"""
    app = create_app()
    bcrypt = Bcrypt(app)
    
    with app.app_context():
        # Buscar si ya existe el admin
        admin = User.query.filter_by(username='admin').first()
        
        # Hash correcto de la contraseña 'admin123'
        correct_hash = bcrypt.generate_password_hash('admin123').decode('utf-8')
        
        if admin:
            print(f"Usuario admin encontrado (ID: {admin.id})")
            print(f"Hash actual: {admin.password_hash[:60]}...")
            
            # Actualizar el hash de contraseña
            admin.password_hash = correct_hash
            admin.status = 'ACTIVO'
            admin.role = 'ADMIN'
            db.session.commit()
            print("✓ Contraseña del admin actualizada correctamente")
        else:
            # Crear nuevo usuario admin
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
            print(f"✓ Usuario admin creado correctamente (ID: {admin.id})")
        
        # Verificar que el hash funciona
        test_password = 'admin123'
        if bcrypt.check_password_hash(admin.password_hash, test_password):
            print("✓ Verificación de contraseña exitosa")
        else:
            print("✗ ERROR: La verificación de contraseña falló")
        
        return admin

if __name__ == '__main__':
    print("Inicializando usuario administrador...")
    admin = init_admin_user()
    print(f"\nCredenciales de acceso:")
    print(f"Usuario: {admin.username}")
    print(f"Contraseña: admin123")
    print(f"Rol: {admin.role}")
    print(f"Estado: {admin.status}")
