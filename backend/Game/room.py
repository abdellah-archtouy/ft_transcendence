import math
from datetime import datetime

boardWidth = 1000
boardHeight = 550


class Room:
    def __init__(self, user1=None, user2=None):
        self.ball = Ball(boardWidth, boardHeight)
        self.rightPaddle = RightPaddle(boardWidth, boardHeight)
        self.leftPaddle = LeftPaddle(boardWidth, boardHeight)
        self.room_paused = False
        self.fallibility = 1
        self.channel_names = {}
        self.uid1 = user1
        self.uid2 = user2
        self.user1_goals = 0
        self.user2_goals = 0
        self.winner = None
        self.type = None
        self.created_at = datetime.now()
        self.end = None
        self.keep_updating = False
        # reconnection attributes
        self.tmp_uid = None
        self.disconnected_at = None

    def findUser(self, user_id):  # used to find user in the reconnection
        if self.uid1 == user_id or self.uid2 == user_id:
            return 1
        return 0

    def get_user_channel(self, user_id):
        return self.channel_names.get(user_id, [])

    def assign_user(self, uid):
        if self.uid1 is None:
            self.uid1 = uid
        elif uid != self.uid1 and self.uid2 is None:
            self.uid2 = uid

    def get_paddle_by_user(self, user_id):
        if self.uid1 == user_id:
            return self.leftPaddle
        elif self.uid2 == user_id:
            return self.rightPaddle

    # def set_user(self, user_id, value):
    #     if self.uid1 == user_id:
    #         self.uid1 = value
    #     elif self.uid2 == user_id:
    #         self.uid2 = value

    def delete_user(self, user_id):
        if user_id in self.channel_names:
            del self.channel_names[user_id]

    # def howManyUser(self):
    #     x = 0
    #     if self.uid1:
    #         x += 1
    #     if self.uid2:
    #         x += 1
    #     return x
    
    def howManyUser(self):
        return len(self.channel_names)

    def room_pause(self):
        if self.room_paused == False:
            self.prevBVX = self.ball.get_attribute("velocityX")
            self.prevBVY = self.ball.get_attribute("velocityY")
        self.ball.set_attribute("velocityX", 0)
        self.ball.set_attribute("velocityY", 0)
        self.rightPaddle.set_Player_attribute("velocityY", 0)
        self.leftPaddle.set_Player_attribute("velocityY", 0)

    def room_resume(self):
        vX = self.prevBVX
        vY = self.prevBVY
        self.ball.set_attribute("velocityX", vX)
        self.ball.set_attribute("velocityY", vY)


class Ball:
    def __init__(self, bWidth, bHeight):
        speed = 5
        angle = math.pi / 4
        self.attributes = {
            "x": bWidth / 2,
            "y": bHeight / 2,
            "height": 20,
            "width": 20,
            "velocityX": math.cos(angle) * speed,
            "velocityY": math.sin(angle) * speed,
            "speed": speed,
        }

    def get_attribute(self, attribute):
        return self.attributes.get(attribute, None)

    def set_attribute(self, attribute, value):
        self.attributes[attribute] = value


# right paddle classe
class RightPaddle:
    def __init__(self, bWidth, bHeight):
        self.speed = 1
        self.attributes = {
            "x": bWidth - 20,
            "y": bHeight / 2 - 50,
            "height": 100,
            "width": 20,
            "velocityY": 0,
        }

    def get_Player_attribute(self, attribute):
        return self.attributes.get(attribute, None)

    def set_Player_attribute(self, attribute, value):
        self.attributes[attribute] = value


# Left paddle classe
class LeftPaddle:
    def __init__(self, bWidth, bHeight):
        self.speed = 1
        self.attributes = {
            "x": 0,
            "y": bHeight / 2 - 50,
            "height": 100,
            "width": 20,
            "velocityY": 0,
        }

    def get_Player_attribute(self, attribute):
        return self.attributes.get(attribute, None)

    def set_Player_attribute(self, attribute, value):
        self.attributes[attribute] = value


def get_room_by_channel_name(channel_name):
    global rooms
    for room in rooms.items():
        if channel_name in room.user_channels:
            return room
    return None
