from firebase_admin import messaging
from api.models import Notification

def send_notification(user, message):
    # Save notification in DB
    Notification.objects.create(user=user, message=message)

    # Send Firebase notification
    if user.fcm_token:
        message = messaging.Message(
            notification=messaging.Notification(
                title="Booking Update",
                body=message,
            ),
            token=user.fcm_token,
        )
        response = messaging.send(message)
        print(f"FCM Notification Sent: {response}")
