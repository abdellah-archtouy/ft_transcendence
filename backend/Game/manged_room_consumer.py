from channels.generic.websocket import AsyncWebsocketConsumer
import json
import time
from Game.room import Room
from User.models import User
from datetime import datetime
from Notifications.views import create_notification
from asgiref.sync import sync_to_async
from channels.exceptions import StopConsumer
from .consumers import RoomManager

pre_room_manager = RoomManager()

class managed_room_consumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            path = self.scope["path"]
            if "ws/game/friends" in path:
                self.gamemode = "friends"
            self.room_name = self.scope["url_route"]["kwargs"]["room"]
            self.user_id = int(self.scope["url_route"]["kwargs"]["uid"])
            self.room_group_name = self.room_name
            self.connection_type = "Managed_room"
            if self.room_group_name in pre_room_manager.rooms:
                self.room = pre_room_manager.rooms[self.room_group_name]
                if self.room.findUser(self.user_id):
                    if self.user_id not in self.room.channel_names:
                        self.room.channel_names[self.user_id] = [self.channel_name]
                    else:
                        self.room.channel_names[self.user_id].append(self.channel_name)
                    if len(self.room.channel_names) > 1:
                        self.room.is_full = True
                    self.channel_name = self.channel_name
                    pre_room_manager.add_channel_name(self.channel_name, self.user_id)
                    await pre_room_manager.start_periodic_updates(self)
                await self.channel_layer.group_add(self.room_group_name, self.channel_name)
                await self.accept()
        except Exception as e:
            raise e

    async def disconnect(self, close_code):
        # Leave the group
        await pre_room_manager.remove_user_room(self)
        if self.room_group_name and self.channel_name:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        room = pre_room_manager.get_room(self.room_group_name)
        if not room:
            return

        action_type = data.get("type")
        key = data.get("key")

        if action_type == "keypress":
            paddle = room.get_paddle_by_user(self.user_id)
            speed = paddle.speed
            if key == "KeyW" or key == "ArrowUp":
                paddle.set_Player_attribute("velocityY", -5 * speed)
            if key == "KeyS" or key == "ArrowDown":
                paddle.set_Player_attribute("velocityY", 5 * speed)
            if key == "Space":
                if room.room_paused:
                    room.room_resume()
                    room.room_paused = False
                else:
                    room.room_pause()
                    room.room_paused = True

        elif action_type == "keydown":
            paddle = room.get_paddle_by_user(self.user_id)
            paddle.set_Player_attribute("velocityY", 0)