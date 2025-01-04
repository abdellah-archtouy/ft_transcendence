from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .consumers import RoomManager

pre_room_manager = RoomManager()


# Create a key mapping for better maintenance
KEY_ACTIONS = {
    "KeyW": {"direction": "up", "velocity": -5},
    "ArrowUp": {"direction": "up", "velocity": -5},
    "KeyS": {"direction": "down", "velocity": 5},
    "ArrowDown": {"direction": "down", "velocity": 5},
    "Space": {"direction": "pause"},
}


class managed_room_consumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.gamemode = "friends" if "ws/game/friends" in self.scope["path"] else None
            self.room_name = self.scope["url_route"]["kwargs"]["room"] # catch the room name from the path
            self.user_id = int(self.scope["url_route"]["kwargs"]["uid"])
            self.room_group_name = self.room_name

            self.connection_type = "Managed_room"

            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

            validated = await self.validate_room()
            if not validated: # Verify room existence and ensure the user is a part of room
                return

            if self.user_id not in self.room.channel_names:
                self.room.channel_names[self.user_id] = []
            self.room.channel_names[self.user_id].append(self.channel_name)

            if len(self.room.channel_names) > 1:
                self.room.is_full = True
            self.channel_name = self.channel_name
            pre_room_manager.add_channel_name(self.channel_name, self.user_id)
            await pre_room_manager.start_periodic_updates(self)
        except Exception as e:
            raise e
        
    async def validate_room(self):
        if self.room_group_name not in pre_room_manager.rooms:
            await self.send(text_data=json.dumps({"error": "There is no room with this name"}))
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            await pre_room_manager.remove_user_room(self)
            return False
        self.room = pre_room_manager.rooms[self.room_group_name]
        if not self.room.findUser(self.user_id):
            await self.send(text_data=json.dumps({"error": "You are not part of this room"}))
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            await pre_room_manager.remove_user_room(self)
            return False
        return True

    async def disconnect(self, code):
        # Leave the group
        await pre_room_manager.remove_user_room(self)
        if self.room_group_name and self.channel_name:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)

            room = pre_room_manager.get_room(self.room_group_name)
            if not room:
                return

            action_type = data.get("type")
            key = data.get("key")

            if action_type == "keypress":

                paddle = room.get_paddle_by_user(self.user_id)

                if key in KEY_ACTIONS:
                    action = KEY_ACTIONS[key]

                    if action["direction"] == "pause":
                        if room.room_paused:
                            room.room_resume()
                            room.room_paused = False
                        else:
                            room.room_pause()
                            room.room_paused = True
                        await self.channel_layer.group_send(
                        self.room_group_name,
                            {
                                'type': 'chat_message',
                                'room_paused': room.room_paused,
                            }
                        )
                    else:
                        speed = paddle.speed
                        paddle.set_Player_attribute("velocityY", action["velocity"] * speed)

            elif action_type == "keydown":
                paddle = room.get_paddle_by_user(self.user_id)
                paddle.set_Player_attribute("velocityY", 0)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid message format"}))