from channels.generic.websocket import AsyncWebsocketConsumer
import json

class notification_consumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.channel_name = self.channel_name
        self.group_name = f"Notif_{self.user_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        

    async def disconnect(self, close_code):
        # Leave the group
        if self.group_name and self.channel_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_notification(self, event):
        # Send the notification to WebSocket
        notification = event["notification"]
        await self.send(text_data=json.dumps(notification))   