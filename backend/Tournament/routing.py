from django.urls import re_path, path
from . import consumer

websocket_urlpatterns = [
    re_path(r'ws/tournament/(?P<user_id>[\w\-\.]+)/?$', consumer.tournament_consumer.as_asgi())
]