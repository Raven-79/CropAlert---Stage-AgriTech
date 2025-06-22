
from marshmallow import fields, ValidationError
from geoalchemy2.shape import to_shape
from shapely.geometry import Point
import json

class PointField(fields.Field):
    def _serialize(self, value, attr, obj, **kwargs):
        if value is None:
            return None
        point = to_shape(value) 
        return {"lat": point.y, "lng": point.x}

    def _deserialize(self, value, attr, data, **kwargs):
        try:
            lat = value["lat"]
            lng = value["lng"]
            return f'POINT({lng} {lat})'
        except Exception:
            raise ValidationError("Invalid point format. Expected {'lat': float, 'lng': float}")
