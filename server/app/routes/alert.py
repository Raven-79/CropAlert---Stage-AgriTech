from datetime import datetime
from flask import Blueprint, request, jsonify, abort
from app.models.user import User
from app.models.alert import Alert
from app import db
from app.decorators.role import role_required
from flask_jwt_extended import jwt_required
from geoalchemy2.shape import to_shape
from app.routes.user import get_current_user_or_404
from geoalchemy2.elements import WKTElement
from marshmallow import ValidationError
from app.schemas.alert import AlertSchema, CreateAlertSchema, UpdateAlertSchema

alert_bp = Blueprint('alert', __name__, url_prefix='/api/alert')

alert_schema = AlertSchema()
alerts_schema = AlertSchema(many=True)
create_alert_schema = CreateAlertSchema()
update_alert_schema = UpdateAlertSchema()


@alert_bp.route('/create', methods=['POST'])
@jwt_required()
@role_required('agronomist')
def create_alert():
    user = get_current_user_or_404()
    if not user.can_make_alert():
        return jsonify({'error': 'Unauthorized to create alerts'}), 403

    json_data = request.get_json()
    if not json_data:
        return jsonify({'error': 'No input data provided'}), 400


    try:
        data = create_alert_schema.load(json_data)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

    longitude, latitude = data['location']
    location_wkt = WKTElement(f'POINT({longitude} {latitude})', srid=4326)

    alert = Alert(
        title=data['title'],
        description=data.get('description', ''),
        severity=data['severity'],
        alert_type=data['alert_type'],
        crop_type=data['crop_type'],
        expires_at=data['expires_at'],
        location=location_wkt,
        creator_id=user.id
    )

    try:
        db.session.add(alert)
        db.session.commit()
        result = alert_schema.dump(alert)
        return jsonify({'message': 'Alert created successfully', 'alert': result}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create alert', 'details': str(e)}), 500


@alert_bp.route('/<int:alert_id>', methods=['GET'])
@jwt_required()
def get_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    if alert.is_expired():
        return jsonify({'error': 'Alert has expired'}), 410

    result = alert_schema.dump(alert)
    
    result['location'] = [to_shape(alert.location).x, to_shape(alert.location).y]

    return jsonify(result), 200


@alert_bp.route('/<int:alert_id>', methods=['DELETE'])
@jwt_required()
@role_required('agronomist')
def delete_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404

    user = get_current_user_or_404()
    if user.id != alert.creator_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized to delete this alert'}), 403

    try:
        db.session.delete(alert)
        db.session.commit()
        return jsonify({'message': 'Alert deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete alert', 'details': str(e)}), 500


@alert_bp.route('/<int:alert_id>/update', methods=['PUT'])
@jwt_required()
@role_required('agronomist')
def update_alert(alert_id):
    alert = Alert.query.get(alert_id)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404

    user = get_current_user_or_404()
    if user.id != alert.creator_id and user.role != 'admin':
        return jsonify({'error': 'Unauthorized to update this alert'}), 403

    json_data = request.get_json()
    if not json_data:
        return jsonify({'error': 'No input data provided'}), 400

    
    try:
        data = update_alert_schema.load(json_data)
    except ValidationError as err:
        return jsonify({'errors': err.messages}), 400

   
    if 'location' in data:
        longitude, latitude = data['location']
        data['location'] = WKTElement(f'POINT({longitude} {latitude})', srid=4326)
    else:
        data['location'] = alert.location  

  
    for key, value in data.items():
        setattr(alert, key, value)

    try:
        db.session.commit()
        result = alert_schema.dump(alert)
       
        result['location'] = [to_shape(alert.location).x, to_shape(alert.location).y]
        return jsonify({'message': 'Alert updated successfully', 'alert': result}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update alert', 'details': str(e)}), 500


@alert_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_alerts():
    alerts = Alert.query.all()
    valid_alerts = [alert for alert in alerts if not alert.is_expired()]
    result = alerts_schema.dump(valid_alerts)

    for idx, alert in enumerate(valid_alerts):
        result[idx]['location'] = [to_shape(alert.location).x, to_shape(alert.location).y]

    return jsonify(result), 200


@alert_bp.route('/my_alerts', methods=['GET'])
@jwt_required()
def get_my_alerts():
    user = get_current_user_or_404()
    alerts = Alert.query.filter_by(creator_id=user.id).all()
    valid_alerts = [alert for alert in alerts if not alert.is_expired()]
    result = alerts_schema.dump(valid_alerts)

    for idx, alert in enumerate(valid_alerts):
        result[idx]['location'] = [to_shape(alert.location).x, to_shape(alert.location).y]

    return jsonify(result), 200


@alert_bp.route('/search', methods=['POST'])
@jwt_required()
def search_alerts():
    json_data = request.get_json()
    if not json_data:
        return jsonify({'error': 'No input data provided'}), 400

    location = json_data.get('location')
    crop_type = json_data.get('crop_type')
    radius = json_data.get('radius', 10000)

    if not location:
        return jsonify({'error': 'Location is required for search'}), 400
    if not crop_type:
        return jsonify({'error': 'Crop type is required for search'}), 400
    if not isinstance(location, list) or len(location) != 2:
        return jsonify({'error': 'Location must be a list with [longitude, latitude]'}), 400
    longitude, latitude = location
    if not (-180 <= longitude <= 180 and -90 <= latitude <= 90):
        return jsonify({'error': 'Invalid coordinates for location'}), 400
    if not isinstance(radius, (int, float)) or radius <= 0:
        return jsonify({'error': 'Radius must be a positive number'}), 400

    location_wkt = WKTElement(f'POINT({longitude} {latitude})', srid=4326)

    alerts = Alert.query.filter(
        Alert.location.ST_DWithin(location_wkt, radius) &
        (Alert.crop_type == crop_type)
    ).all()

    valid_alerts = [alert for alert in alerts if not alert.is_expired()]
    result = alerts_schema.dump(valid_alerts)
    for idx, alert in enumerate(valid_alerts):
        result[idx]['location'] = [to_shape(alert.location).x, to_shape(alert.location).y]

    if not result:
        return jsonify({'message': 'No alerts found for the specified criteria'}), 404
    return jsonify(result), 200
