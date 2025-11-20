"""
Modelo Report (Reporte/Nota de problemas)
Los operarios reportan problemas en equipos, el admin los gestiona
"""

from backend.config.database import db
from datetime import datetime


class Report(db.Model):
    """Entidad Report - Reportes de problemas en equipos"""

    __tablename__ = "reports"

    # Columnas
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    article_id = db.Column(db.Integer, db.ForeignKey("articles.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    report_type = db.Column(
        db.String(50), nullable=False
    )  # FALLA, MANTENIMIENTO, OBSERVACION, SOLICITUD
    message = db.Column(db.Text, nullable=False)  # descripción del problema
    status = db.Column(
        db.String(20), default="PENDIENTE"
    )  # PENDIENTE, EN_REVISION, RESUELTO, CERRADO
    admin_response = db.Column(db.Text)  # respuesta/acción tomada por el admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    # Relaciones (como @ManyToOne en JPA)
    article = db.relationship("Article", backref="reports", lazy=True)
    user = db.relationship("User", backref="reports", lazy=True)

    def to_dict(self):
        """Convierte el objeto a diccionario"""
        return {
            "id": self.id,
            "article_id": self.article_id,
            "user_id": self.user_id,
            "report_type": self.report_type,
            "message": self.message,
            "status": self.status,
            "admin_response": self.admin_response,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Report {self.id} - {self.report_type} by User {self.user_id}>"
