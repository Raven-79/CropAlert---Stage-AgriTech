from flask import Blueprint, request, jsonify,make_response
from app.models.user import User
from app import db
from app.decorators.role import role_required
from flask_jwt_extended import jwt_required



admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

@admin_bp.route('/users', methods=['GET'])
@role_required('admin')
@jwt_required()
def get_users():
    users = User.query.all()
    user_list = []
    for user in users:
        if user.role == 'admin':
            continue
        user_list.append({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_approved': user.is_approved
        })
    return jsonify(user_list), 200



@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@role_required('admin')
@jwt_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.role == 'admin':
        return jsonify({'error': 'Cannot delete admin user'}), 403
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200

@admin_bp.route('/users/approve/<int:user_id>', methods=['POST'])
@role_required('admin')
@jwt_required()
def approve_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    if user.role != "agronomist":
        return jsonify({'error': 'Only agronomist users can be approved'}), 400
    if user.is_approved:
        return jsonify({'error': 'User is already approved'}), 400
    user.is_approved = True
    db.session.commit()
    return jsonify({'message': 'User approved successfully'}), 200