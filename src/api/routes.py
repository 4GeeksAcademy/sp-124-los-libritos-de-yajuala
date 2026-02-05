"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Provider, Categoria_Libro, Categorias
from api.models_books import Book
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models_books import Book


api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():
    response_body = {
        "message": "Hello! I'm a message that came from the backend..."
    }

    return jsonify(response_body), 200


@api.route('/user', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200


@api.route('/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"msg": "User not found"}), 404
    return jsonify(user.serialize()), 200


@api.route('/user', methods=['POST'])
def add_user():
    data = request.json

    required_fields = ["name", "lastname", "email", "password"]
    for field in required_fields:
        if field not in data:
            return jsonify({"msg": f"Missing field: {field}"}), 400

    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return jsonify({"msg": "Email already registered"}), 400

    new_user = User(
        name=data["name"],
        lastname=data["lastname"],
        email=data["email"],
        password=data["password"],
        is_active=True
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify(new_user.serialize()), 201


@api.route('/user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"msg": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"msg": "User deleted"}), 200


@api.route('/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if user is None:
        return jsonify({"msg": "User not found"}), 404

    data = request.json

    user.name = data.get("name", user.name)
    user.lastname = data.get("lastname", user.lastname)
    user.email = data.get("email", user.email)

    db.session.commit()

    return jsonify(user.serialize()), 200


@api.route("/provider", methods=["GET"])
def get_providers():
    providers = Provider.query.all()
    return jsonify([p.serialize() for p in providers]), 200


@api.route("/provider/<int:provider_id>", methods=["GET"])
def get_provider(provider_id):
    provider = Provider.query.get(provider_id)

    if provider is None:
        raise APIException("Provider not found", status_code=404)

    return jsonify(provider.serialize()), 200


@api.route("/provider", methods=["POST"])
def create_provider():
    body = request.get_json()

    if body is None:
        raise APIException("Request body is empty", status_code=400)

    if "nombre" not in body:
        raise APIException("Field 'nombre' is required", status_code=400)

    provider = Provider(
        nombre=body["nombre"],
        email=body.get("email"),
        telefono=body.get("telefono"),
        password=body.get("password"),
        documento=body.get("documento")
    )

    db.session.add(provider)
    db.session.commit()

    return jsonify(provider.serialize()), 201


@api.route("/provider/<int:provider_id>", methods=["PUT"])
def update_provider(provider_id):
    provider = Provider.query.get(provider_id)

    if provider is None:
        raise APIException("Provider not found", status_code=404)

    body = request.get_json()

    if body is None:
        raise APIException("Request body is empty", status_code=400)

    provider.nombre = body.get("nombre", provider.nombre)
    provider.email = body.get("email", provider.email)
    provider.telefono = body.get("telefono", provider.telefono)
    provider.password = body.get("password", provider.password)
    provider.documento = body.get("documento", provider.documento)

    db.session.commit()

    return jsonify(provider.serialize()), 200


@api.route("/provider/<int:provider_id>", methods=["DELETE"])
def delete_provider(provider_id):
    provider = Provider.query.get(provider_id)

    if provider is None:
        raise APIException("Provider not found", status_code=404)

    db.session.delete(provider)
    db.session.commit()

    return jsonify({"msg": "Provider deleted"}), 200

# CRUD libros layla---------------------------------


@api.route("/books", methods=["GET"])
def get_books():
    books = Book.query.all()
    return jsonify([b.serialize() for b in books]), 200


@api.route("/books/<int:book_id>", methods=["GET"])
def get_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"msg": "Libro no encontrado"}), 404
    return jsonify(book.serialize()), 200


@api.route("/books", methods=["POST"])
def create_book():
    body = request.get_json(silent=True) or {}

    titulo = body.get("titulo")
    autor = body.get("autor")
    isbn = body.get("isbn")

    if not titulo or not autor or not isbn:
        return jsonify({"msg": "Faltan campos: titulo, autor, isbn"}), 400

    exists = Book.query.filter_by(isbn=isbn).first()
    if exists:
        return jsonify({"msg": "Ya existe un libro con ese isbn"}), 409

    book = Book(titulo=titulo, autor=autor, isbn=isbn)
    db.session.add(book)
    db.session.commit()

    return jsonify(book.serialize()), 201


@api.route("/books/<int:book_id>", methods=["PUT"])
def update_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"msg": "Libro no encontrado"}), 404

    body = request.get_json(silent=True) or {}

    if "titulo" in body:
        book.titulo = body["titulo"]
    if "autor" in body:
        book.autor = body["autor"]
    if "isbn" in body:
        new_isbn = body["isbn"]
        exists = Book.query.filter(
            Book.isbn == new_isbn, Book.id != book_id).first()
        if exists:
            return jsonify({"msg": "Ya existe otro libro con ese isbn"}), 409
        book.isbn = new_isbn

    db.session.commit()
    return jsonify(book.serialize()), 200


@api.route("/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"msg": "Libro no encontrado"}), 404

    db.session.delete(book)
    db.session.commit()
    return jsonify({"msg": "Libro eliminado"}), 200

# Fin CruD Libros Layla

# CRUD Categoria-libro


@api.route("/categorialibro", methods=["POST"])
def create_categoria_libro():
    body = request.get_json(silent=True) or {}

    categoria_id = body.get("categoria_id")
    libro_id = body.get("libro_id")

    if not categoria_id or not libro_id:
        return jsonify({"msg": "Faltan campos: categoria_id, libro_id"}), 400

    categoria = Categorias.query.get(categoria_id)
    libro = Book.query.get(libro_id)
    if not categoria or not libro:
        return jsonify({"msg": "Categoría o Libro no existe"}), 404

    existing = Categoria_Libro.query.filter_by(
        categoria_id=categoria_id, libro_id=libro_id
    ).first()
    if existing:
        return jsonify({"msg": "La relación ya existe"}), 409

    relacion = Categoria_Libro(categoria_id=categoria_id, libro_id=libro_id)
    db.session.add(relacion)
    db.session.commit()

    return jsonify(relacion.serialize()), 201


@api.route("/categorialibro", methods=["GET"])
def list_categorialibro():
    relaciones = Categoria_Libro.query.all()
    result = []
    for r in relaciones:
        categoria = Categorias.query.get(r.categoria_id)
        libro = Book.query.get(r.libro_id)
        result.append({
            "categoria_id": r.categoria_id,
            "libro_id": r.libro_id,
            "categoria": categoria.serialize() if categoria else None,
            "libro": libro.serialize() if libro else None
        })
    return jsonify(result), 200

@api.route("/categorialibro/<int:categoria_id>/<int:libro_id>", methods=["GET"])
def get_categoria_libro(categoria_id, libro_id):
    relacion = Categoria_Libro.query.filter_by(
        categoria_id=categoria_id, libro_id=libro_id
    ).first()

    if not relacion:
        return jsonify({"msg": "Relación no encontrada"}), 404

    return jsonify({
        "categoria_id": relacion.categoria_id,
        "libro_id": relacion.libro_id,
        "categoria": {"id": relacion.categoria.id, "nombre": relacion.categoria.nombre} if relacion.categoria else None,
        "libro": {"id": relacion.libro.id, "titulo": relacion.libro.titulo} if relacion.libro else None
    }), 200



@api.route("/categorialibro/<int:categoria_id>/<int:libro_id>", methods=["DELETE"])
def delete_categoria_libro(categoria_id, libro_id):
    relacion = Categoria_Libro.query.filter_by(
        categoria_id=categoria_id,
        libro_id=libro_id
    ).first()

    if not relacion:
        return jsonify({"msg": "Relación categoría-libro no encontrada"}), 404

    db.session.delete(relacion)
    db.session.commit()

    return jsonify({"msg": "Relación categoría-libro eliminada"}), 200


@api.route("/categorialibro/<int:categoria_id>/<int:libro_id>", methods=["PUT"])
def update_categoria_libro(categoria_id, libro_id):
    body = request.get_json(silent=True) or {}
    new_categoria_id = body.get("categoria_id")
    new_libro_id = body.get("libro_id")

    if not new_categoria_id or not new_libro_id:
        return jsonify({"msg": "Faltan campos: categoria_id, libro_id"}), 400

    relacion = Categoria_Libro.query.filter_by(
        categoria_id=categoria_id, libro_id=libro_id
    ).first()
    if not relacion:
        return jsonify({"msg": "Relación no encontrada"}), 404

    categoria = Categorias.query.get(new_categoria_id)
    libro = Book.query.get(new_libro_id)
    if not categoria or not libro:
        return jsonify({"msg": "Categoría o Libro no existe"}), 404

    exists = Categoria_Libro.query.filter_by(
        categoria_id=new_categoria_id, libro_id=new_libro_id
    ).first()
    if exists:
        return jsonify({"msg": "Ya existe esa relación"}), 409

    relacion.categoria_id = new_categoria_id
    relacion.libro_id = new_libro_id
    db.session.commit()

    return jsonify(relacion.serialize()), 200

# CRUD Categorias


@api.route("/categorias", methods=["GET"])
def list_categorias():
    categorias = Categorias.query.all()
    return jsonify([c.serialize() for c in categorias]), 200


@api.route("/categorias/<int:id>", methods=["GET"])
def get_categoria(id):
    categoria = Categorias.query.get(id)
    if not categoria:
        return jsonify({"msg": "Categoría no encontrada"}), 404
    return jsonify(categoria.serialize()), 200


@api.route("/categorias", methods=["POST"])
def create_categoria():
    body = request.get_json(silent=True) or {}
    nombre = body.get("nombre")

    if not nombre:
        return jsonify({"msg": "Falta el campo 'nombre'"}), 400

    # Evitar duplicados
    exists = Categorias.query.filter_by(nombre=nombre).first()
    if exists:
        return jsonify({"msg": "Ya existe una categoría con ese nombre"}), 409

    categoria = Categorias(nombre=nombre)
    db.session.add(categoria)
    db.session.commit()

    return jsonify(categoria.serialize()), 201


@api.route("/categorias/<int:id>", methods=["PUT"])
def update_categoria(id):
    categoria = Categorias.query.get(id)
    if not categoria:
        return jsonify({"msg": "Categoría no encontrada"}), 404

    body = request.get_json(silent=True) or {}
    nombre = body.get("nombre")
    if not nombre:
        return jsonify({"msg": "Falta el campo 'nombre'"}), 400

    # Evitar duplicados con otro registro
    exists = Categorias.query.filter(
        Categorias.nombre == nombre, Categorias.id != id).first()
    if exists:
        return jsonify({"msg": "Ya existe otra categoría con ese nombre"}), 409

    categoria.nombre = nombre
    db.session.commit()

    return jsonify(categoria.serialize()), 200


@api.route("/categorias/<int:id>", methods=["DELETE"])
def delete_categoria(id):
    categoria = Categorias.query.get(id)
    if not categoria:
        return jsonify({"msg": "Categoría no encontrada"}), 404

    db.session.delete(categoria)
    db.session.commit()

    return jsonify({"msg": "Categoría eliminada"}), 200
