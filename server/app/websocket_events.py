from flask_socketio import emit, join_room, leave_room, disconnect
from flask import request
from flask_jwt_extended import decode_token, jwt_required
from app.models.user import User
from app.extensions import db
import logging

# Store connected users and their socket IDs
connected_users = {}

def register_websocket_events(socketio):
    
    @socketio.on('connect')
    def handle_connect(auth):
        """Handle client connection with JWT authentication"""
        try:
            if not auth or 'token' not in auth:
                print("No token provided")
                disconnect()
                return False
            
            # Decode JWT token
            token = auth['token']
            decoded_token = decode_token(token)
            user_id = decoded_token['sub']['id']
            
            # Get user from database
            user = User.query.get(user_id)
            if not user or not user.is_approved:
                print(f"User {user_id} not found or not approved")
                disconnect()
                return False
            
            # Store user connection
            connected_users[request.sid] = {
                'user_id': user_id,
                'user': user
            }
            
            # Join user to their personal room
            join_room(f"user_{user_id}")
            
            print(f"User {user.first_name} {user.last_name} connected with role {user.role}")
            emit('connection_status', {'status': 'connected', 'message': f'Welcome {user.first_name}!'})
            
        except Exception as e:
            print(f"Connection error: {str(e)}")
            disconnect()
            return False
    
    @socketio.on('disconnect')
    def handle_disconnect():
        """Handle client disconnection"""
        if request.sid in connected_users:
            user_data = connected_users[request.sid]
            user_id = user_data['user_id']
            
            # Leave user room
            leave_room(f"user_{user_id}")
            
            # Remove from connected users
            del connected_users[request.sid]
            
            print(f"User {user_id} disconnected")
    
    @socketio.on('join_location_room')  
    def handle_join_location_room(data):
        """Allow farmers to join location-based rooms for targeted notifications"""
        if request.sid not in connected_users:
            return
        
        user_data = connected_users[request.sid]
        user = user_data['user']
        
        if user.role == 'farmer' and user.location:
            # Create a location-based room identifier
            # You can customize this based on your location grouping logic
            location_room = f"location_{data.get('location_id', 'default')}"
            join_room(location_room)
            emit('joined_location_room', {'room': location_room})
