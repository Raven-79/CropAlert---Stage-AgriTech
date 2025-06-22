
from marshmallow_sqlalchemy import SQLAlchemySchema, auto_field
from marshmallow import fields, validate, validates, ValidationError, Schema
from app.models.user import User
from app.schemas.fields import PointField

class UserSchema(SQLAlchemySchema):
    class Meta:
        model = User

    id = auto_field(dump_only=True)
    email = auto_field(required=True, validate=validate.Email())
    first_name = auto_field(required=True, validate=validate.Length(min=1, max=50))
    last_name = auto_field(required=True, validate=validate.Length(min=1, max=50))
    role = auto_field(required=True, validate=validate.OneOf([ "farmer", "agronomist"]))
    is_approved = auto_field(dump_only=True)
    subscribed_crops = auto_field()
    location = PointField()
    created_alerts = fields.Nested('AlertSchema', many=True, dump_only=True)  

class UserRegisterSchema(UserSchema):
    password = fields.String(required=True, load_only=True, validate=validate.Length(min=8))
    
    @validates('password')
    def validate_password_strength(self, value):
        if '123' in value:
            raise ValidationError("Password is too weak")

class UserUpdateSchema(Schema):
    first_name = fields.Str(validate=validate.Length(min=1, max=50))
    last_name = fields.Str(validate=validate.Length(min=1, max=50))
    location = PointField()
    subscribed_crops = fields.List(fields.Str())


class UserPasswordUpdateSchema(Schema):
    old_password = fields.Str(required=True, load_only=True)
    new_password = fields.Str(required=True, load_only=True, validate=validate.Length(min=8))