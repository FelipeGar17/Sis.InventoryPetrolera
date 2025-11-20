"""
Rutas principales del frontend
"""

from flask import Blueprint, render_template

bp = Blueprint("main", __name__)


@bp.route("/")
def index():
    """Redirige al login"""
    return render_template("login.html")


@bp.route("/login")
def login():
    """Página de login"""
    return render_template("login.html")


@bp.route("/dashboard")
def dashboard():
    """Página principal del sistema (requiere autenticación)"""
    # TODO: Redirigir según rol del usuario
    return render_template("admin/dashboard.html")


@bp.route("/dashboard/operario")
def dashboard_operario():
    """Dashboard para operarios (solo lectura)"""
    return render_template("operario/dashboard.html")


@bp.route("/clear-session")
def clear_session():
    """Página para limpiar sesión"""
    return render_template("clear-session.html")


@bp.route("/diagnostico")
def diagnostico():
    """Página de diagnóstico de sesión"""
    return render_template("diagnostico.html")
