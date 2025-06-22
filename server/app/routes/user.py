from flask import Blueprint, request, jsonify,make_response, abort
from app.models.user import User
from app import db
from app.decorators.role import role_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.schemas.user import UserSchema, UserUpdateSchema, UserPasswordUpdateSchema
from marshmallow import ValidationError

user_bp = Blueprint('user', __name__, url_prefix='/user')

def get_current_user_or_404():
    identity = get_jwt_identity()
    user = User.query.get(identity['id'])
    if not user:
        abort(404, description="User not found")
    return user

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user = get_current_user_or_404()
    if not user.is_approved:
        return jsonify({'error': 'User is not approved'}), 403

    user_schema = UserSchema()
    user_data = user_schema.dump(user)  
    return jsonify(user_data), 200


@user_bp.route('/profile/update', methods=['PUT'])
@jwt_required()
def update_profile():
    user = get_current_user_or_404()

    json_data = request.get_json()
    if not json_data:
        return jsonify({'error': 'No input data provided'}), 400

    schema = UserUpdateSchema()
    try:
        data = schema.load(json_data) 
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    
    for key, value in data.items():
        if key == 'subscribed_crops' and user.role == 'farmer':
            user.subscribed_crops = value
        elif key != 'subscribed_crops':
            setattr(user, key, value)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500

    return jsonify({'message': 'Profile updated successfully'}), 200

    
@user_bp.route('/profile/update_password', methods=['PUT'])
@jwt_required()
def update_password():
    user = get_current_user_or_404()

    json_data = request.get_json()
    if not json_data:
        return jsonify({'error': 'No input data provided'}), 400

    schema = UserPasswordUpdateSchema()
    try:
        data = schema.load(json_data)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    old_password = data['old_password']
    new_password = data['new_password']

    if not user.check_password(old_password):
        return jsonify({'error': 'Old password is incorrect'}), 401

    user.set_password(new_password)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update password', 'details': str(e)}), 500

    return jsonify({'message': 'Password updated successfully'}), 200

