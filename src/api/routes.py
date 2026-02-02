"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Provider
from api.utils import generate_sitemap, APIException
from flask_cors import CORS

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

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
