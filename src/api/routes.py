"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
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

