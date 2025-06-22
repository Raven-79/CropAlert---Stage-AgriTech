from marshmallow import Schema, fields, validate, ValidationError

class RegisterSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    first_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    last_name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    role = fields.Str(required=True, validate=validate.OneOf(["agronomist", "farmer"]))

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)