from marshmallow import Schema, fields, validate, ValidationError, validates_schema
from datetime import datetime

# Optional: if you're using custom PointField
from app.schemas.fields import PointField  

SEVERITY_LEVELS = ["low", "medium", "high"]
ALERT_TYPES = ["pest", "disease", "weather"]

class AlertSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    description = fields.Str()
    severity = fields.Str(validate=validate.OneOf(SEVERITY_LEVELS))
    alert_type = fields.Str(validate=validate.OneOf(ALERT_TYPES))
    crop_type = fields.Str(required=True)
    created_at = fields.DateTime(dump_only=True)
    expires_at = fields.DateTime(format='iso')
    location = PointField(required=True)
    creator_id = fields.Int(dump_only=True)


class CreateAlertSchema(Schema):
    title = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    severity = fields.Str(required=True, validate=validate.OneOf(SEVERITY_LEVELS))
    alert_type = fields.Str(required=True, validate=validate.OneOf(ALERT_TYPES))
    crop_type = fields.Str(required=True)
    expires_at = fields.DateTime(required=True, format='%Y-%m-%dT%H:%M:%S')
    location = PointField(required=True)

    @validates_schema
    def validate_expiration(self, data, **kwargs):
        expires_at = data.get('expires_at')
        if expires_at and expires_at < datetime.utcnow():
            raise ValidationError("Expiration date must be in the future", field_name="expires_at")


class UpdateAlertSchema(Schema):
    title = fields.Str()
    description = fields.Str()
    severity = fields.Str(validate=validate.OneOf(SEVERITY_LEVELS))
    alert_type = fields.Str(validate=validate.OneOf(ALERT_TYPES))
    crop_type = fields.Str()
    expires_at = fields.DateTime(format='%Y-%m-%dT%H:%M:%S')
    location = PointField()

    @validates_schema
    def validate_expiration(self, data, **kwargs):
        expires_at = data.get('expires_at')
        if expires_at and expires_at < datetime.utcnow():
            raise ValidationError("Expiration date must be in the future", field_name="expires_at")
