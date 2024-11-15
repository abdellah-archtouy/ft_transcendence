import json
from datetime import datetime, timedelta
from channels.generic.websocket import AsyncWebsocketConsumer
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
    speed = room.ball.get_attribute("speed")
    room.ball.set_attribute("velocityY", speed * math.sin(((3 * math.pi) / 4) * 0.4))


async def broadcast(ConsumerObj, room, stat, data=None):
    try:
        if room:
            await ConsumerObj.channel_layer.group_send(
                ConsumerObj.room_group_name,
                {"type": "chat_message", "stat": stat, "value": data},
            )
    except Exception as e:
        print(f"broadcast: {e}")

async def get_user_from_db(user_id: int, room) -> dict:
    user_obj = await User.objects.aget(id=user_id)
    user_data = UserSerializer(user_obj).data
    goals = 0
    if room.uid1 == user_id:
        goals = room.user1_goals
    elif room.uid2 == user_id:
        goals = room.user2_goals
    result = {
        "username": user_data["username"],
        "avatar": user_data["avatar"],
        "goals": goals,
    }
    return result


def create_local_info(username: str, room) -> dict:
    goals = room.user2_goals
    local_info = {
        "username": username,
        "avatar": "/media/avatars/botProfile.svg",
        "goals": goals,
    }
    return local_info


class RoomManager:
    def __init__(self):
        self.rooms = {}
        self.lock = None
        self.channel_names = {}

    async def get_lock(self):
        if self.lock is None:
            self.lock = asyncio.Lock()
        return self.lock

    def get_room(self, room_name):
        room = self.rooms[room_name]
        return room
    
    def add_channel_name(self, channel_name, user_id):
        if user_id not in self.channel_names:
            self.channel_names[user_id] = []
        self.channel_names[user_id].append(channel_name)

    async def join_or_create_room(self, ConsumerObj):
        lock = await self.get_lock()
        async with lock:
            room_name = join_room(ConsumerObj, self.rooms)
            if ConsumerObj.gamemode == "bot":
                bot_room_infos_set(self.rooms[room_name], ConsumerObj)
            return room_name

    def get_channel_name(self, user_id):
        return self.channel_names.get(user_id, [])

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
                    user_id = ConsumerObj.user_id
                    channel_layer = ConsumerObj.channel_layer
                    room_group_name = ConsumerObj.room_group_name
                    if room.type != "bot":
                        if room.howManyUser() == 2:
                            room.disconnected_at = datetime.now()
                        room.delete_user(user_id)
                        channels_list = self.get_channel_name(user_id)
                        for channel in channels_list:
                            await channel_layer.send(channel, {"type": "chat_message", "stat": "close"})
                        if user_id in self.channel_names:
                            del self.channel_names[user_id]
                        if room.howManyUser() == 0:
                            del self.rooms[room_group_name]
                    else:
                        del self.rooms[room_group_name]
                    room.keep_updating = False
            except Exception as e:
                print(f"error remove_user_room: {e}")

    async def return_user2(self, ConsumerObj):
        try:
            room = self.rooms.get(ConsumerObj.room_group_name)
            if ConsumerObj.gamemode != "bot":
                user2 = await get_user_from_db(room.uid2, room)
            else:
                user2 = create_local_info("Bot")
            return user2
        except Exception as e:
            print(f"return_user2: {e}")

    async def start_periodic_updates(self, ConsumerObj):
        room = self.rooms.get(ConsumerObj.room_group_name)
        if room.type != "bot" and room.howManyUser() == 2:
            if not room.keep_updating:
                room.keep_updating = True
                self.update_thread = asyncio.ensure_future(
                    self.send_periodic_updates(ConsumerObj)
                )
        elif room.type == "bot":
            if not room.keep_updating:
                room.keep_updating = True
                self.update_thread = asyncio.ensure_future(
                    self.send_periodic_updates(ConsumerObj)
                )

    async def check_time(self, ConsumerObj):
        try:
            room = self.rooms.get(ConsumerObj.room_group_name)
            if room:
                await broadcast(ConsumerObj, room, "countdown", 10)
                while room and room.howManyUser() == 1:
                    if room:
                        now = datetime.now()
                        time_diff = now - room.disconnected_at
                        if time_diff >= timedelta(seconds=10):
                            room.delete_user(ConsumerObj.user_id)
                            if ConsumerObj.room_group_name in self.rooms:
                                await broadcast(ConsumerObj, room, "close")
                            break
                    await asyncio.sleep(1)
        except Exception as e:
            print(f"check_time{e}")

    async def start_game(self, ConsumerObj):
        room = self.rooms[ConsumerObj.room_group_name]
        if room.keep_updating:
            user1 = await get_user_from_db(room.uid1, room)
            user2 = await self.return_user2(ConsumerObj)
            await ConsumerObj.channel_layer.group_send(
                ConsumerObj.room_group_name,
                {
                    "type": "chat_message",
                    "winner": room.winner,
                    "user1": user1,
                    "user2": user2,
                    "ballInfo": room.ball.attributes,
                    "rightPaddle": room.rightPaddle.attributes,
                    "leftPaddle": room.leftPaddle.attributes,
                    "room_paused": room.room_paused,
                    "stat": "countdown",
                    "value": 3,
                },
            )
        await asyncio.sleep(3)

    async def send_periodic_updates(self, ConsumerObj):
        room = self.rooms[ConsumerObj.room_group_name]
        if ConsumerObj.connection_type == None:
            await self.start_game(ConsumerObj)
        while room and room.keep_updating and not room.winner:
            if room:
                await start(room)
                user1 = await get_user_from_db(room.uid1, room)
                user2 = await self.return_user2(ConsumerObj)
                await ConsumerObj.channel_layer.group_send(
                    ConsumerObj.room_group_name,
                    {
                        "type": "chat_message",
                        "winner": room.winner,
                        "user1": user1,
                        "user2": user2,
                        "ballInfo": room.ball.attributes,
                        "rightPaddle": room.rightPaddle.attributes,
                        "leftPaddle": room.leftPaddle.attributes,
                        "room_paused": room.room_paused,
                    },
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
                winner=await User.objects.aget(id=winner),
                loser=await User.objects.aget(id=loser),
                loser_score=loser_score,
                winner_score=6,
                created_at=room.created_at,
                end=room.end,
            )
            await game.asave()
            # self.assign_achievement(room)

    def assign_achievement(self, room):
        i = Game.objects.filter(winner=room.winner).aggregate(
            total_loser_score=Sum("loser_score")
        )["total_loser_score"]
        print("i = ", i)


room_manager = RoomManager()


class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            path = self.scope["path"]
            if "ws/game/Remote" in path:
                self.gamemode = "Remote"
            elif "ws/game/bot" in path:
                self.gamemode = "bot"
                self.botmode = self.scope["url_route"]["kwargs"].get("botmode")
            else:
                await self.close()
                return
            self.user_id = self.scope["url_route"]["kwargs"]["uid"]
            self.connection_type = None
            self.channel_name = self.channel_name
            self.room_group_name = await room_manager.join_or_create_room(self)
            room_manager.add_channel_name(self.channel_name, self.user_id)
            await room_manager.start_periodic_updates(self)
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        except Exception as e:
            tb = traceback.extract_tb(e.__traceback__)
            print(f"{tb[-1].name} : {e}")

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def disconnect(self, code):
        await room_manager.remove_user_room(self)
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        room = room_manager.get_room(self.room_group_name)
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