from django.urls import re_path, path
from . import consumers
from . import local_consumer

websocket_urlpatterns = [
    re_path(r'ws/game/Local/(?P<username1>[\w\-\.]+)/(?P<username2>[\w\-\.]+)/?$', local_consumer.LocalConsumer.as_asgi()),
    re_path(r'ws/game/(?P<gamemode>[\w\-\.]+)/(?P<uid>[\w\-\.]+)/?$', consumers.GameConsumer.as_asgi()),
    re_path(r'ws/game/(?P<gamemode>[\w\-\.]+)/(?P<botmode>[\w\-\.]+)/(?P<uid>[\w\-\.]+)/?$', consumers.GameConsumer.as_asgi()),
]