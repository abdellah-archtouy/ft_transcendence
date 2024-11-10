from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Tournaments
from .serializer import TournamentSerializer
from User.models import User
from rest_framework.response import Response
from rest_framework import status
# Create your views here.

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_tournament(request):
    try:
        Tournament_objs = Tournaments.objects.all()
        data = TournamentSerializer(Tournament_objs, many=True).data
        return Response(
            data,
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        print(f"get_tournament: {e}")

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_tournament(request):
    user = request.user
    tournament_name = request.data.get("tournament_name")
    tournament_exists = Tournaments.objects.filter(name=tournament_name).exists()
    if tournament_exists:
        return Response("Tournament already exists.", status=status.HTTP_400_BAD_REQUEST)
    tournament_obj = TournamentSerializer(data={
        "name": tournament_name,
        "user1": user
    })
    if tournament_obj.is_valid():
        tournament_instance = tournament_obj.save()
        send_obj = {
            "name": tournament_instance.name,
            "name": tournament_instance.name,
            "name": tournament_instance.name,
        }
        return Response(tournament_obj.data, status=status.HTTP_201_CREATED)
    else:
        return Response(tournament_obj.error, status=status.HTTP_400_BAD_REQUEST)