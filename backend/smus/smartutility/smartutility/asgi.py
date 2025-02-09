import os
import django
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from api.routing import websocket_urlpatterns
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartutility.settings")
django.setup()  # Ensure Django settings are loaded

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
