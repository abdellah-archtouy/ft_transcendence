from django.urls import re_path
from . import consumers
# from . import bot_consumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<gamemode>[\w\-\.]+)/(?P<uid>[\w\-\.]+)/?$', consumers.GameConsumer.as_asgi()),
]