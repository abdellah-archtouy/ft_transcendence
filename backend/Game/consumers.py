import json
from datetime import datetime, timedelta
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio
from User.models import User
from User.serializers import UserSerializer
import traceback
from .common_functions import start, join_room
from .room import Room

boardWidth = 1000
boardHeight = 550

rooms = {}

class RoomManager():
    def __init__(self):
        self.rooms = {}
        self.lock = None
    
    async def get_lock(self):
        if self.lock is None:
            self.lock = asyncio.Lock()
        return self.lock
    
    def get_room(self, room_name):
        room = self.rooms[room_name]
        return room

    async def join_or_create_room(self, instance):
        lock = await self.get_lock()
        async with lock:
            room_name = join_room(instance, self.rooms)
            return room_name
        
    async def remove_user_room(self, instance):
        lock = await self.get_lock()
        async with lock:
            room = self.rooms.get(instance.room_group_name)
            if room:
                if room.type == "Remote":
                    if room.howManyUser() == 2:
                        room.tmp_uid = instance.user_id
                        room.disconnected_at = datetime.now()
                    room.set_user(instance.user_id, None)
                    if room.howManyUser() == 0:
                        del self.rooms[instance.room_group_name]
                else:
                    del self.rooms[instance.room_group_name]
        self.keep_updating = False

    async def assign_users_info(self, instance):
        room = self.rooms.get(instance.room_group_name)
        user = await User.objects.aget(id=room.uid1)
        self.user1 = UserSerializer(user).data
        self.user1["goals"] = 5;
        if instance.gamemode == "bot":
            self.user2 = {
                "username": "Bot",
                "avatar": "/media/avatars/botProfile.svg",
                "goals": 0,
            }
        elif instance.gamemode == "Local":
            self.user2 = {
                "username": "Right",
                "avatar": "/media/avatars/botProfile.svg",
                "goals": 0,
            }
            self.user1 = {
                "username": "Left",
                "avatar": "/media/avatars/botProfile.svg",
                "goals": 0,
            }
        else:
            user = await User.objects.aget(id=room.uid2)
            self.user2 = UserSerializer(user).data
            self.user2["goals"] = 5;

    async def start_periodic_updates(self, instance):
        room = self.rooms.get(instance.room_group_name)
        if room.type == "Remote" and room.howManyUser() == 2:
            await self.assign_users_info(instance)
            self.keep_updating = True
            self.update_thread = asyncio.ensure_future(self.send_periodic_updates(instance))
        elif room.type != "Remote":
            await self.assign_users_info(instance)
            self.keep_updating = True
            self.update_thread = asyncio.ensure_future(self.send_periodic_updates(instance))

    async def check_time(self, instance):
        room = self.rooms.get(instance.room_group_name)
        await instance.channel_layer.group_send(
            instance.room_group_name,
            {
                'type': 'chat_message',
                'stat': "countdown",
                'value': 10,
            }
        )
        while room and room.howManyUser() == 1:
            if room:
                now = datetime.now()
                time_diff = now - room.disconnected_at  # Calculate time difference since disconnection
                if time_diff >= timedelta(seconds=10):
                    room.set_user(instance.user_id, None)
                    del self.rooms[instance.room_group_name]
                    await instance.channel_layer.group_send(
                        instance.room_group_name,
                        {
                            'type': 'chat_message',
                            'stat': "close",
                        }
                    )
            await asyncio.sleep(1)

    async def send_periodic_updates(self, instance):
        room = self.rooms.get(instance.room_group_name)
        while self.keep_updating:
            if room:
                await start(room, self.user1, self.user2, instance)
                await instance.channel_layer.group_send(
                    instance.room_group_name,
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
                self.keep_updating = False
        if room and room.type == "Remote":
            await self.check_time(instance)

room_manager = RoomManager()
        

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.user_id = self.scope['url_route']['kwargs'].get('uid')
            self.gamemode = self.scope['url_route']['kwargs'].get('gamemode')
            self.channel_name = self.channel_name
            self.room_group_name = await room_manager.join_or_create_room(self)
            await room_manager.start_periodic_updates(self)
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
    
    async def disconnect(self, code):
        await room_manager.remove_user_room(self)

    def move_players(self, room, key):
        paddle = None
        if room.type == "Remote" or room.type == "bot":
            paddle = room.get_paddle_by_user(self.user_id)
            if key == "KeyW" or key == "ArrowUp":
                paddle.set_Player_attribute("velocityY", -5)
            if key == "KeyS" or key == "ArrowDown":
                paddle.set_Player_attribute("velocityY", 5)
        else:
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
        room = room_manager.get_room(self.room_group_name)
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
            # if key == 'movementKeys':
            if room.type == "Remote" or room.type == "bot":
                paddle = room.get_paddle_by_user(self.user_id)
                paddle.set_Player_attribute("velocityY", 0)
            else:
                if key == "KeyW" or key == "KeyS":
                    room.leftPaddle.set_Player_attribute("velocityY", 0)
                if key == "ArrowUp" or key == "ArrowDown":
                    room.rightPaddle.set_Player_attribute("velocityY", 0)
