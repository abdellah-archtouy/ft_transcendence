from django.shortcuts import render
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import  generics
from .serializer import UserSerializer , ConvSerializer , MessageSerializer , AchievementSerializer
from User.models import User , Achievement
from Chat.models import Conversation , Message
from django.contrib.auth import login
import jwt , datetime
from rest_framework_simplejwt.tokens import RefreshToken , AccessToken
    
from django.contrib.auth import get_user_model
from rest_framework.permissions import IsAuthenticated , AllowAny
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken


from rest_framework.parsers import JSONParser
from rest_framework.views import APIView  
from rest_framework.response import Response  
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status  
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def UserView(request):
    try :
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    
class UsersView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])    
def ConvView(request, id):  
    # Retrieves Conversation instances where either uid1 or uid2 matches the given id  
    conv_instances = Conversation.objects.filter(uid1=id) | Conversation.objects.filter(uid2=id)  
    
    # Check if any instances were found  
    conv_instances = conv_instances.order_by('-last_message_time')  # Order by last message
    if not conv_instances.exists():  
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)  
    serializer = ConvSerializer(conv_instances, many=True)
    return Response(serializer.data)  # Return the serialized data as Response  

@api_view(['GET'])
@permission_classes([IsAuthenticated])    
def get_messages(request, id):
    messages = Message.objects.filter(conversation=id)
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
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
            'maestro': 'Maestro',
            'downkeeper': 'Downkeeper',
            'jocker': 'Joker',
            'thunder_strike': 'Thunder_strike',
            'the_emperor': 'The_emperor',
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
