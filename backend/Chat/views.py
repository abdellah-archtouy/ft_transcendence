from django.shortcuts import render
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import generics
from .serializer import (
    UserSerializer,
    ConvSerializer,
    MessageSerializer,
    AchievementSerializer,
    GameSerializer,
)
from User.models import User, Achievement
from Chat.models import Conversation, Message
from django.contrib.auth import login
import jwt, datetime
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken

from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken


from rest_framework.parsers import JSONParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def UserView(request):
    try:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)


class UsersView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ConvView(request, id):
    # Retrieves Conversation instances where either uid1 or uid2 matches the given id
    conv_instances = Conversation.objects.filter(uid1=id) | Conversation.objects.filter(
        uid2=id
    )

    # Check if any instances were found
    conv_instances = conv_instances.order_by(
        "-last_message_time"
    )  # Order by last message
    if not conv_instances.exists():
        return Response({"error": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = ConvSerializer(conv_instances, many=True)
    return Response(serializer.data)  # Return the serialized data as Response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages(request, id):
    messages = Message.objects.filter(conversation=id)
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def post_message(request):
    serializer = MessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


import os
from django.conf import settings


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    try:
        user = request.user
        achievements = Achievement.objects.filter(user=user.id)
        achievements_serialized = AchievementSerializer(achievements, many=True).data

        # Mapping of achievement names to their respective image paths
        achievement_images = {
            "maestro": "Maestro",
            "downkeeper": "Downkeeper",
            "jocker": "Joker",
            "thunder_strike": "Thunder_strike",
            "the_emperor": "The_emperor",
        }

        image_paths = []

        # Iterate over each achievement object in the serialized data
        for achievement in achievements_serialized:
            for field, has_achievement in achievement.items():
                # Check if the field is an achievement with a value of True
                if has_achievement and field in achievement_images:
                    image_path = achievement_images[field]
                    image_paths.append(image_path)

        avatar_url = user.avatar.url if user.avatar else None
        cover_url = user.cover.url if user.cover else None

        # Return user data with achievements and associated image paths
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "avatar": avatar_url,
                "cover": cover_url,
                "bio": user.bio,
                "score": user.score,
                "win": user.win,
                "rank": user.rank,
                "achievement": achievements_serialized,
                "achievement_images": image_paths,  # Added image paths
            },
            status=status.HTTP_200_OK,
        )

    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
from datetime import datetime, timedelta
from django.http import JsonResponse


def get_last_24_hours():
    # Start from 12:00 noon (today)
    current_time = datetime.now().replace(hour=12, minute=0, second=0, microsecond=0)
    
    # Generate hours from 12:00 to 00:00 (next day)
    last_24_hours = [
        {
            "hour": (current_time - timedelta(hours=i)).strftime('%H:00'),
            "wins": 0
        }
        for i in range(24)
    ]
    last_24_hours.sort(key=lambda x: x['hour'])
    # print("hnaaaayaaa" ,last_24_hours)
    return last_24_hours

def get_last_lose_24_hours():
    # Start from 12:00 noon (today)
    current_time = datetime.now().replace(hour=12, minute=0, second=0, microsecond=0)
    
    # Generate hours from 12:00 to 00:00 (next day)
    last_24_hours = [
        {
            "hour": (current_time - timedelta(hours=i)).strftime('%H:00'),
            "lose": 0
        }
        for i in range(24)
    ]
    last_24_hours.sort(key=lambda x: x['hour'])
    # print("hnaaaayaaa" ,last_24_hours)
    return last_24_hours

def update_last_24_hours_with_matches(last_24_hours, matches_list):
    matches_dict = {match['hour']: match['matches'] for match in matches_list}
    for entry in last_24_hours:
        hour = entry['hour']
        if hour in matches_dict:
            entry['wins'] = matches_dict[hour]
    last_24_hours.sort(key=lambda x: x['hour'])
    return last_24_hours
def update_last_24_hours_with_lose_matches(last_24_hours, matches_list):
    matches_dict = {match['hour']: match['matches'] for match in matches_list}
    for entry in last_24_hours:
        hour = entry['hour']
        if hour in matches_dict:
            entry['lose'] = matches_dict[hour]
    last_24_hours.sort(key=lambda x: x['hour'])
    return last_24_hours

from Game.models import Game
from django.utils import timezone
from datetime import datetime, timedelta
import pytz
from collections import defaultdict
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_win_and_lose(request):
    try:
        now = timezone.now()
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        user = request.user
        # user = 2

        userwin = GameSerializer(Game.objects.filter(winner=user), many=True).data
        userlose = GameSerializer(Game.objects.filter(loser=user), many=True).data
        current_time = datetime.utcnow()
        time_24_hours_ago = current_time - timedelta(hours=24)
        filtered_win_matches = []
        filtered_lose_matches = []

        for match in userwin:
            match_end_str = match['end'].split("T")[0]
            match_end = datetime.strptime(match_end_str, '%Y-%m-%d').date()
            if match_end > time_24_hours_ago.date():
                filtered_win_matches.append(match)

        for match in userlose:
            match_end_str = match['end'].split("T")[0]
            match_end = datetime.strptime(match_end_str, '%Y-%m-%d').date()
            if match_end > time_24_hours_ago.date():
                filtered_lose_matches.append(match)

        hourly_win_counts = defaultdict(int)
        hourly_lose_counts = defaultdict(int)

        for match in filtered_win_matches:
            match_time = datetime.fromisoformat(match['end'].replace('Z', ''))
            hour_str = match_time.strftime('%H:00')
            hourly_win_counts[hour_str] += 1
    
        for match in filtered_lose_matches:
            match_time = datetime.fromisoformat(match['end'].replace('Z', ''))
            hour_str = match_time.strftime('%H:00')
            hourly_lose_counts[hour_str] += 1
    
        win_result = [{"hour": hour, "matches": count} for hour, count in sorted(hourly_win_counts.items())]
        lose_result = [{"hour": hour, "matches": count} for hour, count in sorted(hourly_lose_counts.items())]
        last_win_24_hours = get_last_24_hours()
        last_lose_24_hours = get_last_lose_24_hours()
        last_win_result = update_last_24_hours_with_matches(last_win_24_hours, win_result)
        last_lose_result = update_last_24_hours_with_lose_matches(last_lose_24_hours, lose_result)
        return Response(
            {
                "last_win_24_hours": last_win_result,
                "last_lose_24_hours": last_lose_result
            }, status=status.HTTP_200_OK
        )
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print("jhjhfh   ",e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# get_user_win_and_lose()
