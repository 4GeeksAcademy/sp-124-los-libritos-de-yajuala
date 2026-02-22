import logging
import os
import requests as http_requests
from base64 import b64encode
from werkzeug.security import generate_password_hash, check_password_hash

"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Provider, Categoria_Libro, Categorias, Cart, CartBook, Delivery, ProviderBook, Address, Book
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from sqlalchemy import and_
import requests

from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from api.models_reviews import Review
from datetime import datetime, timedelta
from api.models import Shipment

api = Blueprint('api', __name__)

# Allow CORS requests to this API
# CORS(api)
CORS(api, origins="*")


@api.route("/geocode", methods=["GET"])
def geocode():
    address = (request.args.get("address") or "").strip()
    if not address:
        return jsonify({"msg": "address is required"}), 400

    key = os.getenv("GOOGLE_MAPS_KEY")
    if not key:
        return jsonify({"msg": "Missing GOOGLE_MAPS_KEY in server env"}), 500

    r = requests.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        params={"address": address, "key": key},
        timeout=10
    )
    data = r.json()

    if data.get("status") != "OK" or not data.get("results"):
        return jsonify({
            "msg": "Geocoding failed",
            "status": data.get("status"),
            "error_message": data.get("error_message")
        }), 400

    loc = data["results"][0]["geometry"]["location"]
    return jsonify({"lat": loc["lat"], "lng": loc["lng"]}), 200


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


@api.route("/user", methods=["POST"])
def create_user():
    body = request.get_json()

    if not body:
        return jsonify({"msg": "Body vacío"}), 400

    if "email" not in body or "password" not in body:
        return jsonify({"msg": "Email y password son obligatorios"}), 400

    if User.query.filter_by(email=body["email"]).first():
        return jsonify({"msg": "El email ya existe"}), 400

    hashed_password = generate_password_hash(body["password"])

    user = User(
        name=body["name"],
        lastname=body["lastname"],
        email=body["email"],
        password=hashed_password,
        role=body.get("role", "client")
    )

    db.session.add(user)
    db.session.commit()

    return jsonify(user.serialize()), 201


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


# ENDPOINTS DE ADDRESS

@api.route("/users/<int:user_id>/addresses", methods=["GET"])
def get_addresses(user_id):
    addresses = Address.query.filter_by(id_usuario=user_id).all()
    return jsonify([a.serialize() for a in addresses]), 200


@api.route("/users/<int:user_id>/addresses", methods=["POST"])
def create_address(user_id):
    data = request.json

    new_address = Address(
        id_usuario=user_id,
        nombre=data.get("nombre"),
        direccion=data.get("direccion"),
        ciudad=data.get("ciudad"),
        provincia=data.get("provincia"),
        codigo_postal=data.get("codigo_postal"),
        telefono=data.get("telefono"),
        latitud=data.get("latitud"),
        longitud=data.get("longitud")
    )

    db.session.add(new_address)
    db.session.commit()

    return jsonify(new_address.serialize()), 201


@api.route("/addresses/<int:address_id>", methods=["PUT"])
def update_address(address_id):
    address = Address.query.get(address_id)
    if not address:
        return jsonify({"msg": "Dirección no encontrada"}), 404

    data = request.json

    address.nombre = data.get("nombre", address.nombre)
    address.direccion = data.get("direccion", address.direccion)
    address.ciudad = data.get("ciudad", address.ciudad)
    address.provincia = data.get("provincia", address.provincia)
    address.codigo_postal = data.get("codigo_postal", address.codigo_postal)
    address.telefono = data.get("telefono", address.telefono)
    address.latitud = data.get("latitud", address.latitud)
    address.longitud = data.get("longitud", address.longitud)

    db.session.commit()

    return jsonify(address.serialize()), 200


@api.route("/addresses/<int:address_id>", methods=["DELETE"])
def delete_address(address_id):
    address = Address.query.get(address_id)
    if not address:
        return jsonify({"msg": "Dirección no encontrada"}), 404

    db.session.delete(address)
    db.session.commit()

    return jsonify({"msg": "Dirección eliminada"}), 200


@api.route("/addresses/<int:address_id>", methods=["GET"])
def get_address(address_id):
    address = Address.query.get(address_id)
    if not address:
        return jsonify({"msg": "Dirección no encontrada"}), 404
    return jsonify(address.serialize()), 200


# ENDPOINT ACTIVE CART
@api.route("/users/<int:user_id>/active-cart", methods=["GET"])
def get_user_active_cart(user_id):
    cart = Cart.query.filter_by(id_cliente=user_id, estado="pendiente").first()

    if not cart:
        cart = Cart(id_cliente=user_id, estado="pendiente", monto_total=0)
        db.session.add(cart)
        db.session.commit()

    return jsonify({"cart": cart.serialize()}), 200


@api.route("/clients/<int:client_id>/carts/active", methods=["GET"])
def get_active_cart(client_id):
    cart = Cart.query.filter(
        Cart.id_cliente == client_id,
        Cart.estado.in_(["pendiente", "pagado", "cancelado", "entregado"])
    ).order_by(Cart.fecha.desc()).first()

    if not cart:
        return jsonify({"active": False}), 200

    return jsonify({
        "active": True,
        "cart": cart.serialize()
    }), 200


@api.route("/clients/<int:client_id>/carts", methods=["GET"])
def get_client_carts(client_id):
    carts = Cart.query.filter(
        Cart.id_cliente == client_id,
        Cart.estado != "pendiente"
    ).order_by(Cart.fecha.desc()).all()

    return jsonify([c.serialize() for c in carts]), 200


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
        return jsonify({"msg": "Request body is empty"}), 400

    if "name" not in body:
        return jsonify({"msg": "Field 'name' is required"}), 400

    if body.get("email"):
        existing = Provider.query.filter_by(email=body["email"]).first()
        if existing:
            return jsonify({"msg": "El email ya está registrado"}), 400

    if body.get("documento"):
        existing_doc = Provider.query.filter_by(
            documento=body["documento"]).first()
        if existing_doc:
            return jsonify({"msg": "El documento ya está registrado"}), 400

    provider = Provider(
        name=body["name"],
        email=body.get("email"),
        telefono=body.get("telefono"),
        documento=body.get("documento")
    )

    provider.set_password(body["password"])

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


# POST /books para proveedores
@api.route("/books", methods=["POST"])
@jwt_required()
def create_book():
    identity = get_jwt_identity()
    role = identity.get("role")

    if role not in ["provider", "admin"]:
        return jsonify({"msg": "No autorizado"}), 403

    provider_id = identity["id"]

    body = request.get_json(silent=True) or {}

    titulo = body.get("titulo")
    autor = body.get("autor")
    isbn = body.get("isbn")
    precio_raw = body.get("precio")
    cantidad_raw = body.get("cantidad", 0)

    if role == "provider":
        provider_id = identity["id"]

    if role == "admin":
        provider_id = body.get("provider_id")

    if not provider_id:
        return jsonify({"msg": "provider_id es obligatorio para admin"}), 400

    if not titulo or not autor or not isbn:
        return jsonify({"msg": "Faltan campos: titulo, autor, isbn"}), 400

    if precio_raw in (None, "", " "):
        return jsonify({"msg": "El precio es obligatorio"}), 400

    try:
        precio = float(precio_raw)
    except:
        return jsonify({"msg": "El precio debe ser un número"}), 400

    try:
        cantidad = int(cantidad_raw)
        if cantidad < 0:
            return jsonify({"msg": "La cantidad no puede ser negativa"}), 400
    except:
        return jsonify({"msg": "La cantidad debe ser un número entero"}), 400

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

    link = ProviderBook(
        id_proveedor=provider_id,
        id_libro=book.id,
        cantidad=cantidad
    )

    db.session.add(link)
    db.session.commit()

    return jsonify({
        "book": book.serialize(),
        "provider_book": link.serialize()
    }), 201


@api.route("/books/<int:id>", methods=["PUT"])
@jwt_required()
def update_book(id):
    identity = get_jwt_identity()
    role = identity.get("role")

    data = request.get_json() or {}
    book = Book.query.get(id)

    if not book:
        return jsonify({"msg": "Libro no encontrado"}), 404

    book.titulo = data.get("titulo", book.titulo)
    book.autor = data.get("autor", book.autor)
    book.isbn = data.get("isbn", book.isbn)

    if "precio" in data:
        try:
            book.precio = float(data["precio"])
        except:
            return jsonify({"msg": "El precio debe ser un número"}), 400

    if role == "admin":
        provider_id = data.get("provider_id")
        if not provider_id:
            return jsonify({"msg": "provider_id es obligatorio para admin"}), 400

        link = ProviderBook.query.filter_by(id_libro=id).first()

        if link:
            link.id_proveedor = provider_id
        else:
            new_link = ProviderBook(
                id_proveedor=provider_id,
                id_libro=id,
                cantidad=0
            )
            db.session.add(new_link)

    elif role == "provider":
        link = ProviderBook.query.filter_by(id_libro=id).first()
        if not link or link.id_proveedor != identity["id"]:
            return jsonify({"msg": "No autorizado"}), 403

    db.session.commit()

    return jsonify(book.serialize()), 200


@api.route("/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"msg": "Libro no encontrado"}), 404

    if CartBook.query.filter_by(id_libro=book_id).first():
        return jsonify({"msg": "No se puede borrar un libro que está en carritos"}), 400

    db.session.delete(book)
    db.session.commit()
    return jsonify({"msg": "Libro eliminado"}), 200


@api.route("/books/search")
def search_books():
    query = request.args.get("q", "").strip()
    search_type = request.args.get("type", "title")  # "title" o "author"

    if not query:
        return jsonify([]), 200

    try:
        if search_type == "author":
            q = f"inauthor:{query}"
        else:
            q = f"intitle:{query}"

        resp = requests.get(
            "https://www.googleapis.com/books/v1/volumes",
            params={"q": q, "maxResults": 12},
            timeout=5
        )

        if resp.status_code != 200:
            print("Google Books error:", resp.status_code, resp.text)
            return jsonify({"msg": "Error consultando Google Books"}), 500

        data = resp.json()
        items = data.get("items", [])

        results = []
        for item in items:
            info = item.get("volumeInfo", {})

            isbn = None
            identifiers = info.get("industryIdentifiers", [])
            if identifiers:
                isbn = identifiers[0].get("identifier")

            results.append({
                "titulo": info.get("title", "Sin título"),
                "autor": ", ".join(info.get("authors", [])),
                "isbn": isbn,
                "descripcion": info.get("description", ""),
                "portada": info.get("imageLinks", {}).get("thumbnail")
            })

        return jsonify(results), 200

    except Exception as e:
        print("ERROR GOOGLE BOOKS:", e)
        return jsonify({"msg": "Error consultando Google Books"}), 500


@api.route("/books/import", methods=["POST"])
@jwt_required()
def import_book():
    try:
        body = request.get_json()

        titulo = body.get("titulo")
        autor = body.get("autor")
        isbn = body.get("isbn")
        descripcion = body.get("descripcion")
        portada = body.get("portada")
        precio = body.get("precio")

        if not titulo:
            return jsonify({"msg": "El título es obligatorio"}), 400

        if precio is None:
            return jsonify({"msg": "El precio es obligatorio"}), 400

        if not isbn:
            import uuid
            isbn = "NOISBN-" + uuid.uuid4().hex[:12]

        existing = Book.query.filter_by(isbn=isbn).first()

        if existing:
            existing.titulo = titulo or existing.titulo
            existing.autor = autor or existing.autor
            existing.descripcion = descripcion or existing.descripcion
            existing.portada = portada or existing.portada
            existing.precio = precio or existing.precio

            db.session.commit()
            return jsonify(existing.serialize()), 200

        new_book = Book(
            titulo=titulo,
            autor=autor,
            isbn=isbn,
            descripcion=descripcion,
            portada=portada,
            precio=precio
        )

        db.session.add(new_book)
        db.session.commit()

        return jsonify(new_book.serialize()), 201

    except Exception as e:
        print("ERROR IMPORTANDO LIBRO:", e)
        return jsonify({"msg": "Error interno importando libro"}), 500


@api.route("/categorialibro", methods=["POST"])
def create_categoria_libro():
    body = request.get_json(silent=True) or {}

    categoria_id = body.get("categoria_id")
    libro_id = body.get("libro_id")

    if categoria_id is None or libro_id is None:
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

    return jsonify([
        {
            "categoria_id": r.categoria_id,
            "libro_id": r.libro_id,
            "categoria": r.categoria.serialize() if r.categoria else None,
            "libro": r.libro.serialize() if r.libro else None
        }
        for r in relaciones
    ]), 200


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


@api.route("/categorialibro/<int:categoria_id>/<int:libro_id>", methods=["PUT"])
def update_categoria_libro(categoria_id, libro_id):
    body = request.get_json(silent=True) or {}

    new_categoria_id = body.get("categoria_id")
    new_libro_id = body.get("libro_id")

    if new_categoria_id is None or new_libro_id is None:
        return jsonify({"msg": "Faltan campos: categoria_id, libro_id"}), 400

    relacion = Categoria_Libro.query.filter_by(
        categoria_id=categoria_id,
        libro_id=libro_id
    ).first()

    if not relacion:
        return jsonify({"msg": "Relación no encontrada"}), 404

    categoria = Categorias.query.get(new_categoria_id)
    libro = Book.query.get(new_libro_id)
    if not categoria or not libro:
        return jsonify({"msg": "Categoría o Libro no existe"}), 404

    exists = Categoria_Libro.query.filter_by(
        categoria_id=new_categoria_id,
        libro_id=new_libro_id
    ).first()
    if exists:
        return jsonify({"msg": "Ya existe esa relación"}), 409

    db.session.delete(relacion)
    nueva_relacion = Categoria_Libro(
        categoria_id=new_categoria_id,
        libro_id=new_libro_id
    )
    db.session.add(nueva_relacion)

    db.session.commit()

    return jsonify(nueva_relacion.serialize()), 200


@api.route("/categorialibro/<int:categoria_id>/<int:libro_id>", methods=["DELETE"])
def delete_categoria_libro(categoria_id, libro_id):
    relacion = Categoria_Libro.query.filter_by(
        categoria_id=categoria_id,
        libro_id=libro_id
    ).first()

    if not relacion:
        return jsonify({"msg": "Relación no encontrada"}), 404

    db.session.delete(relacion)
    db.session.commit()

    return jsonify({"msg": "Relación eliminada correctamente"}), 200


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
    descripcion = body.get("descripcion")

    if not nombre or not descripcion:
        return jsonify({"msg": "Faltan campos: nombre, descripcion"}), 400

    exists = Categorias.query.filter_by(nombre=nombre).first()
    if exists:
        return jsonify({"msg": "Ya existe una categoría con ese nombre"}), 409

    categoria = Categorias(
        nombre=nombre,
        descripcion=descripcion
    )

    db.session.add(categoria)
    db.session.commit()

    return jsonify(categoria.serialize()), 201


@api.route("/categorias/<int:id>", methods=["PUT"])
def update_categoria(id):
    categoria = Categorias.query.get(id)
    if not categoria:
        return jsonify({"msg": "Categoría no encontrada"}), 404

    data = request.get_json(silent=True) or {}
    nombre = data.get("nombre")
    descripcion = data.get("descripcion")

    if not nombre or not descripcion:
        return jsonify({"msg": "Faltan campos"}), 400

    categoria.nombre = nombre
    categoria.descripcion = descripcion
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


@api.route("/libros/<int:libro_id>/categorias", methods=["GET"])
def get_categorias_libro(libro_id):
    relaciones = Categoria_Libro.query.filter_by(libro_id=libro_id).all()
    categorias = [rel.categoria.serialize() for rel in relaciones]
    return jsonify(categorias), 200


@api.route("/libros/<int:libro_id>/categorias", methods=["POST"])
def set_categorias_libro(libro_id):
    data = request.get_json() or {}
    categorias_ids = data.get("categorias", [])

    Categoria_Libro.query.filter_by(libro_id=libro_id).delete()

    for cat_id in categorias_ids:
        nueva_relacion = Categoria_Libro(
            libro_id=libro_id,
            categoria_id=cat_id
        )
        db.session.add(nueva_relacion)

    db.session.commit()

    return jsonify({"msg": "Categorías actualizadas"}), 200


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


# Pay Cart
@api.route("/carts/<int:cart_id>/pay", methods=["POST"])
def pay_cart(cart_id):

    print("ENTRANDO A PAY_CART PARA:", cart_id)

    body = request.get_json(silent=True) or {}
    address_id = body.get("address_id")

    # Validar que envio direccion

    if not address_id:
        return jsonify({"msg": "Falta address_id para crear el envío"}), 400

    cart = Cart.query.get(cart_id)

    if not cart:
        return jsonify({"msg": "Carrito no encontrado"}), 404

    if cart.estado != "pendiente":
        return jsonify({"msg": "Este carrito no se puede pagar"}), 400

    # Verificar que la dir existe y pertenece al cliente
    address = Address.query.get(address_id)
    if not address:
        return jsonify({"msg": "Dirección no encontrada"}), 404

    if address.id_usuario != cart.id_cliente:
        return jsonify({"msg": "Esa dirección no pertenece al cliente"}), 403

    # Calcular total
    items = CartBook.query.filter_by(id_carrito=cart_id).all()

    #  Validar stock
    for item in items:
        pb = ProviderBook.query.get(item.provider_book_id)
        if not pb:
            return jsonify({"msg": "Inventario del proveedor no encontrado"}), 400

        if pb.cantidad < item.cantidad:
            return jsonify({
                "msg": f"Stock insuficiente para '{pb.libro.titulo}'. Disponible: {pb.cantidad}, pedido: {item.cantidad}"
            }), 400

    #  Descontar stock
    for item in items:
        pb = ProviderBook.query.get(item.provider_book_id)
        pb.cantidad -= item.cantidad

    db.session.commit()

    total = 0
    for item in items:
        precio_con_descuento = item.precio * (1 - item.descuento)
        total += precio_con_descuento * item.cantidad

    cart.monto_total = total
    cart.estado = "pagado"
    db.session.commit()

    # provisional test layla aqui abjo:
    print("CREANDO SHIPMENT PARA CART:", cart.id, "ESTADO:", cart.estado)

    # Verificar que no exista ya un shipment para este cart
    existing_shipment = Shipment.query.filter_by(cart_id=cart.id).first()
    if not existing_shipment:
        shipment = Shipment(
            cart_id=cart.id,
            address_id=address_id,
            status="unassigned",
            delivery_id=None
        )
        db.session.add(shipment)
        db.session.commit()
    else:
        shipment = existing_shipment

    # Crear nuevo carrito vacio para el cliente
    new_cart = Cart(
        id_cliente=cart.id_cliente,
        estado="pendiente",
        monto_total=0
    )
    db.session.add(new_cart)
    db.session.commit()

    return jsonify({
        "msg": "Pago realizado con éxito. Pedido creado.",
        "cart_pagado": cart.serialize(),
        "shipment": shipment.serialize() if hasattr(shipment, 'serialize') else {
            "id": shipment.id,
            "cart_id": shipment.cart_id,
            "address_id": shipment.address_id,
            "status": shipment.status
        },
        "nuevo_carrito": new_cart.serialize()
    }), 200


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

    required = ["id_carrito", "id_libro",
                "cantidad", "precio", "provider_book_id"]
    for field in required:
        if field not in body:
            return jsonify({"msg": f"Falta {field}"}), 400

    pb = ProviderBook.query.get(body["provider_book_id"])
    if not pb or pb.id_libro != body["id_libro"]:
        return jsonify({"msg": "provider_book_id inválido para este libro"}), 400

    item = CartBook(
        id_carrito=body["id_carrito"],
        id_libro=body["id_libro"],
        provider_book_id=body["provider_book_id"],
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


@api.route("/carts/abandoned", methods=["GET"])
def get_abandoned_carts():
    limite = datetime.utcnow() - timedelta(hours=48)

    carts = Cart.query.filter(
        Cart.estado == "pendiente",
        Cart.fecha < limite
    ).all()

    return jsonify([c.serialize() for c in carts]),


@api.route("/delivery", methods=["GET"])
@jwt_required()
def get_delivery_list():
    delivery_id = get_jwt_identity()
    delivery = Delivery.query.get(delivery_id)

    if not delivery or delivery.role != "delivery":
        return jsonify({"msg": "No autorizado"}), 403

    items = Delivery.query.all()
    return jsonify([d.serialize() for d in items]), 200


@api.route("/delivery/<int:delivery_id>", methods=["GET"])
def get_delivery_detail(delivery_id):
    item = Delivery.query.get(delivery_id)
    if not item:
        return jsonify({"msg": "Repartidor no encontrado"}), 404
    return jsonify(item.serialize()), 200


@api.route("/delivery/login", methods=["POST"])
def login_delivery():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    delivery = Delivery.query.filter_by(email=email).first()

    if not delivery or not check_password_hash(delivery.password, password):
        return jsonify({"msg": "Credenciales incorrectas"}), 401

    if not delivery.is_approved:
        return jsonify({"msg": "Tu cuenta está pendiente de aprobación por el administrador."}), 403

    token = create_access_token(identity=delivery.id)

    return jsonify({
        "token": token,
        "delivery": delivery.serialize()
    }), 200


@api.route("/delivery", methods=["POST"])
def create_delivery():
    body = request.get_json(silent=True) or {}

    required = ["name", "lastname", "email", "password", "identificacion"]
    for f in required:
        if not body.get(f):
            return jsonify({"msg": f"Falta {f}"}), 400

    if Delivery.query.filter_by(email=body["email"]).first():
        return jsonify({"msg": "Email ya existe"}), 409

    if Delivery.query.filter_by(identificacion=body["identificacion"]).first():
        return jsonify({"msg": "Identificacion ya existe"}), 409

    d = Delivery(
        name=body["name"],
        lastname=body["lastname"],
        email=body["email"],
        identificacion=body["identificacion"],
        role="delivery",
        is_approved=False
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


@api.route("/delivery/all", methods=["GET"])
def get_all_deliveries_admin():
    deliveries = Delivery.query.all()
    return jsonify([d.serialize() for d in deliveries]), 200


@api.route("/admin/delivery/<int:delivery_id>", methods=["GET"])
@jwt_required()
def admin_get_delivery_detail(delivery_id):
    identity = get_jwt_identity()

    if identity["role"] != "admin":
        return jsonify({"msg": "No autorizado"}), 403

    item = Delivery.query.get(delivery_id)
    if not item:
        return jsonify({"msg": "Repartidor no encontrado"}), 404

    return jsonify(item.serialize()), 200


@api.route("/admin/delivery", methods=["POST"])
@jwt_required()
def admin_create_delivery():
    identity = get_jwt_identity()

    if identity["role"] != "admin":
        return jsonify({"msg": "No autorizado"}), 403

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
        role="delivery"
    )

    d.set_password(body["password"])

    db.session.add(d)
    db.session.commit()

    return jsonify(d.serialize()), 201


@api.route("/admin/delivery/<int:delivery_id>", methods=["PUT"])
@jwt_required()
def admin_update_delivery(delivery_id):
    identity = get_jwt_identity()

    if identity["role"] != "admin":
        return jsonify({"msg": "No autorizado"}), 403

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

    d.nombre = body.get("nombre", d.nombre)
    d.apellido = body.get("apellido", d.apellido)

    if body.get("password"):
        d.set_password(body["password"])

    db.session.commit()
    return jsonify(d.serialize()), 200


@api.route("/admin/delivery/<int:delivery_id>", methods=["DELETE"])
@jwt_required()
def admin_delete_delivery(delivery_id):
    identity = get_jwt_identity()

    if identity["role"] != "admin":
        return jsonify({"msg": "No autorizado"}), 403

    d = Delivery.query.get(delivery_id)
    if not d:
        return jsonify({"msg": "Repartidor no encontrado"}), 404

    db.session.delete(d)
    db.session.commit()
    return jsonify({"msg": "Repartidor eliminado"}), 200


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
@jwt_required()
def create_review():
    body = request.get_json(silent=True) or {}

    identity = get_jwt_identity()
    user = User.query.get(identity["id"])

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if body.get("id_libro") is None or body.get("puntuacion") is None:
        return jsonify({"msg": "Faltan campos obligatorios"}), 400

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
        id_cliente=user.id,
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


@api.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña son obligatorios"}), 400

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"msg": "Credenciales incorrectas"}), 401

    if not check_password_hash(user.password, password):
        return jsonify({"msg": "Credenciales incorrectas"}), 401

    if user.role == "delivery":
        return jsonify({"msg": "Usa el login de repartidor"}), 403

    token = create_access_token(identity=user.id)
    return jsonify({"token": token, "user": user.serialize()}), 200


@api.route("/usuarios/<int:user_id>/carritos", methods=["GET"])
def get_carritos_usuario(user_id):
    carritos = Cart.query.filter_by(id_cliente=user_id).all()
    return jsonify([c.serialize() for c in carritos]), 200


@api.route("/admin/usuarios", methods=["GET"])
@jwt_required()
def admin_users():
    user = get_jwt_identity()
    if user["role"] != "admin":
        return jsonify({"msg": "No autorizado"}), 403

    usuarios = User.query.all()
    return jsonify([u.serialize() for u in usuarios]), 200


# Login proveedores Layla abajo


@api.route("/login/provider", methods=["POST"])
def login_provider():
    body = request.get_json(silent=True) or {}

    email = body.get("email")
    password = body.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña requeridos"}), 400

    user = User.query.filter_by(email=email).first()
    if user:
        return jsonify({"msg": "No tienes permiso para acceder al panel de proveedor"}), 403

    provider = Provider.query.filter_by(email=email).first()
    if not provider or not provider.check_password(password):
        return jsonify({"msg": "Credenciales incorrectas"}), 401

    access_token = create_access_token(identity={
        "id": provider.id,
        "role": "provider"
    })

    return jsonify({
        "msg": "Login correcto",
        "token": access_token,
        "user": {**provider.serialize(), "role": "provider"}
    }), 200


@api.route("/delivery/pedidos", methods=["GET"])
@jwt_required()
def delivery_pedidos():
    delivery_id = get_jwt_identity()  # esto es un int
    delivery = Delivery.query.get(delivery_id)

    if not delivery:
        return jsonify({"msg": "Repartidor no encontrado"}), 404

    if delivery.role != "delivery":
        return jsonify({"msg": "No autorizado"}), 403

    return jsonify({"msg": "Pedidos del repartidor"}), 200


@api.route("/validate", methods=["GET"])
@jwt_required()
def validate():
    user_id = get_jwt_identity()


    user = User.query.get(user_id)

    if not user:
        user = Delivery.query.get(user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    return jsonify({
        "user": user.serialize()
    }), 200



# ENDPOINTS PROVIDER BOOKS

@api.route("/provider/books", methods=["GET"])
@jwt_required()
def get_provider_books():
    identity = get_jwt_identity()
    if identity.get("role") != "provider":
        return jsonify({"msg": "No autorizado"}), 403

    provider_id = identity["id"]

    links = (
        ProviderBook.query
        .filter_by(id_proveedor=provider_id)
        .join(Book)
        .order_by(Book.titulo.asc())
        .all()
    )

    return jsonify([
        {
            "id": link.id,
            "cantidad": link.cantidad,
            "libro": link.libro.serialize() if link.libro else None
        }
        for link in links
    ]), 200


@api.route("/provider/books/<int:provider_book_id>", methods=["GET"])
@jwt_required()
def get_provider_book_detail(provider_book_id):
    identity = get_jwt_identity()

    if identity.get("role") != "provider":
        return jsonify({"msg": "No autorizado"}), 403

    provider_id = identity["id"]
    link = ProviderBook.query.get(provider_book_id)

    if not link:
        return jsonify({"msg": "No encontrado"}), 404

    if link.id_proveedor != provider_id:
        return jsonify({"msg": "No autorizado"}), 403

    return jsonify({
        "id": link.id,
        "cantidad": link.cantidad,
        "libro": link.libro.serialize() if link.libro else None
    }), 200


@api.route("/provider/books/<int:provider_book_id>", methods=["PUT"])
@jwt_required()
def update_provider_book(provider_book_id):
    identity = get_jwt_identity()

    if identity.get("role") != "provider":
        return jsonify({"msg": "No autorizado"}), 403

    provider_id = identity["id"]
    body = request.get_json(silent=True) or {}

    link = ProviderBook.query.get(provider_book_id)

    if not link:
        return jsonify({"msg": "No encontrado"}), 404

    if link.id_proveedor != provider_id:
        return jsonify({"msg": "No autorizado"}), 403

    book = link.libro

    book.titulo = body.get("titulo", book.titulo)
    book.autor = body.get("autor", book.autor)
    book.isbn = body.get("isbn", book.isbn)
    book.descripcion = body.get("descripcion", book.descripcion)
    book.portada = body.get("portada", book.portada)
    book.categorias = body.get("categorias", book.categorias)
    book.fecha_publicacion = body.get(
        "fecha_publicacion", book.fecha_publicacion)

    if "precio" in body:
        try:
            book.precio = float(body["precio"])
        except:
            return jsonify({"msg": "Precio inválido"}), 400

    if "cantidad" in body:
        try:
            cantidad = int(body["cantidad"])
            if cantidad < 0:
                return jsonify({"msg": "Cantidad no válida"}), 400
            link.cantidad = cantidad
        except:
            return jsonify({"msg": "Cantidad inválida"}), 400

    db.session.commit()

    return jsonify({
        "id": link.id,
        "cantidad": link.cantidad,
        "libro": book.serialize()
    }), 200


@api.route("/provider/<int:provider_id>/add_book", methods=["POST"])
@jwt_required()
def provider_add_book(provider_id):
    identity = get_jwt_identity()

    if identity.get("role") != "provider" or identity["id"] != provider_id:
        return jsonify({"msg": "No autorizado"}), 403

    body = request.get_json() or {}

    book_id = body.get("book_id")
    cantidad = body.get("cantidad", 0)

    if not book_id:
        return jsonify({"msg": "Falta book_id"}), 400

    if cantidad is None or int(cantidad) < 0:
        return jsonify({"msg": "Cantidad inválida"}), 400

    provider = Provider.query.get(provider_id)
    if not provider:
        return jsonify({"msg": "Proveedor no encontrado"}), 404

    book = Book.query.get(book_id)
    if not book:
        return jsonify({"msg": "Libro no encontrado"}), 404

    existing = ProviderBook.query.filter_by(
        id_proveedor=provider_id,
        id_libro=book_id
    ).first()

    if existing:
        existing.cantidad += int(cantidad)
    else:
        relation = ProviderBook(
            id_proveedor=provider_id,
            id_libro=book_id,
            cantidad=int(cantidad)
        )
        db.session.add(relation)

    db.session.commit()

    return jsonify({
        "msg": "Libro asociado correctamente",
        "book": book.serialize(),
        "cantidad": cantidad
    }), 200


@api.route("/provider/books/<int:provider_book_id>/cantidad", methods=["PUT"])
@jwt_required()
def update_provider_books_quantity(provider_book_id):
    identity = get_jwt_identity()

    if identity.get("role") != "provider":
        return jsonify({"msg": "No autorizado"}), 403

    provider_id = identity["id"]
    body = request.get_json() or {}
    cantidad = body.get("cantidad")

    if cantidad is None:
        return jsonify({"msg": "Falta cantidad"}), 400

    link = ProviderBook.query.get(provider_book_id)

    if not link:
        return jsonify({"msg": "No encontrado"}), 404

    if link.id_proveedor != provider_id:
        return jsonify({"msg": "No autorizado"}), 403

    link.cantidad = cantidad
    db.session.commit()

    return jsonify({"msg": "Cantidad actualizada"}), 200


@api.route("/provider/books/<int:provider_book_id>", methods=["DELETE"])
@jwt_required()
def delete_provider_book(provider_book_id):
    identity = get_jwt_identity()

    if identity.get("role") != "provider":
        return jsonify({"msg": "No autorizado"}), 403

    provider_id = identity["id"]
    link = ProviderBook.query.get(provider_book_id)

    if not link:
        return jsonify({"msg": "No encontrado"}), 404

    if link.id_proveedor != provider_id:
        return jsonify({"msg": "No autorizado"}), 403

    book = link.libro

    db.session.delete(link)
    db.session.commit()

    remaining_links = ProviderBook.query.filter_by(id_libro=book.id).count()

    if remaining_links == 0:
        db.session.delete(book)
        db.session.commit()
        return jsonify({"msg": "Relación eliminada y libro borrado (sin proveedores restantes)"}), 200

    return jsonify({"msg": "Relación eliminada (el libro sigue asociado a otros proveedores)"}), 200


@api.route("/provider/books/<int:provider_book_id>/edit", methods=["PUT"])
@jwt_required()
def edit_provider_book(provider_book_id):
    identity = get_jwt_identity()

    if identity.get("role") != "provider":
        return jsonify({"msg": "No autorizado"}), 403

    provider_id = identity["id"]
    body = request.get_json() or {}

    link = ProviderBook.query.get(provider_book_id)

    if not link:
        return jsonify({"msg": "No encontrado"}), 404

    if link.id_proveedor != provider_id:
        return jsonify({"msg": "No autorizado"}), 403

    book = link.libro

    book.titulo = body.get("titulo", book.titulo)
    book.autor = body.get("autor", book.autor)
    book.descripcion = body.get("descripcion", book.descripcion)
    book.portada = body.get("portada", book.portada)
    book.categorias = body.get("categorias", book.categorias)
    book.fecha_publicacion = body.get(
        "fecha_publicacion", book.fecha_publicacion)
    book.precio = body.get("precio", book.precio)

    db.session.commit()

    return jsonify({"msg": "Libro actualizado"}), 200


# Pedidos del proveedor


@api.route("/provider/orders", methods=["GET"])
@jwt_required()
def get_provider_orders():
    identity = get_jwt_identity()
    if identity.get("role") != "provider":

        return jsonify({"msg": "No autorizado"}), 403

    provider_id = identity["id"]

    rows = (
        db.session.query(Cart, CartBook, Book)
        .join(CartBook, CartBook.id_carrito == Cart.id)
        .join(Book, Book.id == CartBook.id_libro)
        .join(ProviderBook, and_(
            ProviderBook.id_libro == Book.id,
            ProviderBook.id_proveedor == provider_id
        ))
        .filter(Cart.estado == "pagado")
        .order_by(Cart.fecha.desc(), Cart.id.desc())
        .all()
    )
    print("ROWS len:", len(rows))
    rows: print("ROWS first:", rows[0] if rows else None)

    orders = {}
    for cart, cartbook, book in rows:
        if cart.id not in orders:
            orders[cart.id] = {
                "cart_id": cart.id,
                "estado": cart.estado,
                "fecha": cart.fecha.isoformat() if cart.fecha else None,
                "id_cliente": cart.id_cliente,
                "items": []
            }

    orders[cart.id]["items"].append({
        "cart_book_id": cartbook.id,
        "id_libro": book.id,
        "titulo": book.titulo,
        "isbn": book.isbn,
        "cantidad": cartbook.cantidad,
        "precio": cartbook.precio,
        "descuento": cartbook.descuento
    })

    return jsonify(list(orders.values())), 200

# Delivery Layla


@api.route("/delivery/orders/available", methods=["GET"])
@jwt_required()
def delivery_orders_available():
    delivery_id = get_jwt_identity()
    delivery = Delivery.query.get(delivery_id)

    if not delivery:
        return jsonify({"msg": "Repartidor no encontrado"}), 404

    if delivery.role != "delivery":
        return jsonify({"msg": "No autorizado"}), 403

    rows = (
        db.session.query(Shipment, Cart)
        .join(Cart, Cart.id == Shipment.cart_id)
        .filter(Shipment.delivery_id == None) 
        .order_by(Shipment.id.desc())
        .all()
    )

    orders = []
    for shipment, cart in rows:
        orders.append({
            "cart_id": cart.id,
            "monto_total": cart.monto_total,
            "status": shipment.status
        })

    return jsonify(orders), 200



@api.route("/delivery/orders", methods=["GET"])
@jwt_required()
def delivery_orders_mine():
    delivery_id = get_jwt_identity()
    delivery = Delivery.query.get(delivery_id)

    if not delivery:
        return jsonify({"msg": "Repartidor no encontrado"}), 404

    if delivery.role != "delivery":
        return jsonify({"msg": "No autorizado"}), 403

    rows = (
        db.session.query(Shipment, Cart)
        .join(Cart, Cart.id == Shipment.cart_id)
        .filter(Shipment.delivery_id == delivery_id)
        .order_by(Shipment.id.desc())
        .all()
    )

    orders = []
    for shipment, cart in rows:
        orders.append({
            "cart_id": cart.id,
            "monto_total": cart.monto_total,
            "status": shipment.status
        })

    return jsonify(orders), 200


# endpoint para claim


@api.route("/delivery/orders/<int:cart_id>/claim", methods=["POST"])
@jwt_required()
def delivery_claim_order(cart_id): 
    delivery_id = get_jwt_identity() 
    delivery = Delivery.query.get(delivery_id) 
    if not delivery: 
        return jsonify({"msg": "Repartidor no encontrado"}), 404 
    if delivery.role != "delivery": 
        return jsonify({"msg": "No autorizado"}), 403 
    
    shipment = Shipment.query.get(cart_id) 
    if not shipment: 
        return jsonify({"msg": "Pedido no encontrado"}), 404 
    
    if shipment.delivery_id is not None: 
        return jsonify({"msg": "Este pedido ya fue asignado"}), 400 
    shipment.delivery_id = delivery_id 
    db.session.commit() 
    return jsonify({"msg": "Pedido asignado correctamente"}), 200


@api.route("/delivery/orders/<int:cart_id>/delivered", methods=["PUT"])
@jwt_required()
def delivery_mark_delivered(cart_id):
    delivery_id = get_jwt_identity()
    delivery = Delivery.query.get(delivery_id)

    if not delivery:
        return jsonify({"msg": "Repartidor no encontrado"}), 404

    if delivery.role != "delivery":
        return jsonify({"msg": "No autorizado"}), 403

    shipment = Shipment.query.filter_by(cart_id=cart_id).first()
    if not shipment:
        return jsonify({"msg": "Pedido no encontrado"}), 404

    if shipment.delivery_id != delivery_id:
        return jsonify({"msg": "No puedes modificar este pedido"}), 403

    shipment.status = "delivered"

    cart = Cart.query.get(cart_id)
    if cart:
        cart.estado = "entregado"

    db.session.commit()

    return jsonify({
        "msg": "Pedido entregado",
        "cart_id": cart_id,
        "status": shipment.status,
        "cart_estado": cart.estado if cart else None
    }), 200



@api.route("/delivery/orders/<int:cart_id>", methods=["GET"])
@jwt_required()
def delivery_order_detail(cart_id):
    delivery_id = get_jwt_identity()
    delivery = Delivery.query.get(delivery_id)

    if not delivery:
        return jsonify({"msg": "Repartidor no encontrado"}), 404

    if delivery.role != "delivery":
        return jsonify({"msg": "No autorizado"}), 403

    shipment = Shipment.query.filter_by(cart_id=cart_id).first()
    if not shipment:
        return jsonify({"msg": "Pedido no encontrado"}), 404

    if shipment.delivery_id != delivery_id:
        return jsonify({"msg": "No autorizado"}), 403

    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({"msg": "Carrito no encontrado"}), 404

    address = Address.query.get(shipment.address_id)

    print("DEBUG -> address_id:", shipment.address_id,
          "lat:", address.latitud if address else None,
          "lng:", address.longitud if address else None)

    items = CartBook.query.filter_by(id_carrito=cart_id).all()

    return jsonify({
        "cart_id": cart.id,
        "status": shipment.status,
        "monto_total": cart.monto_total,
        "address": address.serialize() if address else None,
        "items": [
            {
                "id": it.id,
                "cantidad": it.cantidad,
                "precio": it.precio,
                "descuento": it.descuento,
                "titulo": it.libro.titulo if it.libro else None
            }
            for it in items
        ]
    }), 200



@api.route("/shipments/from-cart/<int:cart_id>", methods=["POST"])
@jwt_required()
def create_shipment_from_paid_cart(cart_id):
    identity = get_jwt_identity()

    # Solo cliente/admin (no provider/delivery)
    if identity.get("role") in ("provider", "delivery"):
        return jsonify({"msg": "No autorizado"}), 403

    body = request.get_json(silent=True) or {}
    address_id = body.get("address_id")

    if not address_id:
        return jsonify({"msg": "Falta address_id"}), 400

    cart = Cart.query.get(cart_id)
    if not cart:
        return jsonify({"msg": "Carrito no encontrado"}), 404

    # El carrito debe ser del usuario logueado
    if cart.id_cliente != identity.get("id"):
        return jsonify({"msg": "No autorizado"}), 403

    # Solo se crea shipment si el carrito ya está pagado
    if cart.estado != "pagado":
        return jsonify({"msg": "El carrito no está pagado"}), 400

    address = Address.query.get(address_id)
    if not address:
        return jsonify({"msg": "Dirección no encontrada"}), 404

    # La address debe pertenecer al usuario
    if address.id_usuario != identity.get("id"):
        return jsonify({"msg": "Esa dirección no es tuya"}), 403

    # si ya existe lo devolvemos
    existing = Shipment.query.filter_by(cart_id=cart_id).first()
    if existing:
        return jsonify({
            "msg": "Shipment ya existía",
            "shipment": existing.serialize() if hasattr(existing, "serialize") else {
                "id": existing.id,
                "cart_id": existing.cart_id,
                "address_id": existing.address_id,
                "delivery_id": existing.delivery_id,
                "status": existing.status
            }
        }), 200

    shipment = Shipment(
        cart_id=cart_id,
        address_id=address_id,
        status="unassigned",
        delivery_id=None
    )

    db.session.add(shipment)
    db.session.commit()

    return jsonify({
        "msg": "Shipment creado",
        "shipment": shipment.serialize() if hasattr(shipment, "serialize") else {
            "id": shipment.id,
            "cart_id": shipment.cart_id,
            "address_id": shipment.address_id,
            "delivery_id": shipment.delivery_id,
            "status": shipment.status
        }
    }), 201

# Endpints Google Pay -layla


@api.route("/payments/google/confirm", methods=["POST"])
def google_pay_confirm():
    body = request.get_json(silent=True) or {}

    cart_id = body.get("cart_id")
    address_id = body.get("address_id")

    if not cart_id:
        return jsonify({"msg": "Falta cart_id"}), 400

    if not address_id:
        return jsonify({"msg": "Falta address_id"}), 400

    print("GOOGLE PAY TEST -> cart_id:", cart_id, "address_id:", address_id)

    return pay_cart(int(cart_id))

# _______________________Rutas Paypal____________________________


PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com"


def get_paypal_access_token():
    client_id = os.getenv("PAYPAL_CLIENT_ID")
    client_secret = os.getenv("PAYPAL_CLIENT_SECRET")
    credentials = b64encode(f"{client_id}:{client_secret}".encode()).decode()

    response = http_requests.post(
        f"{PAYPAL_BASE_URL}/v1/oauth2/token",
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        data="grant_type=client_credentials",
    )
    return response.json()["access_token"]


@api.route("/orders", methods=["POST"])
def create_order():
    request_body = request.get_json()

    if not request_body or "cart" not in request_body:
        return jsonify({"error": "Cart data missing"}), 400

    cart = request_body["cart"]
    items_from_front = cart.get("items", [])
    total = cart.get("total", 0)

    paypal_items = []
    for item in items_from_front:
        precio_con_descuento = float(
            item["unit_amount"]) * (1 - float(item.get("descuento", 0)))
        paypal_items.append({
            "name": item["name"],
            "unit_amount": {
                "currency_code": "EUR",
                "value": str(round(precio_con_descuento, 2))
            },
            "quantity": str(item["quantity"]),
            "category": "PHYSICAL_GOODS"
        })

    try:
        access_token = get_paypal_access_token()
        response = http_requests.post(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json={
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "EUR",
                        "value": str(round(total, 2)),
                        "breakdown": {
                            "item_total": {
                                "currency_code": "EUR",
                                "value": str(round(total, 2))
                            }
                        }
                    },
                    "items": paypal_items
                }]
            }
        )
        return jsonify(response.json()), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@api.route("/orders/<order_id>/capture", methods=["POST"])
def capture_order(order_id):
    try:
        access_token = get_paypal_access_token()
        response = http_requests.post(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            }
        )
        return jsonify(response.json()), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# _______________________Fin Rutas Paypal____________________________

@api.route("/repartidores/pendientes", methods=["GET"])
def repartidores_pendientes():
    pendientes = Delivery.query.filter_by(is_approved=False).all()
    return jsonify([d.serialize() for d in pendientes]), 200


@api.route("/repartidores/<int:delivery_id>/aprobar", methods=["PUT"])
def aprobar_repartidor(delivery_id):
    delivery = Delivery.query.get(delivery_id)

    if not delivery:
        return jsonify({"msg": "Repartidor no encontrado"}), 404

    delivery.is_approved = True
    db.session.commit()

    return jsonify({"msg": "Repartidor aprobado correctamente"}), 200


@api.route("/repartidores/pendientes/count", methods=["GET"])
def count_repartidores_pendientes():
    count = Delivery.query.filter_by(is_approved=False).count()
    return jsonify({"count": count}), 200
