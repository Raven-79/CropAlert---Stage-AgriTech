from flask import Flask
from .config import Config
from .extensions import db, bcrypt, jwt



def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    return app