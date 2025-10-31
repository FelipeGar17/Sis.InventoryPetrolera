"""
Script para crear el usuario administrador con password hasheado
"""
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

# Generar hash para la contraseña 'admin123'
password = 'admin123'
password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

print("=" * 60)
print("USUARIO ADMINISTRADOR")
print("=" * 60)
print(f"Usuario: admin")
print(f"Password: {password}")
print(f"Hash: {password_hash}")
print("=" * 60)
print("\nCopia este SQL para insertar el usuario:")
print(f"INSERT INTO users (username, email, password_hash, full_name, role, status)")
print(f"VALUES ('admin', 'admin@petrolera.com', '{password_hash}', 'Administrador del Sistema', 'ADMIN', 'ACTIVO');")
