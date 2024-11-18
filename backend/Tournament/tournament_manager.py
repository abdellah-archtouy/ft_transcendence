from channels.generic.websocket import AsyncWebsocketConsumer
import json
import asyncio
from .tournament import Tournament
from User.models import User
from Game.room import Room

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
        user_list = []
        if tournament:
            for user in tournament.users:
                user_obj = await User.objects.aget(id=user)
                user_list.append(user_obj.avatar.url)
            await obj.channel_layer.group_send(
                tournament.group_name,
                {
                    "type": "send_tournament",
                    "tournament": {
                        "tournament_users": user_list,
                        "round": tournament.round,
                    }
                }
            )

    async def leave_tournament(self, obj):
        if obj.tournament:
            name = obj.tournament.name
            tournament = obj.tournament
            tournament.kick_user(obj.user_id)
            await self.send_tournament_updates(obj, obj.tournament)
            await obj.channel_layer.group_discard(f"tournament_info_{obj.tournament.name}", obj.channel_name)
            if len(self.tournaments[name].users) == 0:
                self.tournaments.pop(name)
            obj.joined = False
            obj.tournament = None