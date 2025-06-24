from flask import Blueprint, request, jsonify,make_response
from app.models.user import User
from app import db
from flask_jwt_extended import create_access_token
from datetime import timedelta
from marshmallow import ValidationError
from app.schemas.auth import RegisterSchema, LoginSchema

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

register_schema = RegisterSchema()
login_schema = LoginSchema()

@auth_bp.route('/register', methods=['POST'])
def register():
    json_data = request.get_json()
    if not json_data:
        return jsonify({'error': 'No input data provided'}), 400
    try:
        data = register_schema.load(json_data)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    is_approved = True if data['role'] == 'farmer' else False
    user = User(
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=data['role'],
        is_approved=is_approved
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity={'id': str(user.id), 'role': user.role})
    response = make_response({"message": "Login successful"})
    response.set_cookie(
        "access_token",
        access_token,
        # httponly=True,
        # secure=False,
        samesite='lax',
        # max_age=36000
    )
    return response

@auth_bp.route('/login', methods=['POST'])
def login():
    json_data = request.get_json()
    if not json_data:
        return jsonify({'error': 'No input data provided'}), 400
    try:
        data = login_schema.load(json_data)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity={'id': str(user.id), 'role': user.role})
    response = make_response({"message": "Login successful"})
    response.set_cookie(
        "access_token",
        access_token,
        # httponly=True,
        # secure=False,
        samesite='lax',
        # max_age=36000
    )
    return response

@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = make_response({"message": "Logout successful"})
    response.set_cookie("access_token", "", expires=0)
    return response