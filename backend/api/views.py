# from ..pingpong.models import User
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import  generics
from .serializer import UserSerializer , ConvSerializer , MessageSerializer
from User.models import User
from Chat.models import Conversation , Message


from rest_framework.views import APIView  
from rest_framework.response import Response  
from rest_framework.decorators import api_view
from rest_framework import status  
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

def Hi(request):
    return HttpResponse("hi")

class UserView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@api_view(['GET'])
def get_messages(request, id):
    messages = Message.objects.all()
    serializer = MessageSerializer(messages, many=True)
    # print(serializer.data)  # Add this line to debug serialized data
    return Response(serializer.data)

@api_view(['POST'])
def post_message(request):
    serializer = MessageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)