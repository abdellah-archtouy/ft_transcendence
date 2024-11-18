import asyncio
from Game.room import Room
from User.models import User
from datetime import datetime
from Notifications.views import create_notification
from asgiref.sync import sync_to_async
from Game.manged_room_consumer import pre_room_manager

class Tournament():
    def __init__(self, name=None) -> None:
        self.name = name
        self.winner = None
        self.group_name = None
        self.users = []
        self.round = "round1"
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
        if user in self.users and not self.is_full:
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
        else:
            return False
        return True
    
    async def start_event(self): # here we will start the tournament events
        if self.is_full == True:
            await self.create_first_round()
            self.tournament_task = asyncio.create_task(self.monitor_tournament())
    
    async def monitor_tournament(self):
        try:
            while self.winner is None:
                await self.monitor_current_round()

                if len(self.round_winners) == 1:
                    self.round = "winner"
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
                link = f"/game/friend/managedroom/{room_name}"
                await sync_to_async(create_notification)(user1, None, "TOURNAMENT_INVITE", link)
                await sync_to_async(create_notification)(user2, None, "TOURNAMENT_INVITE", link)

            while True:
                current_winners = [room.winner for room in self.current_round if room.winner is not None]
                
                if len(current_winners) == len(self.current_round):
                    self.round_winners = current_winners
                    self.round = "round2"
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
        return Room(user1=int(user1), user2=int(user2)) # return the created room
