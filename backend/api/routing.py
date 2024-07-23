from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/api/msg/(?P<conversation_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/api/addconv/', consumers.AddConvConsumer.as_asgi()),
]
