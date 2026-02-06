"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Provider, Cart, CartBook
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models_books import Book
from api.models_delivery import Delivery
from api.models_reviews import Review


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


@api.route("/books/<int:id>", methods=["GET"])
def get_book(id):
    book = Book.query.get(id)
    if not book:
        return jsonify({"msg": "Libro no encontrado"}), 404
    return jsonify(book.serialize()), 200


@api.route("/books", methods=["POST"])
def create_book():
    body = request.get_json(silent=True) or {}

    titulo = body.get("titulo")
    autor = body.get("autor")
    isbn = body.get("isbn")
    precio_raw = body.get("precio")

    if not titulo or not autor or not isbn:
        return jsonify({"msg": "Faltan campos: titulo, autor, isbn"}), 400

    if precio_raw in (None, "", " "):
        return jsonify({"msg": "El precio es obligatorio"}), 400

    try:
        precio = float(precio_raw)
    except:
        return jsonify({"msg": "El precio debe ser un número"}), 400

    exists = Book.query.filter_by(isbn=isbn).first()
    if exists:
        return jsonify({"msg": "Ya existe un libro con ese isbn"}), 409

    book = Book(
        titulo=titulo,
        autor=autor,
        isbn=isbn,
        precio=precio
    )

    db.session.add(book)
    db.session.commit()

    return jsonify(book.serialize()), 201



@api.route("/books/<int:id>", methods=["PUT"])
def update_book(id):
    data = request.json
    book = Book.query.get(id)

    if not book:
        return jsonify({"msg": "Libro no encontrado"}), 404

    book.titulo = data.get("titulo", book.titulo)
    book.autor = data.get("autor", book.autor)
    book.isbn = data.get("isbn", book.isbn)
    book.precio = float(data.get("precio", book.precio))

    db.session.commit()
    return jsonify(book.serialize()), 200



@api.route("/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"msg": "Libro no encontrado"}), 404

    if CartBook.query.filter_by(id_libro=id).first():
        return jsonify({"msg": "No se puede borrar un libro que está en carritos"}), 400

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

# CRUD Delivery Layla


@api.route("/delivery", methods=["GET"])
def get_delivery_list():
    items = Delivery.query.all()
    return jsonify([d.serialize() for d in items]), 200


@api.route("/delivery/<int:delivery_id>", methods=["GET"])
def get_delivery_detail(delivery_id):
    item = Delivery.query.get(delivery_id)
    if not item:
        return jsonify({"msg": "Repartidor no encontrado"}), 404
    return jsonify(item.serialize()), 200


@api.route("/delivery", methods=["POST"])
def create_delivery():
    body = request.get_json(silent=True) or {}

    required = ["nombre", "apellido", "email", "password", "identificacion"]
    for f in required:
        if not body.get(f):
            return jsonify({"msg": f"Falta {f}"}), 400

    if Delivery.query.filter_by(email=body["email"]).first():
        return jsonify({"msg": "Email ya existe"}), 409

    if Delivery.query.filter_by(identificacion=body["identificacion"]).first():
        return jsonify({"msg": "Identificacion ya existe"}), 409

    d = Delivery(
        nombre=body["nombre"],
        apellido=body["apellido"],
        email=body["email"],
        identificacion=body["identificacion"],
        password_hash="temp"
    )
    d.set_password(body["password"])

    db.session.add(d)
    db.session.commit()

    return jsonify(d.serialize()), 201


@api.route("/delivery/<int:delivery_id>", methods=["PUT"])
def update_delivery(delivery_id):
    d = Delivery.query.get(delivery_id)
    if not d:
        return jsonify({"msg": "Repartidor no encontrado"}), 404

    body = request.get_json(silent=True) or {}

    if "email" in body and body["email"] != d.email:
        if Delivery.query.filter_by(email=body["email"]).first():
            return jsonify({"msg": "Email ya existe"}), 409
        d.email = body["email"]

    if "identificacion" in body and body["identificacion"] != d.identificacion:
        if Delivery.query.filter_by(identificacion=body["identificacion"]).first():
            return jsonify({"msg": "Identificacion ya existe"}), 409
        d.identificacion = body["identificacion"]

    if "nombre" in body:
        d.nombre = body["nombre"]
    if "apellido" in body:
        d.apellido = body["apellido"]

    if body.get("password"):
        d.set_password(body["password"])

    db.session.commit()
    return jsonify(d.serialize()), 200


@api.route("/delivery/<int:delivery_id>", methods=["DELETE"])
def delete_delivery(delivery_id):
    d = Delivery.query.get(delivery_id)
    if not d:
        return jsonify({"msg": "Repartidor no encontrado"}), 404

    db.session.delete(d)
    db.session.commit()
    return jsonify({"msg": "Repartidor eliminado"}), 200

# Fin Crud Delivery Layla

# CRUD Reviews Layla ---------------------------------


@api.route("/reviews", methods=["GET"])
def get_reviews():
    reviews = Review.query.all()
    return jsonify([r.serialize() for r in reviews]), 200


@api.route("/reviews/<int:review_id>", methods=["GET"])
def get_review(review_id):
    r = Review.query.get(review_id)
    if not r:
        return jsonify({"msg": "Review no encontrada"}), 404
    return jsonify(r.serialize()), 200


@api.route("/reviews", methods=["POST"])
def create_review():
    body = request.get_json(silent=True) or {}

    required = ["id_cliente", "id_libro", "puntuacion"]
    for f in required:
        if body.get(f) is None:
            return jsonify({"msg": f"Falta {f}"}), 400

    cliente = User.query.get(body["id_cliente"])
    if not cliente:
        return jsonify({"msg": "Cliente no encontrado"}), 404

    libro = Book.query.get(body["id_libro"])
    if not libro:
        return jsonify({"msg": "Libro no encontrado"}), 404

    try:
        puntuacion = int(body["puntuacion"])
    except Exception:
        return jsonify({"msg": "puntuacion debe ser un número"}), 400

    if puntuacion < 1 or puntuacion > 5:
        return jsonify({"msg": "puntuacion debe estar entre 1 y 5"}), 400

    review = Review(
        id_cliente=body["id_cliente"],
        id_libro=body["id_libro"],
        puntuacion=puntuacion,
        comentario=body.get("comentario")
    )

    db.session.add(review)
    db.session.commit()

    return jsonify(review.serialize()), 201


@api.route("/reviews/<int:review_id>", methods=["PUT"])
def update_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"msg": "Review no encontrada"}), 404

    body = request.get_json(silent=True) or {}

    if "id_cliente" in body:
        cliente = User.query.get(body["id_cliente"])
        if not cliente:
            return jsonify({"msg": "Cliente no encontrado"}), 404
        review.id_cliente = body["id_cliente"]

    if "id_libro" in body:
        libro = Book.query.get(body["id_libro"])
        if not libro:
            return jsonify({"msg": "Libro no encontrado"}), 404
        review.id_libro = body["id_libro"]

    if "puntuacion" in body:
        try:
            puntuacion = int(body["puntuacion"])
        except Exception:
            return jsonify({"msg": "puntuacion debe ser un número"}), 400

        if puntuacion < 1 or puntuacion > 5:
            return jsonify({"msg": "puntuacion debe estar entre 1 y 5"}), 400

        review.puntuacion = puntuacion

    if "comentario" in body:
        review.comentario = body["comentario"]

    db.session.commit()
    return jsonify(review.serialize()), 200


@api.route("/reviews/<int:review_id>", methods=["DELETE"])
def delete_review(review_id):
    review = Review.query.get(review_id)
    if not review:
        return jsonify({"msg": "Review no encontrada"}), 404

    db.session.delete(review)
    db.session.commit()
    return jsonify({"msg": "Review eliminada"}), 200

# Fin CRUD Reviews Layla
