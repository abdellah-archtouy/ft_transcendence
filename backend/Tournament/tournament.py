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
        self.rounds = []
        self.current_round = []
        self.round_winner = []
        self.rooms = {}
        self.user_list = {}
        self.created_at = datetime.now()
        self.end = None
        self.users_num = 0
        self.is_full = False
        self.round_winners = []
        self.tournament_task = None
    
    def delete_our_rooms(self):
        matching_keys = [key for key in pre_room_manager.rooms.keys() if key.startswith(f"tournament_")]
        for key in matching_keys:
            del pre_room_manager.rooms[key]

    def kick_user(self, user):
        if user in self.users and not self.is_full:
            index = self.users.index(user)
            self.users.pop(index)
            self.users_num = len(self.users)
    
    async def add_player(self, user, obj):
        if self.users_num < 4:
            self.users.append(user)
            self.users_num = len(self.users)
            avatars_dict = await sync_to_async(list)(User.objects.filter(id__in=self.users).values("avatar"))
            avatars = [f"/media/{avatar['avatar']}" for avatar in avatars_dict if avatar['avatar']]
            self.user_list["round1"] = avatars
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
                    avatars_dict = await sync_to_async(list)(User.objects.filter(id__in=self.round_winners).values("avatar"))
                    avatars = [f"/media/{avatar['avatar']}" for avatar in avatars_dict if avatar['avatar']]
                    self.user_list["winner"] = avatars
                    self.winner = self.round_winners[0]  # Tournament winner found
                    self.end = datetime.now()
                    break
                else:
                    await self.setup_next_round()
        except Exception as e:
            print(f"monitor_tournament: {e}")

    async def monitor_current_round(self):
        # Determine winners of the current round and move to the next
        try:
            for _round in self.current_round:
                room_name = f"{self.name}_{_round.uid1}_{_round.uid2}"
                user1 = await User.objects.aget(id=_round.uid1)
                user2 = await User.objects.aget(id=_round.uid2)
                link = f"/game/friend/managedroom/{room_name}"
                await sync_to_async(create_notification)(user1, None, "TOURNAMENT_INVITE", link)
                await sync_to_async(create_notification)(user2, None, "TOURNAMENT_INVITE", link)

            while True:
                current_winners = [room.winner for room in self.current_round if room.winner is not None]
                
                if len(current_winners) == len(self.current_round):
                    self.round_winners = current_winners
                    avatars_dict = await sync_to_async(list)(User.objects.filter(id__in=current_winners).values("avatar"))
                    if len(current_winners) == len(self.current_round) and not len(self.current_round) == 1:
                        avatars = [f"/media/{avatar['avatar']}" for avatar in avatars_dict if avatar['avatar']]
                        self.user_list["round2"] = avatars
                    break
                
                await asyncio.sleep(1)
        except Exception as e:
            print(f"monitor_current_round: {e}")
    
    async def setup_next_round(self):
        # Reset the current round with winners from previous round
        self.current_round = []
        for i in range(0, len(self.round_winners), 2):
            id1 = int(self.round_winners[i])
            id2 = int(self.round_winners[i + 1])
            room_name = f"{self.name}_{id1}_{id2}"
            match = pre_room_manager.create_room(room_name, "tournament", id1, id2)
            self.current_round.append(match)
        self.rounds.append(self.current_round)
    
    async def create_first_round(self):
        try:
            for i in range(0, len(self.users), 2):
                id1 = int(self.users[i])
                id2 = int(self.users[i + 1])
                room_name = f"{self.name}_{id1}_{id2}"
                match = pre_room_manager.create_room(room_name, "tournament", id1, id2)
                self.current_round.append(match)
            self.rounds.append(self.current_round)
        except Exception as e:
            print(f"create_first_round: {e}")
    
    def create_match(self, user1, user2):
        room = Room(user1=int(user1), user2=int(user2))
        room.type = "tournament"
        return room # return the created room
