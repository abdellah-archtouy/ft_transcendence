from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
from Game.room import Room
from User.models import User
from datetime import datetime
from Notifications.views import create_notification
from asgiref.sync import sync_to_async
from Game.manged_room_consumer import pre_room_manager

class TournamentRoomManager():
    def __init__(self) -> None:
        self.tournaments = {}

    async def create_tournament(self, name, obj):
        tournament = Tournament(name)
        self.tournaments[name] = tournament
        await self.assign_user_intournament(name, obj)
    
    async def assign_user_intournament(self, name, obj):
        user = obj.user_id
        tournament = self.tournaments[name]
        if not self.is_user_in_another_tournament(user):
            await tournament.add_player(user, obj)
            await obj.send(text_data=json.dumps({"joined": True}))

    def is_user_in_another_tournament(self, user):
        for tournament in self.tournaments.values():
            if user in tournament.users:
                return True
        return False
    
    async def send_updates(self, group_name, channel_layer, data):
        await channel_layer.group_send(
            group_name,
            {
                "type": "send_tournament",
                "tournament": data
            }
        )

    def leave_tournament(self, tournament_name, user):
        if tournament_name:
            tournament = self.tournaments[tournament_name]
            tournament.kick_user(user)

class Tournament():
    def __init__(self, name=None) -> None:
        self.name = name
        self.winner = None
        self.users = []
        self.rounds = []
        self.current_round = []
        self.round_winner = []
        self.rooms = {}
        self.created_at = datetime.now()
        self.end = None
        self.users_num = 0
        self.is_full = False
        self.round_winners = []
        self.tournament_task = None

    def kick_user(self, user):
        if user in self.users:
            index = self.users.index(user)
            self.users.pop(index)
            self.users_num = len(self.users)
    
    async def add_player(self, user, obj):
        if self.users_num < 4:
            self.users.append(user)
            self.users_num = len(self.users)
        if len(self.users) == 4:
            self.is_full = True
            await self.start_event()
    
    async def start_event(self): # here we will start the tournament events
        if self.is_full == True:
            await self.create_first_round()
            self.tournament_task = asyncio.create_task(self.monitor_tournament())
    
    async def monitor_tournament(self):
        try:
            while self.winner is None:
                await self.monitor_current_round()

                if len(self.round_winners) == 1:
                    self.winner = self.round_winners[0]  # Tournament winner found
                    self.end = datetime.now()
                    print(f"Tournament winner is {self.winner}")
                    break
                else:
                    await self.setup_next_round()
        except Exception as e:
            print(f"monitor_tournament: {e}")

    async def monitor_current_round(self):
        # Determine winners of the current round and move to the next
        try:
            for _round in self.current_round:
                room_name = f"tournament_{_round.uid1}_{_round.uid2}"
                user1 = await User.objects.aget(id=_round.uid1)
                user2 = await User.objects.aget(id=_round.uid2)
                link = f"/game/friend/managedroom?room={room_name}"
                await sync_to_async(create_notification)(user1, None, "TOURNAMENT_INVITE", link)
                await sync_to_async(create_notification)(user2, None, "TOURNAMENT_INVITE", link)

            while True:
                current_winners = [room.winner for room in self.current_round if room.winner is not None]
                
                if len(current_winners) == len(self.current_round):
                    self.round_winners = current_winners
                    break
                
                await asyncio.sleep(1)
        except Exception as e:
            print(f"monitor_current_round: {e}")
    
    async def setup_next_round(self):
        # Reset the current round with winners from previous round
        self.current_round = []
        for i in range(0, len(self.round_winners), 2):
            match = self.create_match(self.round_winners[i], self.round_winners[i+1])
            room_name = f"tournament_{self.round_winners[i]}_{self.round_winners[i + 1]}"
            pre_room_manager.rooms[room_name] = match
            self.current_round.append(match)
        self.rounds.append(self.current_round)
    
    async def create_first_round(self):
        try:
            for i in range(0, len(self.users), 2):
                match = self.create_match(self.users[i], self.users[i+1])
                room_name = f"tournament_{self.users[i]}_{self.users[i + 1]}"
                pre_room_manager.rooms[room_name] = match
                self.current_round.append(match)
            self.rounds.append(self.current_round)
        except Exception as e:
            print(f"create_first_round: {e}")
    
    def create_match(self, user1, user2):
        return Room(user1=user1, user2=user2) # return the created room

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
        if tournament_manager.is_user_in_another_tournament(self.user_id):
            self.joined = True
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({"joined": self.joined}))
        tournaments_list = []
        for t in tournament_manager.tournaments:
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
        data = json.loads(text_data)
        tournament_name = data["name"]
        if data["type"] == "create":
            if tournament_name in tournament_manager.tournaments:
                await self.send(text_data=json.dumps({"error": "Tournament name already exists"}))
            else:
                await tournament_manager.create_tournament(tournament_name, self)
        if data["type"] == "join":
            await tournament_manager.assign_user_intournament(tournament_name, self)
        if data["type"] == "leave":
            tournament_manager.leave_tournament(tournament_name, self.user_id)
            self.joined = False
            await self.send(text_data=json.dumps({"joined": self.joined}))

        tournaments_list = []
        for t in tournament_manager.tournaments:
            tournaments_list.append(send_tournament_infos(t))
        await tournament_manager.send_updates(self.group_name, self.channel_layer, tournaments_list)