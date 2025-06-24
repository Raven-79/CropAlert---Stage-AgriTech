from app.models.user import User
from app.models.alert import Alert
from app.extensions import socketio
from geoalchemy2.shape import to_shape
from geoalchemy2.elements import WKTElement
from sqlalchemy import and_
import logging

class NotificationService:
    
    @staticmethod
    def notify_farmers_about_alert(alert):
        """
        Send real-time notifications to farmers who should receive this alert
        based on their location and subscribed crops
        """
        try:
            # Get alert location coordinates
            alert_location = to_shape(alert.location)
            alert_longitude = alert_location.x
            alert_latitude = alert_location.y
            
            # Create WKT element for spatial query
            location_wkt = WKTElement(f'POINT({alert_longitude} {alert_latitude})', srid=4326)
            radius = 10000  # 10km radius
            
            # Find farmers who should receive this notification
            relevant_farmers = User.query.filter(
                and_(
                    User.role == 'farmer',
                    User.is_approved == True,
                    User.location.is_not(None),
                    User.location.ST_DWithin(location_wkt, radius),
                    User.subscribed_crops.contains([alert.crop_type])
                )
            ).all()
            
            # Prepare notification data
            notification_data = {
                'alert_id': alert.id,
                'title': alert.title,
                'description': alert.description,
                'severity': alert.severity,
                'alert_type': alert.alert_type,
                'crop_type': alert.crop_type,
                'created_at': alert.created_at.isoformat(),
                'expires_at': alert.expires_at.isoformat() if alert.expires_at else None,
                'location': [alert_longitude, alert_latitude],
                'creator_name': f"{alert.creator.first_name} {alert.creator.last_name}"
            }
            
            # Send notifications to relevant farmers
            notification_count = 0
            for farmer in relevant_farmers:
                try:
                    socketio.emit(
                        'new_alert_notification',
                        notification_data,
                        room=f"user_{farmer.id}"
                    )
                    notification_count += 1
                    logging.info(f"Notification sent to farmer {farmer.id} ({farmer.first_name} {farmer.last_name})")
                except Exception as e:
                    logging.error(f"Failed to send notification to farmer {farmer.id}: {str(e)}")
            
            logging.info(f"Alert {alert.id} notifications sent to {notification_count} farmers")
            return notification_count
            
        except Exception as e:
            logging.error(f"Error in notify_farmers_about_alert: {str(e)}")
            return 0
    
    @staticmethod
    def send_alert_update_notification(alert, update_type='updated'):
        """
        Send notifications when an alert is updated or deleted
        """
        try:
            alert_location = to_shape(alert.location)
            location_wkt = WKTElement(f'POINT({alert_location.x} {alert_location.y})', srid=4326)
            radius = 10000
            
            relevant_farmers = User.query.filter(
                and_(
                    User.role == 'farmer',
                    User.is_approved == True,
                    User.location.is_not(None),
                    User.location.ST_DWithin(location_wkt, radius),
                    User.subscribed_crops.contains([alert.crop_type])
                )
            ).all()
            
            notification_data = {
                'alert_id': alert.id,
                'title': alert.title,
                'update_type': update_type,  # 'updated' or 'deleted'
                'message': f"Alert '{alert.title}' has been {update_type}"
            }
            
            for farmer in relevant_farmers:
                socketio.emit(
                    'alert_update_notification',
                    notification_data,
                    room=f"user_{farmer.id}"
                )
            
        except Exception as e:
            logging.error(f"Error in send_alert_update_notification: {str(e)}")
