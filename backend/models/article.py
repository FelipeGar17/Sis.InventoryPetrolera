"""
Modelo Article (Artículo de inventario)
Equivalente a @Entity en Spring/JPA
"""

from backend.config.database import db
from datetime import datetime


class Article(db.Model):
    """Entidad Article - Artículos del inventario"""

    __tablename__ = "articles"

    # Columnas (como @Column en JPA)
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    code = db.Column(db.String(50), unique=True, nullable=False, index=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    tipo = db.Column(
        db.String(100)
    )  # maquinaria grande, pequeña, electrica, herramienta
    category = db.Column(db.String(100))  # categoria especifica
    unit = db.Column(db.String(50))  # unidad de medida: piezas, litros, kg, etc.
    stock_min = db.Column(db.Integer, default=0)
    stock_current = db.Column(db.Integer, default=0)
    location = db.Column(db.String(100))  # ubicacion fisica (root)
    status = db.Column(
        db.String(20), default="FUNCIONANDO"
    )  # FUNCIONANDO, MANTENIMIENTO, REVISION, BAJA
    acquisition_date = db.Column(db.Date)  # fecha de adquisicion
    observations = db.Column(db.Text)  # observaciones generales
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    def to_dict(self):
        """Convierte el objeto a diccionario (como un DTO)"""
        return {
            "id": self.id,
            "code": self.code,
            "name": self.name,
            "description": self.description,
            "tipo": self.tipo,
            "category": self.category,
            "unit": self.unit,
            "stock_min": self.stock_min,
            "stock_current": self.stock_current,
            "location": self.location,
            "status": self.status,
            "acquisition_date": (
                self.acquisition_date.isoformat() if self.acquisition_date else None
            ),
            "observations": self.observations,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Article {self.code} - {self.name}>"
