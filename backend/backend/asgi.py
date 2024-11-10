"""
ASGI config for myChat project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# from Chat import routing
import Chat.routing
import Game.routing
import Notifications.routing
import Tournament.routing

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

websocket_urlpatterns = (
    Chat.routing.websocket_urlpatterns
    + Game.routing.websocket_urlpatterns
    + Notifications.routing.websocket_urlpatterns
    + Tournament.routing.websocket_urlpatterns
)

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
