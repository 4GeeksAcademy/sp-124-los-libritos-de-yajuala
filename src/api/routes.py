"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Provider, Cart, CartBook
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

@api.route("/clients/<int:client_id>/carts/active", methods=["GET"])
def get_active_cart(client_id):
    cart = Cart.query.filter(
        Cart.id_cliente == client_id,
        Cart.estado.in_(["pendiente", "pagado", "cancelado"])
    ).order_by(Cart.fecha.desc()).first()

    if not cart:
        return jsonify({"active": False}), 200

    return jsonify({
        "active": True,
        "cart": cart.serialize()
    }), 200



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

@api.route("/carts", methods=["GET"])
def get_carts():
    carts = Cart.query.all()
    return jsonify([c.serialize() for c in carts]), 200

@api.route("/carts/<int:cart_id>", methods=["GET"])
def get_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({"msg": "Carrito no encontrado"}), 404
    return jsonify(cart.serialize()), 200

@api.route("/carts/<int:cart_id>/items", methods=["GET"])
def get_items_by_cart(cart_id):
    items = CartBook.query.filter_by(id_carrito=cart_id).all()
    return jsonify([i.serialize() for i in items]), 200

@api.route("/carts", methods=["POST"])
def create_cart():
    body = request.get_json(silent=True) or {}

    id_cliente = body.get("id_cliente")
    monto_total = body.get("monto_total", 0.0)
    estado = body.get("estado", "pendiente")

    if not id_cliente:
        return jsonify({"msg": "Falta id_cliente"}), 400

    cliente = User.query.get(id_cliente)
    if not cliente:
        return jsonify({"msg": "Cliente no encontrado"}), 404

    cart = Cart(
        id_cliente=id_cliente,
        monto_total=monto_total,
        estado=estado
    )

    db.session.add(cart)
    db.session.commit()

    return jsonify(cart.serialize()), 201

@api.route("/carts/<int:cart_id>", methods=["PUT"])
def update_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({"msg": "Carrito no encontrado"}), 404

    body = request.get_json(silent=True) or {}

    if "id_cliente" in body:
        cliente = User.query.get(body["id_cliente"])
        if not cliente:
            return jsonify({"msg": "Cliente no encontrado"}), 404
        cart.id_cliente = body["id_cliente"]

    if "monto_total" in body:
        cart.monto_total = body["monto_total"]

    if "estado" in body:
        cart.estado = body["estado"]

    db.session.commit()
    return jsonify(cart.serialize()), 200

@api.route("/carts/<int:cart_id>", methods=["DELETE"])
def delete_cart(cart_id):
    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({"msg": "Carrito no encontrado"}), 404

    db.session.delete(cart)
    db.session.commit()

    return jsonify({"msg": "Carrito eliminado"}), 200

@api.route("/cart-books", methods=["GET"])
def get_cart_books():
    items = CartBook.query.all()
    return jsonify([i.serialize() for i in items]), 200

@api.route("/cart-books/<int:item_id>", methods=["GET"])
def get_cart_book(item_id):
    item = CartBook.query.get(item_id)
    if not item:
        return jsonify({"msg": "Item no encontrado"}), 404
    return jsonify(item.serialize()), 200



@api.route("/cart-books", methods=["POST"])
def create_cart_book():
    body = request.get_json(silent=True) or {}

    required = ["id_carrito", "id_libro", "cantidad", "precio"]
    for field in required:
        if field not in body:
            return jsonify({"msg": f"Falta {field}"}), 400

    item = CartBook(
        id_carrito=body["id_carrito"],
        id_libro=body["id_libro"],
        cantidad=body["cantidad"],
        precio=body["precio"],
        descuento=body.get("descuento", 0.0)
    )

    db.session.add(item)
    db.session.commit()

    return jsonify(item.serialize()), 201

@api.route("/cart-books/<int:item_id>", methods=["PUT"])
def update_cart_book(item_id):
    item = CartBook.query.get(item_id)
    if not item:
        return jsonify({"msg": "Item no encontrado"}), 404

    body = request.get_json(silent=True) or {}

    item.cantidad = body.get("cantidad", item.cantidad)
    item.precio = body.get("precio", item.precio)
    item.descuento = body.get("descuento", item.descuento)

    db.session.commit()
    return jsonify(item.serialize()), 200

@api.route("/cart-books/<int:item_id>", methods=["DELETE"])
def delete_cart_book(item_id):
    item = CartBook.query.get(item_id)
    if not item:
        return jsonify({"msg": "Item no encontrado"}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({"msg": "Item eliminado"}), 200
