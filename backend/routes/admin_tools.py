"""
Endpoint permanente de diagnóstico y reparación del admin
"""

from flask import Blueprint, jsonify, request
from backend.config.database import db
from backend.models.user import User
from flask_bcrypt import Bcrypt

bp = Blueprint("admin_tools", __name__, url_prefix="/api/admin-tools")
bcrypt = Bcrypt()


@bp.route("/check-admin", methods=["GET"])
def check_admin():
    """
    GET /api/admin-tools/check-admin
    Verifica el estado del usuario admin
    """
    try:
        admin = User.query.get(1)

        if not admin:
            return (
                jsonify({"exists": False, "message": "No existe usuario con ID=1"}),
                404,
            )

        # Intentar verificar la contraseña
        password_test = None
        error = None
        try:
            password_test = bcrypt.check_password_hash(admin.password_hash, "admin123")
        except Exception as e:
            error = str(e)

        return (
            jsonify(
                {
                    "exists": True,
                    "user": {
                        "id": admin.id,
                        "username": admin.username,
                        "email": admin.email,
                        "role": admin.role,
                        "status": admin.status,
                    },
                    "hash_info": {
                        "length": len(admin.password_hash),
                        "starts_with": admin.password_hash[:10],
                        "is_bcrypt_format": admin.password_hash.startswith("$2b$"),
                    },
                    "password_test": {"valid": password_test, "error": error},
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/fix-admin", methods=["POST"])
def fix_admin():
    """
    POST /api/admin-tools/fix-admin
    Regenera el hash del usuario admin
    Puede ejecutarse múltiples veces sin problema
    """
    try:
        # Buscar usuario con id=1
        admin = User.query.get(1)

        if not admin:
            return jsonify({"error": "No existe usuario con ID=1"}), 404

        # Guardar hash anterior para comparación
        old_hash = admin.password_hash

        # Generar hash correcto
        new_hash = bcrypt.generate_password_hash("admin123").decode("utf-8")

        # Actualizar
        admin.password_hash = new_hash
        admin.username = "admin"
        admin.email = "admin@petrolera.com"
        admin.full_name = "Administrador del Sistema"
        admin.role = "ADMIN"
        admin.status = "ACTIVO"

        # Commit explícito
        db.session.commit()

        # Refrescar desde DB para asegurar
        db.session.refresh(admin)

        # Verificar que se guardó correctamente
        admin_check = User.query.get(1)
        password_works = bcrypt.check_password_hash(
            admin_check.password_hash, "admin123"
        )

        return (
            jsonify(
                {
                    "success": True,
                    "message": "Hash del admin regenerado correctamente",
                    "old_hash": old_hash[:60] + "...",
                    "new_hash": admin_check.password_hash[:60] + "...",
                    "password_test": "VÁLIDO ✓" if password_works else "INVÁLIDO ✗",
                    "user": {
                        "id": admin_check.id,
                        "username": admin_check.username,
                        "role": admin_check.role,
                        "status": admin_check.status,
                    },
                }
            ),
            200,
        )

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e), "type": type(e).__name__}), 500
