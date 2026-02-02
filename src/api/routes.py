"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
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

# CRUD libros ---------------------------------


@app.route("/books", methods=["GET"])
def get_books():
    books = Book.query.all()
    return jsonify([b.serialize() for b in books]), 200


@app.route("/books/<int:book_id>", methods=["GET"])
def get_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"msg": "Libro no encontrado"}), 404
    return jsonify(book.serialize()), 200


@app.route("/books", methods=["POST"])
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


@app.route("/books/<int:book_id>", methods=["PUT"])
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


@app.route("/books/<int:book_id>", methods=["DELETE"])
def delete_book(book_id):
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"msg": "Libro no encontrado"}), 404

    db.session.delete(book)
    db.session.commit()
    return jsonify({"msg": "Libro eliminado"}), 200

# cambios 

    