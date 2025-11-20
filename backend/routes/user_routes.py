"""
Rutas de Usuarios (CRUD para admin)
Solo accesible por administradores
"""

from flask import Blueprint, jsonify, request
from backend.config.database import db
from backend.models.user import User
from flask_bcrypt import Bcrypt
import jwt
import os

bp = Blueprint("users", __name__, url_prefix="/api/users")
bcrypt = Bcrypt()


def verify_admin_token():
    """Verifica que el token sea válido y sea de un admin"""
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return None, jsonify({"error": "No autorizado"}), 401

    try:
        token = auth_header.split(" ")[1]
        payload = jwt.decode(
            token, os.getenv("SECRET_KEY", "dev-secret-key"), algorithms=["HS256"]
        )

        if payload["role"] != "ADMIN":
            return None, jsonify({"error": "Solo administradores"}), 403

        return payload, None, None
    except:
        return None, jsonify({"error": "Token inválido"}), 401


@bp.route("/", methods=["GET"])
def get_all_users():
    """
    GET /api/users/
    Obtener todos los usuarios (solo admin)
    """
    payload, error_response, status_code = verify_admin_token()
    if error_response:
        return error_response, status_code

    users = User.query.all()
    return jsonify([user.to_dict() for user in users]), 200


@bp.route("/<int:id>", methods=["GET"])
def get_user(id):
    """
    GET /api/users/{id}
    Obtener un usuario por ID
    """
    payload, error_response, status_code = verify_admin_token()
    if error_response:
        return error_response, status_code

    user = User.query.get_or_404(id)
    return jsonify(user.to_dict()), 200


@bp.route("/", methods=["POST"])
def create_user():
    """
    POST /api/users/
    Crear nuevo usuario (solo admin)
    """
    payload, error_response, status_code = verify_admin_token()
    if error_response:
        return error_response, status_code

    data = request.get_json()

    # Validaciones
    required_fields = ["username", "email", "password", "full_name"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"El campo {field} es requerido"}), 400

    # Normalizar datos
    username = data["username"].strip().lower()
    email = data["email"].strip().lower()

    # Verificar duplicados
    if User.query.filter_by(username=username).first():
        return jsonify({"error": f"El usuario {username} ya existe"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": f"El email {email} ya está registrado"}), 400

    # No permitir crear administradores (solo puede haber uno)
    if data.get("role") == "ADMIN":
        return (
            jsonify(
                {
                    "error": "No se pueden crear más administradores. El sistema tiene un único administrador."
                }
            ),
            403,
        )

    # Crear usuario (siempre como USER/Operario)
    password_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    user = User(
        username=username,
        email=email,
        password_hash=password_hash,
        full_name=data["full_name"].strip().title(),
        role="USER",  # Siempre crear como operario
    )

    try:
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@bp.route("/<int:id>", methods=["PUT"])
def update_user(id):
    """
    PUT /api/users/{id}
    Actualizar usuario existente
    """
    payload, error_response, status_code = verify_admin_token()
    if error_response:
        return error_response, status_code

    user = User.query.get_or_404(id)
    data = request.get_json()

    # No permitir modificar el usuario admin principal
    if user.id == 1 and data.get("role") != "ADMIN":
        return (
            jsonify(
                {"error": "No se puede cambiar el rol del administrador principal"}
            ),
            400,
        )

    # No permitir cambiar a rol ADMIN (solo puede haber un admin)
    if data.get("role") == "ADMIN" and user.role != "ADMIN":
        return jsonify({"error": "No se pueden crear más administradores"}), 403

    # Actualizar campos
    if "full_name" in data:
        user.full_name = data["full_name"].strip().title()

    if "email" in data:
        new_email = data["email"].strip().lower()
        existing = User.query.filter_by(email=new_email).first()
        if existing and existing.id != user.id:
            return jsonify({"error": f"El email {new_email} ya está en uso"}), 400
        user.email = new_email

    if "role" in data:
        user.role = data["role"]

    if "password" in data and data["password"]:
        user.password_hash = bcrypt.generate_password_hash(data["password"]).decode(
            "utf-8"
        )

    try:
        db.session.commit()
        return jsonify(user.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@bp.route("/<int:id>", methods=["DELETE"])
def deactivate_user(id):
    """
    DELETE /api/users/{id}
    Desactivar usuario (cambiar status a INACTIVO)
    No se elimina físicamente
    """
    payload, error_response, status_code = verify_admin_token()
    if error_response:
        return error_response, status_code

    user = User.query.get_or_404(id)

    # No permitir desactivar al admin principal
    if user.id == 1:
        return (
            jsonify({"error": "No se puede desactivar el administrador principal"}),
            400,
        )

    # Cambiar status en lugar de eliminar
    user.status = "INACTIVO"

    try:
        db.session.commit()
        return jsonify({"message": "Usuario desactivado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@bp.route("/<int:id>/activate", methods=["PUT"])
def activate_user(id):
    """
    PUT /api/users/{id}/activate
    Activar usuario (cambiar status a ACTIVO)
    """
    payload, error_response, status_code = verify_admin_token()
    if error_response:
        return error_response, status_code

    user = User.query.get_or_404(id)
    user.status = "ACTIVO"

    try:
        db.session.commit()
        return jsonify({"message": "Usuario activado correctamente"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
