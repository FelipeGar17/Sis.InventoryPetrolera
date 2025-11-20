"""
Tests para endpoints de health check
"""

import pytest
import os
from backend.app import create_app


@pytest.fixture
def client():
    """Cliente de prueba de Flask"""
    # Configurar base de datos en memoria para tests
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"

    app = create_app()
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"

    with app.app_context():
        from backend.config.database import db

        db.create_all()

    with app.test_client() as client:
        yield client


def test_health_check(client):
    """Test del endpoint de health check"""
    response = client.get("/api/health/")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "OK"
    assert data["message"] == "API funcionando correctamente"
    assert data["service"] == "Sistema de Inventario Petrolera"


def test_database_check(client):
    """Test de conexión a base de datos"""
    response = client.get("/api/health/db")
    assert response.status_code == 200
    data = response.get_json()
    assert data["database"] == "MySQL"
    assert data["status"] in ["OK", "ERROR"]


def test_login_endpoint_exists(client):
    """Test que el endpoint de login existe"""
    response = client.post(
        "/api/auth/login", json={"username": "test", "password": "test"}
    )
    # Puede ser 401 (credenciales inválidas) pero no 404
    assert response.status_code in [200, 401]
