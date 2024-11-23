from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .tournament_manager import TournamentRoomManager

tournament_manager = TournamentRoomManager()

def send_tournament_infos(name):
    obj = tournament_manager.tournaments[name]
    sent_data = {
        "name" : obj.name,
        "users" : obj.users,
        "users_num": obj.users_num
    }
    return sent_data

class tournament_consumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope["url_route"]["kwargs"]["user_id"]
        self.group_name = "Tournament"
        self.joined = False
        self.channel_name = self.channel_name
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        self.tournament = tournament_manager.my_tournament(self.user_id)
        if self.tournament:
            self.joined = True
            await self.channel_layer.group_add(self.tournament.group_name, self.channel_name)
            await tournament_manager.send_tournament_updates(self, self.tournament)
        tournaments_list = []
        for t in tournament_manager.tournaments:
            tournaments_list.append(send_tournament_infos(t))
        await tournament_manager.send_updates(self, tournaments_list)
        await self.send(text_data=json.dumps({"joined": self.joined}))

    async def disconnect(self, close_code):
        # Leave the group
        if self.group_name and self.channel_name:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_tournament(self, event):
        # Send the notification to WebSocket
        await self.send(text_data=json.dumps(event["tournament"]))
    
    async def send_tournament_users(self, event):
        # Send the notification to WebSocket
        await self.send(text_data=json.dumps(event))
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        tournament_name = data["name"]
        if data["type"] == "create":
            if tournament_name in tournament_manager.tournaments:
                await self.send(text_data=json.dumps({"error": "Tournament name already exists"}))
            else:
                await tournament_manager.create_tournament(tournament_name, self)
        if data["type"] == "join":
            await tournament_manager.assign_user_intournament(tournament_name, self)
        if data["type"] == "leave" and self.tournament:
            await tournament_manager.leave_tournament(self)

        tournaments_list = []
        for t in tournament_manager.tournaments:
            tournaments_list.append(send_tournament_infos(t))
        await tournament_manager.send_updates(self, tournaments_list)
        await self.send(text_data=json.dumps({"joined": self.joined}))