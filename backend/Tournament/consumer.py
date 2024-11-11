from channels.generic.websocket import AsyncWebsocketConsumer
import json
import time
from datetime import datetime

class TournamentRoomManager():
    def __init__(self) -> None:
        self.tournaments = {}

    def create_tournament(self, name, user):
        tournament = Tournament(name)
        self.tournaments[name] = tournament
        tournament = Tournament("name1")
        self.tournaments[name] = tournament
        tournament = Tournament("namedad")
        self.tournaments["namedad"] = tournament
        tournament = Tournament("namesda")
        self.tournaments["namesda"] = tournament
        tournament = Tournament("asdas")
        self.tournaments["asdas"] = tournament
        tournament = Tournament("ghdfg")
        self.tournaments["ghdfg"] = tournament
        tournament = Tournament("name1555")
        self.tournaments["name1555"] = tournament
        tournament = Tournament("name15553")
        self.tournaments["name15553"] = tournament
        tournament = Tournament("name15554")
        self.tournaments["name15554"] = tournament
        tournament = Tournament("name15556")
        self.tournaments["name15556"] = tournament
        tournament = Tournament("name15558")
        self.tournaments["name15558"] = tournament
        tournament = Tournament("name15559")
        self.tournaments["name15559"] = tournament
        tournament = Tournament("name1555r")
        self.tournaments["name1555r"] = tournament
        tournament = Tournament("name1555h")
        self.tournaments["name1555h"] = tournament
        tournament = Tournament("name1555j")
        self.tournaments["name1555j"] = tournament
        # tournament = Tournament("name1555v")
        # self.tournaments["name1555v"] = tournament
        self.tournaments[name].users.append(user)
        if len(self.tournaments[name].users) < 4:
            self.tournaments[name].users_num += 1

class Tournament():
    def __init__(self, name=None) -> None:
        self.name = name
        self.winner = None
        self.users = []
        self.created_at = datetime.now()
        self.end = None
        self.users_num = 0

manager = TournamentRoomManager()

def send_tournament_infos(name):
    obj = manager.tournaments[name]
    sent_data = {
        "name" : obj.name,
        "users_num": obj.users_num
    }
    return sent_data

class tournament_consumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.group_name = "Tournament"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        tournaments_list = []
        for t in manager.tournaments:
            tournaments_list.append(send_tournament_infos(t))

        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "send_tournament",
                "tournament": tournaments_list,
            }
        )

    async def disconnect(self, close_code):
        # Leave the group
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_tournament(self, event):
        # Send the notification to WebSocket
        await self.send(text_data=json.dumps(event["tournament"]))
    
    async def receive(self, text_data):
        # Leave the group
        data = json.loads(text_data)
        if data["type"] == "create":
            tournament_name = data["name"]

            if tournament_name in manager.tournaments:
                await self.send(text_data=json.dumps({"error": "Tournament name already exists"}))
            else:
                manager.create_tournament(tournament_name, self.user_id)
                tournaments_list = []
                for t in manager.tournaments:
                    tournaments_list.append(send_tournament_infos(t))
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        "type": "send_tournament",
                        "tournament": tournaments_list,
                    }
                )
# khlina hna f join