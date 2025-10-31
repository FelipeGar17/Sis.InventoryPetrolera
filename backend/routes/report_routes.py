"""
Rutas para gestión de reportes/notas
Operarios reportan problemas, admin los gestiona
"""
from flask import Blueprint, request, jsonify
from backend.config.database import db
from backend.models.report import Report
from backend.models.article import Article
from backend.models.user import User
from datetime import datetime
import jwt
import os
from functools import wraps

bp = Blueprint('reports', __name__, url_prefix='/api/reports')

def verify_token():
    """Verifica el token JWT y retorna el usuario"""
    token = request.headers.get('Authorization')
    if not token:
        return None
    
    try:
        token = token.replace('Bearer ', '')
        payload = jwt.decode(token, os.getenv('SECRET_KEY', 'dev-secret-key'), algorithms=['HS256'])
        user = User.query.get(payload['user_id'])
        return user
    except:
        return None

def token_required(f):
    """Decorador para rutas que requieren autenticación"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = verify_token()
        if not user:
            return jsonify({'message': 'Token inválido o expirado'}), 401
        return f(user, *args, **kwargs)
    return decorated

def admin_required(f):
    """Decorador para rutas que requieren rol ADMIN"""
    @wraps(f)
    def decorated(*args, **kwargs):
        user = verify_token()
        if not user or user.role != 'ADMIN':
            return jsonify({'message': 'Acceso denegado. Se requiere rol de administrador'}), 403
        return f(user, *args, **kwargs)
    return decorated

# ============================================
# RUTAS PARA OPERARIOS
# ============================================

@bp.route('/my-reports', methods=['GET'])
@token_required
def get_my_reports(current_user):
    """Obtiene los reportes del operario autenticado"""
    try:
        reports = Report.query.filter_by(user_id=current_user.id).order_by(Report.created_at.desc()).all()
        
        reports_list = []
        for report in reports:
            article = Article.query.get(report.article_id)
            reports_list.append({
                'id': report.id,
                'article': {
                    'id': article.id,
                    'code': article.code,
                    'name': article.name
                },
                'report_type': report.report_type,
                'message': report.message,
                'status': report.status,
                'created_at': report.created_at.isoformat(),
                'updated_at': report.updated_at.isoformat() if report.updated_at else None,
                'admin_response': report.admin_response
            })
        
        return jsonify(reports_list), 200
    except Exception as e:
        return jsonify({'message': f'Error al obtener reportes: {str(e)}'}), 500

@bp.route('/', methods=['POST'])
@token_required
def create_report(current_user):
    """Crea un nuevo reporte (operario reporta problema en un equipo)"""
    try:
        data = request.get_json()
        
        # Validar datos requeridos
        if not data.get('article_id') or not data.get('report_type') or not data.get('message'):
            return jsonify({'message': 'Faltan datos requeridos: article_id, report_type, message'}), 400
        
        # Validar que el artículo existe
        article = Article.query.get(data['article_id'])
        if not article:
            return jsonify({'message': 'El artículo especificado no existe'}), 404
        
        # Validar tipo de reporte
        valid_types = ['FALLA', 'MANTENIMIENTO', 'OBSERVACION', 'SOLICITUD']
        if data['report_type'] not in valid_types:
            return jsonify({'message': f'Tipo de reporte inválido. Debe ser uno de: {", ".join(valid_types)}'}), 400
        
        # Crear reporte
        new_report = Report(
            article_id=data['article_id'],
            user_id=current_user.id,
            report_type=data['report_type'],
            message=data['message'].strip(),
            status='PENDIENTE'
        )
        
        db.session.add(new_report)
        db.session.commit()
        
        return jsonify({
            'id': new_report.id,
            'message': 'Reporte creado exitosamente',
            'article_id': new_report.article_id,
            'report_type': new_report.report_type,
            'status': new_report.status,
            'created_at': new_report.created_at.isoformat()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al crear reporte: {str(e)}'}), 500

# ============================================
# RUTAS PARA ADMIN
# ============================================

@bp.route('/all', methods=['GET'])
@admin_required
def get_all_reports(current_user):
    """Obtiene todos los reportes (solo admin)"""
    try:
        # Filtros opcionales
        status_filter = request.args.get('status')
        
        query = Report.query
        
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        reports = query.order_by(Report.created_at.desc()).all()
        
        reports_list = []
        for report in reports:
            article = Article.query.get(report.article_id)
            user = User.query.get(report.user_id)
            
            reports_list.append({
                'id': report.id,
                'article': {
                    'id': article.id,
                    'code': article.code,
                    'name': article.name,
                    'tipo': article.tipo,
                    'status': article.status
                },
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'full_name': user.full_name
                },
                'report_type': report.report_type,
                'message': report.message,
                'status': report.status,
                'created_at': report.created_at.isoformat(),
                'updated_at': report.updated_at.isoformat() if report.updated_at else None,
                'admin_response': report.admin_response
            })
        
        return jsonify(reports_list), 200
    except Exception as e:
        return jsonify({'message': f'Error al obtener reportes: {str(e)}'}), 500

@bp.route('/<int:report_id>', methods=['PUT'])
@admin_required
def update_report(current_user, report_id):
    """Actualiza el estado de un reporte y/o agrega respuesta del admin"""
    try:
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'message': 'Reporte no encontrado'}), 404
        
        data = request.get_json()
        
        # Actualizar estado si se proporciona
        if 'status' in data:
            valid_statuses = ['PENDIENTE', 'EN_REVISION', 'RESUELTO', 'CERRADO']
            if data['status'] not in valid_statuses:
                return jsonify({'message': f'Estado inválido. Debe ser uno de: {", ".join(valid_statuses)}'}), 400
            report.status = data['status']
        
        # Agregar respuesta del admin si se proporciona
        if 'admin_response' in data:
            report.admin_response = data['admin_response'].strip()
        
        report.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'id': report.id,
            'message': 'Reporte actualizado exitosamente',
            'status': report.status,
            'admin_response': report.admin_response,
            'updated_at': report.updated_at.isoformat()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al actualizar reporte: {str(e)}'}), 500

@bp.route('/<int:report_id>', methods=['DELETE'])
@admin_required
def delete_report(current_user, report_id):
    """Elimina un reporte (solo admin, eliminación física)"""
    try:
        report = Report.query.get(report_id)
        if not report:
            return jsonify({'message': 'Reporte no encontrado'}), 404
        
        db.session.delete(report)
        db.session.commit()
        
        return jsonify({'message': 'Reporte eliminado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Error al eliminar reporte: {str(e)}'}), 500
