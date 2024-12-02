from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import User

class stat_consumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
            self.user = await User.objects.aget(id=self.user_id)
            if self.user:
                self.group_name = f"stat"
                await self.set_user_update(True)
                await self.channel_layer.group_add(self.group_name, self.channel_name)
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

    async def set_user_update(self, boolean):
        self.user.stat = boolean
        await self.user.asave()

    async def disconnect(self, close_code):
        # Leave the group
        if self.group_name and self.channel_name:
            await self.set_user_update(False)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "send_stat",
                    "username": self.user.username,
                    "stat": self.user.stat,
                },
            )
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_stat(self, event):
        # Send the stat to WebSocket
        await self.send(text_data=json.dumps(event))