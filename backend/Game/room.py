import math
from datetime import datetime

boardWidth = 1000
boardHeight = 550


class Room:
    def __init__(self, uid1=None, uid2=None):
        self.ball = Ball(boardWidth, boardHeight)
        self.rightPaddle = RightPaddle(boardWidth, boardHeight)
        self.leftPaddle = LeftPaddle(boardWidth, boardHeight)
        self.room_paused = False
        self.fallibility = 1
        self.channel_names = {}
        self.uid1 = uid1
        self.uid2 = uid2
        self.user1 = {}
        self.user2 = {}
        self.is_full = False
        self.winner = None
        self.loser = None
        self.type = None
        self.created_at = datetime.now()
        self.end = None
        self.keep_updating = False
        # reconnection attributes
        self.tmp_uid = None
        self.disconnected_at = None

    def reset_all(self):
        self.ball = None
        self.rightPaddle = None
        self.leftPaddle = None
        self.ball = Ball(boardWidth, boardHeight)
        self.rightPaddle = RightPaddle(boardWidth, boardHeight)
        self.leftPaddle = LeftPaddle(boardWidth, boardHeight)
        self.room_paused = False
        if "goals" in self.user1:
            self.user1["goals"] = 0
        if "goals" in self.user2:
            self.user2["goals"] = 0

    def findUser(self, user_id):  # used to find user in the reconnection
        if user_id in {self.uid1, self.uid2}:
            return True
        return False

    def get_user_channel(self, user_id):
        return self.channel_names.get(user_id, [])

    def assign_user(self, uid):
        if self.uid1 is None:
            self.uid1 = int(uid)
        elif int(uid) != self.uid1 and self.uid2 is None:
            self.uid2 = int(uid)

    def get_paddle_by_user(self, user_id):
        if self.uid1 == int(user_id):
            return self.leftPaddle
        elif self.uid2 == int(user_id):
            return self.rightPaddle

    def delete_user(self, user_id):
        if user_id in self.channel_names:
            del self.channel_names[user_id]

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
        speed = 10
        angle = math.pi / 4
        self.attributes = {
            "x": (bWidth / 2) - 10,
            "y": (bHeight / 2) - 10,
            "height": 20,
            "width": 20,
            "velocityX": math.cos(angle) * speed,
            "velocityY": math.sin(angle) * speed,
            "speed": speed,
        }

    def reset(self):

        pass

    def get_attribute(self, attribute):
        return self.attributes.get(attribute, None)

    def set_attribute(self, attribute, value):
        self.attributes[attribute] = value


# right paddle classe
class RightPaddle:
    def __init__(self, bWidth, bHeight):
        self.speed = 1.5
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
        self.speed = 1.5
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
