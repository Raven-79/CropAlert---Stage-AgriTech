from datetime import timedelta
import os
from dotenv import load_dotenv
load_dotenv()
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default_secret_key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/dbname')
    JWT_ACCESS_TOKEN_EXPIRES  = timedelta(hours=1)  
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_TOKEN_LOCATION = [ 'cookies']
    JWT_ACCESS_COOKIE_NAME = 'access_token'
    JWT_COOKIE_SECURE = False
    JWT_COOKIE_CSRF_PROTECT = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY' ,'default_jwt_secret_key')