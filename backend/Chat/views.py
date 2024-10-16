from django.shortcuts import render
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import  generics
from .serializer import UserSerializer , ConvSerializer , MessageSerializer
from User.models import User
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
