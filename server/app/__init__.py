from flask import Flask
from .config import Config
from .extensions import db, bcrypt, jwt
import os
from dotenv import load_dotenv
from .routes.auth import auth_bp
load_dotenv()


def create_app():
    print("Creating Flask app with configuration from Config class...")
    app = Flask(__name__)
    app.config.from_object(Config)
    app.register_blueprint(auth_bp)
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

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

    return app