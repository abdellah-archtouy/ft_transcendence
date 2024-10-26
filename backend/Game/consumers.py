import json
from datetime import datetime, timedelta
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import asyncio
from User.models import User
from .models import Game
from User.serializers import UserSerializer
import traceback
from .common_functions import start, join_room
from django.db.models import Sum
import math

boardWidth = 1000
boardHeight = 550

def bot_room_infos_set(room, ConsumerObj):
    if ConsumerObj.botmode == "easy":
        room.ball.set_attribute("speed", 5)
        room.fallibility = 0.08
    if ConsumerObj.botmode == "medium":
        room.ball.set_attribute("speed", 7)
        room.fallibility = 0.2
    if ConsumerObj.botmode == "hard":
        room.ball.set_attribute("speed", 9)
        room.fallibility = 0.5
    speed = room.ball.get_attribute('speed')
    room.ball.set_attribute("velocityY", speed * math.sin(((3 * math.pi) / 4) * 0.4))


async def broadcast(ConsumerObj, room, stat, data=None):
    try:
        if room:
            await ConsumerObj.channel_layer.group_send(
                ConsumerObj.room_group_name,
                {
                    'type': 'chat_message',
                    'stat': stat,
                    'value': data
                }
            )
    except Exception as e:
        print(f"broadcast: {e}")

async def get_user_from_db(user_id: int) -> dict:
    user_obj = await User.objects.aget(id=user_id)
    user_data = UserSerializer(user_obj).data
    result = {
        "username": user_data["username"],
        "avatar": user_data["avatar"],
        "goals": 0,
    }
    return result

def create_local_info(username: str) -> dict:
    local_info = {
        "username": username,
        "avatar": "/media/avatars/botProfile.svg",
        "goals": 0,
    }
    return local_info

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

    async def join_or_create_room(self, ConsumerObj):
        lock = await self.get_lock()
        async with lock:
            room_name = join_room(ConsumerObj, self.rooms)
            if ConsumerObj.gamemode == "bot":
                bot_room_infos_set(self.rooms[room_name], ConsumerObj)
            return room_name
        
    async def delete_user_room(self, ConsumerObj):
        lock = await self.get_lock()
        async with lock:
            room = self.rooms.get(ConsumerObj.room_group_name)
            if room:
                room.set_user(ConsumerObj.user_id, None)


    async def remove_user_room(self, ConsumerObj):
        lock = await self.get_lock()
        async with lock:
            try:
                room = self.rooms.get(ConsumerObj.room_group_name)
                if room:
                    if room.type == "Remote":
                        if room.howManyUser() == 2:
                            room.tmp_uid = ConsumerObj.user_id
                            room.disconnected_at = datetime.now()
                        room.set_user(ConsumerObj.user_id, None)
                        if room.howManyUser() == 0:
                            del self.rooms[ConsumerObj.room_group_name]
                    else:
                        del self.rooms[ConsumerObj.room_group_name]
                    room.keep_updating = False
            except Exception as e:
                print(f"remove_user_room: {e}")

    async def assign_users_info(self, ConsumerObj):
        room = self.rooms.get(ConsumerObj.room_group_name)
        self.user1 = await get_user_from_db(room.uid1)
        if ConsumerObj.gamemode == "Remote":
            self.user2 = await get_user_from_db(room.uid2)
        if ConsumerObj.gamemode == "bot":
            self.user2 = create_local_info("Bot")
        if ConsumerObj.gamemode == "Local":
            self.user1 = create_local_info("Left")
            self.user2 = create_local_info("Right")

    async def start_periodic_updates(self, ConsumerObj):
        room = self.rooms.get(ConsumerObj.room_group_name)
        if room.type == "Remote" and room.howManyUser() == 2:
            await self.assign_users_info(ConsumerObj)
            room.keep_updating = True
            self.update_thread = asyncio.ensure_future(self.send_periodic_updates(ConsumerObj))
        elif room.type != "Remote":
            await self.assign_users_info(ConsumerObj)
            room.keep_updating = True
            self.update_thread = asyncio.ensure_future(self.send_periodic_updates(ConsumerObj))

    async def check_time(self, ConsumerObj):
        try:
            room = self.rooms.get(ConsumerObj.room_group_name)
            if room:
                broadcast(ConsumerObj, room, "countdown", 10)
                while room and room.howManyUser() == 1:
                    if room:
                        now = datetime.now()
                        time_diff = now - room.disconnected_at
                        if time_diff >= timedelta(seconds=10):
                            room.set_user(ConsumerObj.user_id, None)
                            if ConsumerObj.room_group_name in self.rooms:
                                await broadcast(ConsumerObj, room, "close")
                            break
                    await asyncio.sleep(1)
        except Exception as e:
            print(f"check_time{e}")

    async def send_periodic_updates(self, ConsumerObj):
        room = self.rooms[ConsumerObj.room_group_name]
        while room and room.keep_updating and not room.winner:
            if room:
                await start(room, self.user1, self.user2)
                await ConsumerObj.channel_layer.group_send(
                    ConsumerObj.room_group_name,
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
        if room and room.type == "Remote":
            if room.winner:
                await self.store_gamein_db(room)
            else:
                await self.check_time(ConsumerObj)
        
    async def store_gamein_db(self, room):
        loser = None
        winner = None
        if room.winner == self.user1:
            winner = room.uid1
            loser = room.uid2
            loser_score = self.user2["goals"]
        else:
            winner = room.uid2
            loser = room.uid1
            loser_score = self.user1["goals"]
        room.end = datetime.now()
        if room.type == "Remote":
            game = Game(
                winner= await User.objects.aget(id=winner),
                loser= await User.objects.aget(id=loser),
                loser_score=loser_score,
                winner_score=6,
                created_at=room.created_at,
                end=room.end,
            )
            await game.asave()
            # self.assign_achievement(room)
        
    def assign_achievement(self, room):
        i = Game.objects.filter(winner=room.winner).aggregate(total_loser_score=Sum('loser_score'))["total_loser_score"]
        print("i = ", i)

room_manager = RoomManager()
        

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.user_id = self.scope['url_route']['kwargs'].get('uid')
            self.gamemode = self.scope['url_route']['kwargs'].get('gamemode')
            if self.gamemode == "bot":
                self.botmode = self.scope['url_route']['kwargs'].get('botmode')
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
        self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    def move_players(self, room, key):
        paddle = None
        if room.type == "Remote" or room.type == "bot":
            paddle = room.get_paddle_by_user(self.user_id)
            speed = paddle.speed
            if key == "KeyW" or key == "ArrowUp":
                paddle.set_Player_attribute("velocityY", -5 * speed)
            if key == "KeyS" or key == "ArrowDown":
                paddle.set_Player_attribute("velocityY", 5 * speed)
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
            if room.type == "Remote" or room.type == "bot":
                paddle = room.get_paddle_by_user(self.user_id)
                paddle.set_Player_attribute("velocityY", 0)
            else:
                if key == "KeyW" or key == "KeyS":
                    room.leftPaddle.set_Player_attribute("velocityY", 0)
                if key == "ArrowUp" or key == "ArrowDown":
                    room.rightPaddle.set_Player_attribute("velocityY", 0)
