
from app.extensions import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'agronomist' or 'farmer' or 'admin'
    is_approved = db.Column(db.Boolean, default=False) # For admin users, this can be used to approve or disapprove users
    subscribed_crops = db.Column(db.ARRAY(db.String)) # For farmers: ['wheat', 'corn']
    location = db.Column(db.String(100), nullable=True) #to be changed to cordinates later
    created_alerts = db.relationship('Alert', backref='creator', lazy=True)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)
    
    def can_make_alert(self):
        return self.role == 'agronomist' and self.is_approved
    
    def __repr__(self):
        return f'<User {self.username}>'