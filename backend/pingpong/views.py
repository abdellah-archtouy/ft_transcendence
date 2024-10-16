from django.core.serializers import serialize
from django.shortcuts import render
import json
from django.core.exceptions import ObjectDoesNotExist
from django.http import HttpResponse , JsonResponse
from .models import User, conversation, message, achievement, friend, game
from .serializer import UserSerializer
from rest_framework import  generics


def UserView():
    queryset = User.objects.all(generics.CreateAPIView)
    serializer_class = UserSerializer



def json(request):
    try:
        user = User.objects.get(username='bele')
    except ObjectDoesNotExist:
        return HttpResponse('User does not exist', status=404)
    
    Conversation = conversation.objects.filter(user1=user) | conversation.objects.filter(user2=user)
    conversations_json = serialize('json', Conversation)
    return JsonResponse(conversations_json, safe=False)

def ping(request):
    return HttpResponse("hiiii ping pong")
