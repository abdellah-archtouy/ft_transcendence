import math
from .room import Room
from datetime import datetime, timedelta
from User.models import User, Achievement

boardWidth = 1000
boardHeight = 550

def resetballPosition(ball):
    ball.set_attribute('x', ((boardWidth / 2) - 10))
    ball.set_attribute('y', ((boardHeight / 2) - 10))

async def update(room, user1, user2):
    ballx = room.ball.get_attribute('x')
    speed =  room.ball.get_attribute("speed")
    old_ball_velocityX = room.ball.get_attribute('velocityX')
    if (ballx < -10) or (ballx > boardWidth):
        if (ballx < -10):
            user2["goals"] += 1
            x = -1
        else:
            user1["goals"] += 1
            x = 1
        room.ball.set_attribute('velocityX', old_ball_velocityX * (-1))
        room.ball.set_attribute('velocityY', speed * math.sin(((3 * math.pi) / 4) * 0.4 * x))
        resetballPosition(room.ball)
        if user1["goals"] == 6 or user2["goals"] == 6:
            room.room_pause()
            room.winner = user1 if user1["goals"] == 6 else user2
            room.room_paused = True

def collision(a, b):
    return(
        a.get_attribute('x') < b.get_Player_attribute('x') + b.get_Player_attribute('width') and
        a.get_attribute('x') + a.get_attribute('width') > b.get_Player_attribute('x') and
        a.get_attribute('y') < b.get_Player_attribute('y') + b.get_Player_attribute('height') and
        a.get_attribute('y') + a.get_attribute('height') > b.get_Player_attribute('y')
    )

def calculate_new_velocity(room, ball, paddle, angle_multiplier):
    bally = ball.get_attribute('y')
    playery = paddle.get_Player_attribute('y')
    playerh = paddle.get_Player_attribute('height')
    ball_speed = ball.get_attribute("speed")
    collisionPoint = (bally - (playery + playerh / 2)) / (playerh / 2)
    angle = collisionPoint * angle_multiplier
    ballx = ball.get_attribute('x')
    direction = 1 if ballx < boardWidth / 2 else -1
    velocityX = ball_speed * math.cos(angle) * direction
    velocityY = ball_speed * math.sin(angle) * direction
    ball.set_attribute("velocityX", velocityX)
    ball.set_attribute("velocityY", velocityY)
    if room.rightPaddle.speed < 3 and room.leftPaddle.speed < 3:
        room.rightPaddle.speed += 0.4
        room.leftPaddle.speed += 0.4

def velocityChange(room):
    speed = room.ball.get_attribute("speed")
    if collision(room.ball, room.rightPaddle):
        calculate_new_velocity(room, room.ball, room.rightPaddle, -math.pi / 4)
        speed += 2
    if collision(room.ball, room.leftPaddle):
        calculate_new_velocity(room, room.ball, room.leftPaddle, math.pi / 4)
        speed += 2
    if speed < 15:
        room.ball.set_attribute("speed", speed)

def changePaddlePosition(room):
    try:
        paddles = [room.leftPaddle, room.rightPaddle]
        bally = room.ball.get_attribute("y");
        for paddle in paddles:
            y = paddle.get_Player_attribute("y")
            velocityY = paddle.get_Player_attribute("velocityY")
            PlayerHeight = paddle.get_Player_attribute("height")
            if paddle == room.rightPaddle and room.type == "bot":
                velocityY = (bally - (y + PlayerHeight / 2)) * room.fallibility
            newPosition = y + velocityY
            if 0 < newPosition < boardHeight - PlayerHeight:
                paddle.set_Player_attribute("y", newPosition)
    except Exception as e:
        print(f"Error in changePaddlePosition: {e}")

async def start(room, user1, user2):
    try:
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
        await update(room, user1, user2)
    except Exception as e:
        print(f"start: {e}")

def room_naming(rooms):
    keys = sorted(rooms.keys())
    loop_list = [int(key[key.find("_") + 1:]) for key in keys]
    missed = None;
    for i in range(1, len(loop_list) + 1):
        if i not in loop_list:
            missed = i
            break
    if missed == None:
        missed = len(loop_list) + 1
    return missed

def join_remote_room(instance, rooms):
    for room_name, room in rooms.items():
        if room.type == "Remote":
            if room.tmp_uid == instance.user_id:
                now = datetime.now()
                time_diff = now - room.disconnected_at  # Calculate time difference since disconnection
                if time_diff <= timedelta(seconds=10):
                    room.assign_user(instance.user_id)
                    return room_name
                # else:
                #     return

    for room_name, room in rooms.items():
        if room.type == "Remote":
            if room.uid1 and room.uid2 is None:
                room.assign_user(instance.user_id)
                instance.room_group_name = room_name
                return room_name

    new_room_name = f'room_{room_naming(rooms)}'
    new_room = Room()
    new_room.type = instance.gamemode # here i assign the room mode
    new_room.assign_user(instance.user_id)
    rooms[new_room_name] = new_room
    instance.room_group_name = new_room_name
    return new_room_name


def join_local_room(instance, rooms):
    try:
        new_room_name = f'room_{room_naming(rooms)}'
        new_room = Room()
        new_room.type = instance.gamemode # here i assign the room mode
        if instance.gamemode != "Local":
            new_room.assign_user(instance.user_id)
        rooms[new_room_name] = new_room
        instance.room_group_name = new_room_name
        return new_room_name
    except Exception as e:
        print(f"Error in join Local or Bot: {e}")

def join_room(gameconsumer, rooms):
    if gameconsumer.gamemode != "Remote":
        room_name = join_local_room(gameconsumer, rooms)
    else:
        room_name = join_remote_room(gameconsumer, rooms)
    return room_name
