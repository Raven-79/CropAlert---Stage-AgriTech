from flask import Blueprint, request, jsonify,make_response
from app.models.user import User
from app import db
from flask_jwt_extended import create_access_token
from datetime import timedelta

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    password = data.get('password')
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    first_name = data.get('first_name')
    if not first_name:
        return jsonify({'error': 'First name is required'}), 400
    last_name = data.get('last_name')
    if not last_name:
        return jsonify({'error': 'Last name is required'}), 400
    role = data.get('role')
    if role not in ['agronomist', 'farmer']:
        return jsonify({'error': 'Invalid role'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already exists'}), 400
    is_approved = True if role == 'farmer' else False
    user = User(email=email, first_name=first_name, last_name=last_name, role=role, is_approved=is_approved)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    password = data.get('password')
    if not password:
        return jsonify({'error': 'Password is required'}), 400
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email or password'}), 401
    access_token = create_access_token(identity={'id': user.id, 'role': user.role})
    response = make_response({"message": "Login successful"})
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=True,             
        samesite='Strict',       
        max_age=3600             
    )
    return response