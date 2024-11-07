from django.urls import re_path, path
from . import consumer

websocket_urlpatterns = [
    re_path(r'ws/notification/(?P<user_id>[\w\-\.]+)/?$', consumer.notification_consumer.as_asgi())
]