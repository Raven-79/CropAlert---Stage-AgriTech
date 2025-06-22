from app.extensions import db, bcrypt
from datetime import datetime

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    severity = db.Column(db.String(20))  # 'low', 'medium', 'high'
    alert_type = db.Column(db.String(50), nullable=False)  # 'pest', 'disease', 'weather', etc.
    crop_type = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
   
    def is_expired(self):
        if self.expires_at:
            return datetime.utcnow() > self.expires_at
        return False
    def __repr__(self):
        return f'<Alert {self.title} - {self.severity}>'
    