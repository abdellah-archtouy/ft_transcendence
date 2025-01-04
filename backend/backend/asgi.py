"""
ASGI config for my project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""
import os
import django


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()


from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

import User.routing
import Chat.routing
import Game.routing
import Notifications.routing
import Tournament.routing

websocket_urlpatterns = (
    Chat.routing.websocket_urlpatterns
    + Game.routing.websocket_urlpatterns
    + Notifications.routing.websocket_urlpatterns
    + Tournament.routing.websocket_urlpatterns
    + User.routing.websocket_urlpatterns
)

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": AuthMiddlewareStack(URLRouter(websocket_urlpatterns)),
    }
)
