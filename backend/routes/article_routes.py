"""
Rutas de Artículos (CRUD completo)
Equivalente a @RestController para Article en Spring
"""
from flask import Blueprint, jsonify, request
from backend.config.database import db
from backend.models.article import Article
from datetime import datetime

bp = Blueprint('articles', __name__, url_prefix='/api/articles')

@bp.route('/suggestions', methods=['GET'])
def get_suggestions():
    """
    GET /api/articles/suggestions?field=name&query=comp
    Obtener sugerencias para autocompletado
    """
    field = request.args.get('field', 'name')  # name, category, location, etc.
    query = request.args.get('query', '').strip()
    
    if not query or len(query) < 2:
        return jsonify([]), 200
    
    # Campos permitidos para sugerencias
    allowed_fields = ['name', 'category', 'location', 'unit']
    if field not in allowed_fields:
        return jsonify({'error': 'Campo no válido'}), 400
    
    try:
        # Obtener valores únicos del campo buscado
        column = getattr(Article, field)
        results = db.session.query(column).filter(
            column.ilike(f'%{query}%')
        ).distinct().limit(10).all()
        
        # Extraer solo los valores (viene como tuplas)
        suggestions = [result[0] for result in results if result[0]]
        
        return jsonify(suggestions), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/check-code/<code>', methods=['GET'])
def check_code(code):
    """
    GET /api/articles/check-code/{code}
    Verificar si un código ya existe
    """
    exists = Article.query.filter_by(code=code.upper()).first() is not None
    return jsonify({'exists': exists}), 200

@bp.route('/', methods=['GET'])
def get_all_articles():
    """
    GET /api/articles/
    Obtener todos los artículos (como @GetMapping)
    """
    articles = Article.query.all()
    return jsonify([article.to_dict() for article in articles]), 200

@bp.route('/<int:id>', methods=['GET'])
def get_article(id):
    """
    GET /api/articles/{id}
    Obtener un artículo por ID
    """
    article = Article.query.get_or_404(id)
    return jsonify(article.to_dict()), 200

@bp.route('/', methods=['POST'])
def create_article():
    """
    POST /api/articles/
    Crear un nuevo artículo (como @PostMapping)
    """
    data = request.get_json()
    
    # Validación básica
    if not data.get('code') or not data.get('name'):
        return jsonify({'error': 'Código y nombre son requeridos'}), 400
    
    # Normalizar código (siempre en mayúsculas)
    code = data.get('code').strip().upper()
    
    # Verificar que no exista el código
    if Article.query.filter_by(code=code).first():
        return jsonify({'error': f'El código {code} ya existe'}), 400
    
    # Normalizar nombre (título capitalizado)
    name = data.get('name').strip().title()
    
    # Verificar duplicados por nombre similar SOLO para herramientas
    # Las maquinarias pueden tener mismo nombre pero diferente código (identificadores únicos)
    tipo = data.get('tipo', '').lower()
    if 'herramienta' in tipo:
        existing = Article.query.filter(Article.name.ilike(name)).first()
        if existing:
            return jsonify({
                'error': f'Ya existe una herramienta similar: {existing.name} (código: {existing.code})'
            }), 400
    
    # Procesar fecha de adquisición
    acquisition_date = None
    if data.get('acquisition_date'):
        try:
            acquisition_date = datetime.strptime(data.get('acquisition_date'), '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
    
    # Crear nuevo artículo
    article = Article(
        code=code,
        name=name,
        description=data.get('description', '').strip(),
        tipo=data.get('tipo'),
        category=data.get('category', '').strip().title() if data.get('category') else None,
        unit=data.get('unit', 'unidad').strip().lower(),
        stock_min=data.get('stock_min', 0),
        stock_current=data.get('stock_current', 0),
        location=data.get('location', '').strip().title() if data.get('location') else None,
        status=data.get('status', 'FUNCIONANDO'),
        acquisition_date=acquisition_date,
        observations=data.get('observations')
    )
    
    try:
        db.session.add(article)
        db.session.commit()
        return jsonify(article.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>', methods=['PUT'])
def update_article(id):
    """
    PUT /api/articles/{id}
    Actualizar un artículo existente
    """
    article = Article.query.get_or_404(id)
    data = request.get_json()
    
    # Actualizar campos (con normalización)
    if 'name' in data:
        article.name = data['name'].strip().title()
    if 'description' in data:
        article.description = data['description'].strip()
    if 'tipo' in data:
        article.tipo = data['tipo']
    if 'category' in data:
        article.category = data['category'].strip().title() if data['category'] else None
    if 'unit' in data:
        article.unit = data['unit'].strip().lower()
    if 'stock_min' in data:
        article.stock_min = data['stock_min']
    if 'stock_current' in data:
        article.stock_current = data['stock_current']
    if 'location' in data:
        article.location = data['location'].strip().title() if data['location'] else None
    if 'status' in data:
        article.status = data['status']
    if 'acquisition_date' in data:
        if data['acquisition_date']:
            try:
                article.acquisition_date = datetime.strptime(data['acquisition_date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
        else:
            article.acquisition_date = None
    if 'observations' in data:
        article.observations = data['observations']
    
    try:
        db.session.commit()
        return jsonify(article.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@bp.route('/<int:id>', methods=['DELETE'])
def delete_article(id):
    """
    DELETE /api/articles/{id}
    Eliminar un artículo
    """
    article = Article.query.get_or_404(id)
    
    try:
        db.session.delete(article)
        db.session.commit()
        return jsonify({'message': 'Artículo eliminado correctamente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
