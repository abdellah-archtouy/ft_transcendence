import traceback, asyncio, json
from channels.generic.websocket import AsyncWebsocketConsumer
from .common_functions import start, join_room

rooms = {}

def create_local_info(username: str) -> dict:
    local_info = {
        "username": username,
        "avatar": "/media/avatars/botProfile.svg",
        "goals": 0,
    }
    return local_info

class LocalConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.username1 = self.scope['url_route']['kwargs'].get('username1')
            self.username2 = self.scope['url_route']['kwargs'].get('username2')
            self.gamemode = "Local"
            self.channel_name = self.channel_name
            self.room_group_name = await self.join_or_create_room()
            await self.start_periodic_updates()
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        except Exception as e:
            tb = traceback.extract_tb(e.__traceback__)
            print(f"{tb[-1].name} : {e}")

    async def assign_users_info(self):
        self.user1 = create_local_info(self.username1)
        self.user2 = create_local_info(self.username2)

    async def start_periodic_updates(self):
        room = rooms.get(self.room_group_name)
        await self.assign_users_info()
        room.keep_updating = True
        self.update_thread = asyncio.ensure_future(self.send_periodic_updates())
    
    async def send_periodic_updates(self):
        room = rooms[self.room_group_name]
        while room and room.keep_updating and not room.winner:
            if room:
                await start(room, self.user1, self.user2)
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'winner': room.winner,
                        'user1': self.user1,
                        'user2': self.user2,
                        'ballInfo': room.ball.attributes,
                        'rightPaddle': room.rightPaddle.attributes,
                        'leftPaddle': room.leftPaddle.attributes,
                        'room_paused': room.room_paused
                    }
                )
                await asyncio.sleep(0.02)
            else:
                room.keep_updating = False
    
    async def join_or_create_room(self):
        room_name = join_room(self, rooms)
        return room_name

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    def move_players(self, room, key):
        if key == "KeyW":
            room.leftPaddle.set_Player_attribute("velocityY", -5)
        if key == "KeyS":
            room.leftPaddle.set_Player_attribute("velocityY", 5)
        if key == "ArrowUp":
            room.rightPaddle.set_Player_attribute("velocityY", -5)
        if key == "ArrowDown":
            room.rightPaddle.set_Player_attribute("velocityY", 5)

    async def receive(self, text_data):
        data = json.loads(text_data)
        room = rooms.get(self.room_group_name)
        if not room:
            return

        action_type = data.get('type')
        key = data.get('key')

        if action_type == 'keypress':
            self.move_players(room, key)
            if key == 'Space':
                if room.room_paused:
                    room.room_resume()
                    room.room_paused = False
                else:
                    room.room_pause()
                    room.room_paused = True

        elif action_type == 'keydown':
            if key == "KeyW" or key == "KeyS":
                room.leftPaddle.set_Player_attribute("velocityY", 0)
            if key == "ArrowUp" or key == "ArrowDown":
                room.rightPaddle.set_Player_attribute("velocityY", 0)