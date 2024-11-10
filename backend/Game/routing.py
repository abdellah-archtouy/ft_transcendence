from django.urls import re_path, path
from . import consumers, local_consumer

websocket_urlpatterns = [
    re_path(
        r"ws/game/Local/(?P<username1>[\w\-\.]+)/(?P<username2>[\w\-\.]+)/?$",
        local_consumer.LocalConsumer.as_asgi(),
    ),
    re_path(r"ws/game/Remote/(?P<uid>[\w\-\.]+)/?$", consumers.GameConsumer.as_asgi()),
    re_path(
        r"ws/game/bot/(?P<botmode>[\w\-\.]+)/(?P<uid>[\w\-\.]+)/?$",
        consumers.GameConsumer.as_asgi(),
    ),
]
