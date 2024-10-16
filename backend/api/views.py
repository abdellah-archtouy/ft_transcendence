# from ..pingpong.models import User
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


from rest_framework.parsers import JSONParser
from rest_framework.views import APIView  
from rest_framework.response import Response  
from rest_framework.decorators import api_view
from rest_framework import status  
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# from .serializers import ConvSerializer 

class ConvView(APIView):  
     def get(self, request, id):  
        # Retrieves Conversation instances where either uid1 or uid2 matches the given id  
        conv_instances = Conversation.objects.filter(uid1=id) | Conversation.objects.filter(uid2=id)  
        
        # Check if any instances were found  
        conv_instances = conv_instances.order_by('-last_message_time')  # Order by last message
        if not conv_instances.exists():  
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)  
        serializer = ConvSerializer(conv_instances, many=True)
        return Response(serializer.data)  # Return the serialized data as Response  

class MsgView(APIView):  
    def get(self, request, id):  
        # Fetch Message instances filtered by conversation ID  
        msg_instances = Message.objects.filter(conversation=id)  

        # Check if any messages were found  
        if not msg_instances.exists():  
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        
        print(msg_instances)
        # Serialize the Message instances  
        serializer = MessageSerializer(msg_instances, many=True)  # Ensure ConvSerializer is correctly set up  
        
        # Return the serialized data as Response  
        return Response(serializer.data)  

# def Hi(request):
#     return HttpResponse("hi")

class UsersView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['GET'])
def get_messages(request, id):
    messages = Message.objects.filter(conversation=id)
    serializer = MessageSerializer(messages, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def post_message(request):
    serializer = MessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# class RegisterView(APIView):
#     parser_classes = [JSONParser]

#     def post(self, request):
#         print(request.data)
#         print(request.content_type)
#         serializer = UserSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from django.conf import settings

# class LoginView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         email = request.data.get('email')
#         password = request.data.get('password')

#         try:
#             user = User.objects.get(email=email)
#         except User.DoesNotExist:
#             return Response({'message': 'Incorrect email'}, status=status.HTTP_400_BAD_REQUEST)

#         if user.password != password:
#             return Response({'message': 'Incorrect password'}, status=status.HTTP_400_BAD_REQUEST)

#         login(request, user)
#         # refresh = RefreshToken.for_user(user)
#         response = Response()
#         response.set_cookie(
#             key='jwt', 
#             value=AccessToken.for_user(user).__str__(), 
#             httponly=True, 
#             samesite='None',
#             secure=True
#         )
#         response.data = {
#             'token' :AccessToken.for_user(user).__str__(),
#         }
        
#         return response

class UserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# class Logout(APIView):
#     def post(self, request):
#         response = Response()
#         response.delete_cookie('jwt')
#         response.data = {
#             'message': 'success'
#         }
#         return response


User = get_user_model()

class UserDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        jwt_token = request.COOKIES.get('jwt')
        print(f"Received JWT Token: {jwt_token}") 
        # user = request.user
        # user_data = {
        #     'id': user.id,
        #     'email': user.email,
        #     'username': user.username,
        #     # Add any other fields you want to return
        # }
        return Response({'message': 'success'})
    