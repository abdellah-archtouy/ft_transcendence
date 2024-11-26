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
    FriendSerializer,
    BlockMuteSerializer,
)
from User.models import User, Achievement , Friend
from Chat.models import Conversation, Message , Block_mute
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

from Game.manged_room_consumer import pre_room_manager
from Notifications.views import create_notification

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
def get_friends(request):
    try:
        user = request.user
        friends = Friend.objects.filter(user1=user) | Friend.objects.filter(user2=user)
        data_return = [
            {
                'user': UserSerializer(friend.user1 if friend.user1 != user else friend.user2).data,
            }
            for friend in friends
            if friend.accept
        ]
        serializer = FriendSerializer(friends, many=True)
        return Response(data_return)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print("hnaaaayaaa 2 2", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)   


from django.db.models import Q

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def setmatch(request, fid):
    try:
        friend_id = fid
        user = request.user
        friend_obj = User.objects.get(id=friend_id)
        room_name = f"managed_{user.id}_{friend_id}"
        link = f"/game/friend/managedroom/{room_name}"
        pre_room_manager.create_room(room_name, "managed", user.id, friend_id)
        create_notification(friend_obj, user, "MATCH_INVITE", link=link)
        return Response(link)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print("hnaaaayaaa 2 2", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_friend(request, username):
    try:
        user = request.user
        friend = User.objects.get(username=username)
        friend_obj = Friend.objects.filter(Q(user1=user, user2=friend) | Q(user1=friend, user2=user)).first()
        if not friend_obj:
            return Response({"error": "Friend not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(FriendSerializer(friend_obj).data)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getconvView(request, username):
    try:
        user = request.user
        user2 = User.objects.get(username=username)

        # if user == user2:
        #     print("Cannot create conversation with self")
        #     return

        conv = Conversation.objects.filter(
            (Q(uid1=user.id) & Q(uid2=user2.id)) |
            (Q(uid1=user2.id) & Q(uid2=user.id))
        ).first()
        if conv:
            serializer = ConvSerializer(conv)
            conv_data = serializer.data
        else:
        # Create new conversation
            print("conversation not found")
            conversation = Conversation(uid1=user, uid2=user2, last_message='')
            conversation.save()
            serializer = ConvSerializer(conversation)
            conv_data = serializer.data

            # serializer = ConvSerializer(conv , many=False)
        return Response(conv_data)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print("hnaaaayaaa 2 3", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ConverstationView(request, convid):
    try:
        user = request.user
        conv = Conversation.objects.get(id=convid)
        serializer = ConvSerializer(conv , many=False)

        data_return =  {
            "id": serializer.data["id"],
            "uid1": serializer.data["uid1"],
            "uid2": serializer.data["uid2"],
            "last_message": serializer.data["last_message"],
            "last_message_time": serializer.data["last_message_time"],
            "uid2_info": serializer.data["uid2_info"] if serializer.data["uid1"] == user.id else serializer.data["uid1_info"],
            "conv_username": serializer.data["uid2_info"]["username"] if serializer.data["uid1"] == user.id else serializer.data["uid1_info"]["username"],
        }
        return Response(data_return)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print("hnaaaayaaa 2 1", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ConvView(request):
    user = request.user
    conv_instances = Conversation.objects.filter(uid1=user.id) | Conversation.objects.filter(
        uid2=user.id
    )

    conv_instances = conv_instances.order_by("-last_message_time") 
    if not conv_instances.exists():
        return Response([])
    serializer = ConvSerializer(conv_instances, many=True)
    data_return = [
        {
            "id": conv["id"],
            "uid1": conv["uid1"],
            "uid2": conv["uid2"],
            "last_message": conv["last_message"],
            "last_message_time": conv["last_message_time"],
            "uid2_info": conv["uid2_info"] if conv["uid1"] == user.id else conv["uid1_info"],
            "conv_username": conv["uid2_info"]["username"] if conv["uid1"] == user.id else conv["uid1_info"]["username"],
        }
        for conv in serializer.data
    ]

    return Response(data_return)

from django.db.models import Q


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_messages(request, username):
    try:
        user = request.user
        # print("username", username)
        other_user = User.objects.get(username=username)
        if not other_user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        conv = Conversation.objects.filter(
            (Q(uid1=user.id) & Q(uid2=other_user.id)) | (Q(uid1=other_user.id) & Q(uid2=user.id))
        ).first()
        messages = Message.objects.filter(conversation=conv.id)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print("hnaaaayaaa 2 4", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        achievement_images = {
            "maestro": "Maestro",
            "downkeeper": "Downkeeper",
            "jocker": "Joker",
            "thunder_strike": "Thunder_strike",
            "the_emperor": "The_emperor",
        }

        image_paths = []

        for achievement in achievements_serialized:
            for field, has_achievement in achievement.items():
                if has_achievement and field in achievement_images:
                    image_path = achievement_images[field]
                    image_paths.append(image_path)
        avatar_url = user.avatar.url if user.avatar else None
        cover_url = user.cover.url if user.cover else None
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
                "achievement_images": image_paths,
            },
            status=status.HTTP_200_OK,
        )

    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_ouser_data(request, username):
    try:
        user = User.objects.get(username=username)
        if not user:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        achievements = Achievement.objects.filter(user=user.id)
        achievements_serialized = AchievementSerializer(achievements, many=True).data
        achievement_images = {
            "maestro": "Maestro",
            "downkeeper": "Downkeeper",
            "jocker": "Joker",
            "thunder_strike": "Thunder_strike",
            "the_emperor": "The_emperor",
        }
        image_paths = []
        for achievement in achievements_serialized:
            for field, has_achievement in achievement.items():
                if has_achievement and field in achievement_images:
                    image_path = achievement_images[field]
                    image_paths.append(image_path)
        avatar_url = user.avatar.url if user.avatar else None
        cover_url = user.cover.url if user.cover else None
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
                "achievement_images": image_paths,
            },
            status=status.HTTP_200_OK,
        )

    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    except TokenError:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print("hnaaaayaaa", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
from datetime import datetime, timedelta
from django.http import JsonResponse


def get_last_24_hours():
    current_time = datetime.now().replace(hour=12, minute=0, second=0, microsecond=0)
    last_24_hours = [
        {
            "hour": (current_time - timedelta(hours=i)).strftime('%H:00'),
            "wins": 0
        }
        for i in range(24)
    ]
    last_24_hours.sort(key=lambda x: x['hour'])
    return last_24_hours

def get_last_lose_24_hours():
    current_time = datetime.now().replace(hour=12, minute=0, second=0, microsecond=0)
    last_24_hours = [
        {
            "hour": (current_time - timedelta(hours=i)).strftime('%H:00'),
            "lose": 0
        }
        for i in range(24)
    ]
    last_24_hours.sort(key=lambda x: x['hour'])
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

def get_weekly_summary(match_history):
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    days_of_week = {
        (start_of_week + timedelta(days=i)).strftime('%A').lower(): {
            "day": (start_of_week + timedelta(days=i)).strftime('%A').lower(),
            "wins": 0
        }
        for i in range(7)
    }
    for match in match_history:
        match_end_str = match['end'].split("T")[0]
        match_date = datetime.fromisoformat(match_end_str)
        if start_of_week.date() <= datetime.strptime(match_end_str, '%Y-%m-%d').date() <= end_of_week.date():
            day_name = match_date.strftime('%A').lower()
            days_of_week[day_name]["wins"] += 1
    return list(days_of_week.values())

def get_weekly_lose_summary(match_history):
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    days_of_week = {
        (start_of_week + timedelta(days=i)).strftime('%A').lower(): {
            "day": (start_of_week + timedelta(days=i)).strftime('%A').lower(),
            "lose": 0
        }
        for i in range(7)
    }
    for match in match_history:
        match_end_str = match['end'].split("T")[0]
        match_date = datetime.fromisoformat(match_end_str)
        if start_of_week.date() <= datetime.strptime(match_end_str, '%Y-%m-%d').date() <= end_of_week.date():
            day_name = match_date.strftime('%A').lower()
            days_of_week[day_name]["lose"] += 1 
    return list(days_of_week.values())

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_win_and_lose(request):
    try:
        now = timezone.now()
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        user = request.user
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
        this_week_win_summary = get_weekly_summary(userwin)
        this_week_lose_summary = get_weekly_lose_summary(userlose)
        return Response(
            {
                "last_win_24_hours": last_win_result,
                "last_lose_24_hours": last_lose_result,
                "this_week_win_summary": this_week_win_summary,
                "this_week_lose_summary": this_week_lose_summary
            }, status=status.HTTP_200_OK
        )
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print("jhjhfh   ",e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_ouser_win_and_lose(request, username):
    try:
        now = timezone.now()
        start_of_today = now.replace(hour=0, minute=0, second=0, microsecond=0)
        user = User.objects.get(username=username)
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
        this_week_win_summary = get_weekly_summary(userwin)
        this_week_lose_summary = get_weekly_lose_summary(userlose)
        return Response(
            {
                "last_win_24_hours": last_win_result,
                "last_lose_24_hours": last_lose_result,
                "this_week_win_summary": this_week_win_summary,
                "this_week_lose_summary": this_week_lose_summary
            }, status=status.HTTP_200_OK
        )
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        print("jhjhfh   ",e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_mute_friend(request, username):
    try:
        user = request.user
        user2 = User.objects.get(username=username)
        block_mute = Block_mute.objects.filter(user1=user2, user2=user).first()
        block_mute1 = Block_mute.objects.filter(user1=user, user2=user2).first()
        if not block_mute:
            block_mute = Block_mute(user1=user2, user2=user)
            block_mute.save()
        if not block_mute1:
            block_mute1 = Block_mute(user1=user, user2=user2)
            block_mute1.save()
        response = {
            'data' :BlockMuteSerializer(block_mute).data,
            'data1' :BlockMuteSerializer(block_mute1).data,
        }
        return Response(response, status=status.HTTP_200_OK)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def mute_friend(request, username):
    try:
        user = request.user
        user2 = User.objects.get(username=username)
        block_mute = Block_mute.objects.filter(user1=user, user2=user2).first()
        if not block_mute:
            block_mute = Block_mute(user1=user, user2=user2)
        if block_mute.mute == True:
            block_mute.mute = False
        else:
            block_mute.mute = True
        block_mute.save()
        serializer = BlockMuteSerializer(block_mute)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def block_friend(request, username):
    try:
        user = request.user
        user2 = User.objects.get(username=username)
        block_mute = Block_mute.objects.filter(user1=user, user2=user2).first()
        if not block_mute:
            block_mute = Block_mute(user1=user, user2=user2)
        if block_mute.block == True:
            block_mute.block = False
        else:
            block_mute.block = True
        block_mute.save()
        serializer = BlockMuteSerializer(block_mute)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
