from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.db import transaction
import json
from .models import User

users = {}

@database_sync_to_async
def set_user_update(boolean, user):
    with transaction.atomic():
        user_obj = User.objects.select_for_update().get(id=user.id)
        user_obj.stat = boolean
        user_obj.save(update_fields=['stat'])

def add_to_dict(user_id: int, channel_name):
    global users
    if user_id not in users:
        users[user_id] = []
    users[user_id].append(channel_name)

class stat_consumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.user_id = int(self.scope["url_route"]["kwargs"]["user_id"])
            self.user = await User.objects.aget(id=self.user_id)
            if self.user:
                self.group_name = f"stat"
                add_to_dict(self.user_id, self.channel_name)
                await self.channel_layer.group_add(self.group_name, self.channel_name)
                if self.user.stat != True:
                    await set_user_update(True, self.user)
                    await self.channel_layer.group_send(
                        self.group_name,
                        {
                            "type": "send_stat",
                            "username": self.user.username,
                            "stat": self.user.stat,
                        },
                    )
                await self.accept()
        except Exception as e:
            print(f"connect error: {e}")


    async def disconnect(self, close_code):
        global users
        if self.group_name and self.channel_name:
            if len(users[self.user_id]) == 1:
                if self.user.stat != False:
                    await set_user_update(False, self.user)
                    await self.channel_layer.group_send(
                        self.group_name,
                        {
                            "type": "send_stat",
                            "username": self.user.username,
                            "stat": self.user.stat,
                        },
                    )
            if self.channel_name in users[self.user_id]:
                users[self.user_id].remove(self.channel_name)
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_stat(self, event):
        # Send the stat to WebSocket
        await self.send(text_data=json.dumps(event))