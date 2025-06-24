from .auth import auth_bp
from .admin import admin_bp
from .user import user_bp
from .alert import alert_bp

all_blueprints = [auth_bp, admin_bp, user_bp,alert_bp]