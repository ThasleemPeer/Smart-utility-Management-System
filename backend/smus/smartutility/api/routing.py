from django.urls import re_path
from .consumers import *

websocket_urlpatterns = [
    re_path(r"ws/chat/$", ChatConsumer.as_asgi()),
    re_path(r"ws/notifications/(?P<user_id>\d+)/$", NotificationConsumer.as_asgi()),
]
