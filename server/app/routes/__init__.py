from .auth import auth_bp
from .admin import admin_bp
from .user import user_bp

all_blueprints = [auth_bp, admin_bp, user_bp]