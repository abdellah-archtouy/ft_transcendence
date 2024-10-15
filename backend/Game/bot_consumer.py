from urllib.parse import parse_qs
import json, uuid
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
import asyncio, math
from User.models import User
from api.serializer import UserSerializer
import traceback
from .room import Room, RightPaddle, LeftPaddle, Ball
from .common_functions import velocityChange, update

# urls of channels

boardWidth = 1000
boardHeight = 550

rooms = {}

def changePaddlePosition(room):
    try:
        paddles = [room.leftPaddle, room.rightPaddle]
        bally = room.ball.get_attribute("y");
        for paddle in paddles:
            y = paddle.get_Player_attribute("y")
            velocityY = paddle.get_Player_attribute("velocityY")
            PlayerHeight = paddle.get_Player_attribute("height")
            if paddle == room.rightPaddle:
                velocityY = (bally - (y + PlayerHeight / 2)) * 0.1
            newPosition = y + velocityY
            if 0 < newPosition < boardHeight - PlayerHeight:
                paddle.set_Player_attribute("y", newPosition)
    except Exception as e:
        print(f"Error in changePaddlePosition: {e}")

async def start(room, user1, user2):
    try:
        speed = room.ball.get_attribute('speed')
        y = room.ball.get_attribute('y') + room.ball.get_attribute('velocityY')
        x = room.ball.get_attribute('x') + room.ball.get_attribute('velocityX')
        room.ball.set_attribute('y', y)
        room.ball.set_attribute('x', x)
        if (boardHeight - 10 < room.ball.get_attribute('y') + room.ball.get_attribute('height')):
            if (room.ball.get_attribute('velocityY') > 0):
                old = room.ball.get_attribute('velocityY') * -1
                room.ball.set_attribute('velocityY', old)
        if (room.ball.get_attribute('y') < 10):
            if (room.ball.get_attribute('velocityY') < 0):
                old = room.ball.get_attribute('velocityY') * -1
                room.ball.set_attribute('velocityY', old)
        changePaddlePosition(room)
        velocityChange(room)
        update(room, user1, user2)
    except Exception as e:
        print(f"start: {e}")

def get_room_by_channel_name(channel_name):
    global rooms
    for room_name, room in rooms.items():
        if channel_name in room.user_channels:
            return room
    return None

def join_or_creates_remote_room(user_id, channel_name, mode):
    global rooms

    for room_name, room in rooms.items():
        if room.uid1 and room.uid2 is None:
            room.assign_user(user_id, channel_name)
            return room_name
        
    new_room_name = f'room_{len(rooms) + 1}'
    new_room = Room()
    new_room.type = mode # here i assign the room mode
    new_room.assign_user(user_id, channel_name)
    rooms[new_room_name] = new_room
    return new_room_name

def join_or_creates_local_room(user_id, channel_name):
    global rooms
    try:
        new_room_name = f'room_{len(rooms) + 1}'
        new_room = Room()
        new_room.assign_user(user_id, channel_name)
        # new_room.assign_user(user_id, channel_name)
        rooms[new_room_name] = new_room
        return new_room_name
    except Exception as e:
        print(f"Error in join Local or Bot: {e}")


class BotGame(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.user_id = self.scope['url_route']['kwargs'].get('uid')
            self.channel_name = self.channel_name
            group_name = join_or_creates_local_room(self.user_id, self.channel_name)
            self.room_group_name = group_name
            rooms[group_name].type = "bot"
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
            await self.start_periodic_updates_local()
        except Exception as e:
            tb = traceback.extract_tb(e.__traceback__)
            print(f"{tb[-1].name} : {e}")
    
    async def start_periodic_updates_local(self):
        room = rooms.get(self.room_group_name)
        await self.assign_users_info(room)
        self.keep_updating = True
        self.update_thread = asyncio.ensure_future(self.send_periodic_updates())

    async def assign_users_info(self, room):
        user = await User.objects.aget(id=room.uid1)
        self.user1 = UserSerializer(user).data
        self.user1["goals"] = 0;
        self.user2 = {
            "username": "Bot",
            "avatar": "/avatars/botProfile.svg",
            "goals": 0,
        }

    async def send_periodic_updates(self):
        room = rooms.get(self.room_group_name)
        while self.keep_updating:
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
                self.keep_updating = False
    
    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))
    
    async def disconnect(self, code):
        self.keep_updating = False

    async def receive(self, text_data):
        data = json.loads(text_data)
        room = rooms.get(self.room_group_name)
        if not room:
            return

        action_type = data.get('type')
        key = data.get('key')

        if action_type == 'keypress':
            paddle = room.get_paddle_by_user(self.user_id)
            if key == 'KeyW':
                paddle.set_Player_attribute("velocityY", -5)
            if key == 'KeyS':
                paddle.set_Player_attribute("velocityY", 5)
            if key == 'Space':
                if room.room_paused:
                    room.room_resume()
                    room.room_paused = False
                else:
                    room.room_pause()
                    room.room_paused = True

        elif action_type == 'keydown':
            if key == 'movementKeys':
                paddle = room.get_paddle_by_user(self.user_id)
                paddle.set_Player_attribute("velocityY", 0)