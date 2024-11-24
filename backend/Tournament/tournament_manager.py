from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
from .tournament import Tournament
from .models import Tournaments
from User.models import User
from Game.room import Room
from asgiref.sync import sync_to_async

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
        if tournament and not self.is_user_in_another_tournament(user):
            added = await tournament.add_player(user, obj)
            if added:
                tournament.group_name = f"tournament_info_{name}"
                obj.tournament = tournament
                await obj.channel_layer.group_add(tournament.group_name, obj.channel_name)
                obj.joined = True
                await self.send_tournament_updates(obj, tournament)
            if tournament.is_full:
                asyncio.create_task(self.monitor_tournament_status(obj, tournament))

    async def monitor_tournament_status(self, obj , tournament):
        try:
            # Wait for the tournament to complete
            while tournament.winner is None:
                await asyncio.sleep(1)  # Check every second
            
            # Once we have a winner, handle tournament completion
            if tournament.winner:
                await self.send_tournament_updates(obj, obj.tournament)
                tournament.delete_our_rooms() # => error kayn hna
                tournament_obj = Tournaments(
                    name=tournament.name,
                    winner=await User.objects.aget(id=tournament.winner),
                    created_at=tournament.created_at,
                    end=tournament.end,
                )
                await tournament_obj.asave()
                del self.tournaments[tournament.name]
        except Exception as e:
            print(f"Error monitoring tournament {tournament.name}: {e}")

    def is_user_in_another_tournament(self, user):
        for tournament in self.tournaments.values():
            if user in tournament.users:
                return True
        return False
    
    def my_tournament(self, user):
        for tournament in self.tournaments.values():
            if user in tournament.users:
                return tournament
        return None
    
    async def send_updates(self, obj, data):
        await obj.channel_layer.group_send(
            obj.group_name,
            {
                "type": "send_tournament",
                "tournament": {
                    "tournaments_data": data
                }
            }
        )
    
    async def send_tournament_updates(self, obj, tournament):
            await obj.channel_layer.group_send(
                tournament.group_name,
                {
                    "type": "send_tournament",
                    "tournament": {
                        "tournament_users": tournament.user_list,
                    }
                }
            )

    async def leave_tournament(self, obj):
        if obj.tournament:
            name = obj.tournament.name
            tournament = obj.tournament
            tournament.kick_user(obj.user_id)
            avatars_dict = await sync_to_async(list)(User.objects.filter(id__in=tournament.users).values("avatar"))
            avatars = [f"/media/{avatar['avatar']}" for avatar in avatars_dict if avatar['avatar']]
            tournament.user_list["round1"] = avatars
            await self.send_tournament_updates(obj, obj.tournament)
            if obj.channel_name:
                await obj.channel_layer.group_discard(f"tournament_info_{obj.tournament.name}", obj.channel_name)
            if len(self.tournaments[name].users) == 0:
                self.tournaments.pop(name)
            obj.joined = False
            obj.tournament = None