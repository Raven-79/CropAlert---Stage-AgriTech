from flask import Flask
from .config import Config
from .extensions import db, bcrypt, jwt
import os
from dotenv import load_dotenv
from .routes.auth import auth_bp
from .routes.user import user_bp
from .routes.admin import admin_bp
from .routes.alert import alert_bp
from flask_jwt_extended import JWTManager
from flask_cors import CORS

load_dotenv()


def create_app():
    print("Creating Flask app with configuration from Config class...")
    app = Flask(__name__)
    CORS(app,supports_credentials=True, origins=os.getenv("FRONTEND_URL", "*"), methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],allow_headers=["Content-Type", "Authorization"],)
    app.config.from_object(Config)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(alert_bp)
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    print(f"Cors origins set to {os.getenv('FRONTEND_URL', '*')}")
    from app.models.user import User 

    with app.app_context():
        db.create_all()

        admin = User.query.filter_by(role='admin').first()
        if not admin:
            admin = User(
                first_name='Admin',
                last_name='User',
                email = os.getenv("ADMIN_EMAIL","ad@gmail.com"),
                role='admin',
                is_approved=True
            )
            admin.set_password(os.getenv("ADMIN_PASSWORD","admin123"))
            db.session.add(admin)
            db.session.commit()
            print("Admin user created successfully.")
        else:
            print("Admin user already exists.")
    # print("JWT config:")
    # print("JWT_COOKIE_CSRF_PROTECT:", app.config["JWT_COOKIE_CSRF_PROTECT"])
    # print("JWT_TOKEN_LOCATION:", app.config["JWT_TOKEN_LOCATION"])

    return app