import traceback, asyncio, json
from channels.generic.websocket import AsyncWebsocketConsumer
from .common_functions import start, join_room

class LocalRoomManager():
    def __init__(self) -> None:
        self.rooms = {}
        self.lock = None
        self.new_room_name = 1
    
    async def join_Local_room(self, LocalConsumer):
        lock = await self.get_lock()
        async with lock:
            name = await join_room(LocalConsumer, self)
            return name

    async def get_lock(self):
        if self.lock is None:
            self.lock = asyncio.Lock()
        return self.lock

    def create_local_info(self, username: str, room, obj) -> dict:
        local_info = {
            "username": username,
            "avatar": "/media/avatars/default_avatar.png",
            "goals": 0,
        }
        return local_info

    async def remove_room(self, LocalConsumer):
        lock = await self.get_lock()
        async with lock:
            try:
                room = self.rooms.get(LocalConsumer.room_group_name)
                if room:
                    del self.rooms[LocalConsumer.room_group_name]
            except Exception as e:
                print(f"remove_name: {e}")

    async def start_periodic_updates(self, LocalConsumer):
        room = self.rooms.get(LocalConsumer.room_group_name)
        room.keep_updating = True
        self.update_thread = asyncio.ensure_future(self.send_periodic_updates(LocalConsumer))
    
    async def send_periodic_updates(self, LocalConsumer):
        room = self.rooms[LocalConsumer.room_group_name]
        username1 = LocalConsumer.username1
        username2 = LocalConsumer.username2
        room.user1 = self.create_local_info(username1, room, LocalConsumer)
        room.user2 = self.create_local_info(username2, room, LocalConsumer)
        await LocalConsumer.channel_layer.send(
            LocalConsumer.channel_name,
            {
                'type': 'chat_message',
                'user1': room.user1,
                'user2': room.user2,
                'leftPaddle': room.leftPaddle.attributes,
                'rightPaddle': room.rightPaddle.attributes
            }
        )
        while room and room.keep_updating and not room.winner:
            if room:
                await start(room, LocalConsumer)
                if room.user1["goals"] == 6 or room.user2["goals"] == 6:
                    room.winner = LocalConsumer.username2 if room.user2["goals"] == 6 else LocalConsumer.username1
                    await LocalConsumer.channel_layer.send( LocalConsumer.channel_name, {'type': 'chat_message', 'winner': room.winner})
                    break
                message = {
                    'type': 'chat_message',
                    'ballInfo': room.ball.attributes,
                    'room_paused': room.room_paused
                }
                if room.leftPaddle.attributes['velocityY']: message['leftPaddle'] = room.leftPaddle.attributes
                if room.rightPaddle.attributes['velocityY']: message['rightPaddle'] = room.rightPaddle.attributes
                await LocalConsumer.channel_layer.send(
                    LocalConsumer.channel_name,
                    message
                )
                await asyncio.sleep(0.03)
            else:
                room.keep_updating = False

room_ma = LocalRoomManager()

class LocalConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
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
        left_speed = room.leftPaddle.speed
        right_speed = room.rightPaddle.speed
        if key == "KeyW":
            room.leftPaddle.set_Player_attribute("velocityY", -5 * left_speed)
        if key == "KeyS":
            room.leftPaddle.set_Player_attribute("velocityY", 5 * left_speed)
        if key == "ArrowUp":
            room.rightPaddle.set_Player_attribute("velocityY", -5 * right_speed)
        if key == "ArrowDown":
            room.rightPaddle.set_Player_attribute("velocityY", 5 * right_speed)

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
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        except Exception as e:
            print(f"disconnect: {e}")