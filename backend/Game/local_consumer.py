import traceback, asyncio, json
from channels.generic.websocket import AsyncWebsocketConsumer
from .common_functions import start, join_room

def create_local_info(username: str) -> dict:
    local_info = {
        "username": username,
        "avatar": "/media/avatars/botProfile.svg",
        "goals": 0,
    }
    return local_info

class LocalRoomManager():
    def __init__(self) -> None:
        self.rooms = {}
        self.lock = None
        self.user1 = None
        self.user2 = None
    
    async def join_Local_room(self, LocalConsumer):
        lock = await self.get_lock()
        async with lock:
            name = join_room(LocalConsumer, self.rooms)
            return name

    async def get_lock(self):
        if self.lock is None:
            self.lock = asyncio.Lock()
        return self.lock

    async def remove_room(self, LocalConsumer):
        lock = await self.get_lock()
        async with lock:
            try:
                room = self.rooms.get(LocalConsumer.room_group_name)
                if room:
                    del self.rooms[LocalConsumer.room_group_name]
                    LocalConsumer.channel_layer.group_discard(LocalConsumer.room_group_name, LocalConsumer.channel_name)
                    room.keep_updating = False
            except Exception as e:
                print(f"remove_name: {e}")

    async def assign_users_info(self, LocalConsumer):
        LocalConsumer.user1 = create_local_info(LocalConsumer.username1)
        LocalConsumer.user2 = create_local_info(LocalConsumer.username2)

    async def start_periodic_updates(self, LocalConsumer):
        room = self.rooms.get(LocalConsumer.room_group_name)
        await self.assign_users_info(LocalConsumer)
        room.keep_updating = True
        self.update_thread = asyncio.ensure_future(self.send_periodic_updates(LocalConsumer))
    
    async def send_periodic_updates(self, LocalConsumer):
        room = self.rooms[LocalConsumer.room_group_name]
        while room and room.keep_updating and not room.winner:
            if room:
                await start(room, LocalConsumer.user1, LocalConsumer.user2)
                await LocalConsumer.channel_layer.group_send(
                    LocalConsumer.room_group_name,
                    {
                        'type': 'chat_message',
                        'winner': room.winner,
                        'user1': LocalConsumer.user1,
                        'user2': LocalConsumer.user2,
                        'ballInfo': room.ball.attributes,
                        'rightPaddle': room.rightPaddle.attributes,
                        'leftPaddle': room.leftPaddle.attributes,
                        'room_paused': room.room_paused
                    }
                )
                await asyncio.sleep(0.02)
            else:
                room.keep_updating = False

room_ma = LocalRoomManager()

class LocalConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # self.user_id = None
            self.username1 = self.scope['url_route']['kwargs'].get('username1')
            self.username2 = self.scope['url_route']['kwargs'].get('username2')
            self.gamemode = "Local"
            self.channel_name = self.channel_name
            self.room_group_name = await room_ma.join_Local_room(self)
            await room_ma.start_periodic_updates(self)
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
        except Exception as e:
            tb = traceback.extract_tb(e.__traceback__)
            print(f"{tb[-1].name} : {e}")

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
        room = room_ma.rooms.get(self.room_group_name)
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
    
    async def disconnect(self, code):
        try:
            await room_ma.remove_room(self)
        except Exception as e:
            print(f"disconnect: {e}")