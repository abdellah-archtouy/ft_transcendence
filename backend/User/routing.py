from django.urls import re_path
from . import consumer

websocket_urlpatterns = [
    re_path(r'ws/stat/(?P<user_id>[\w\-\.]+)/?$', consumer.stat_consumer.as_asgi())
]