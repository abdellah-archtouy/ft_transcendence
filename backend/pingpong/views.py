from django.core.serializers import serialize
from django.shortcuts import render
import json
from django.http import HttpResponse , JsonResponse
from .models import User, conversation, message, achievement, friend, game



def json(request):
    # data = list(User.conversation_set.objects.values())
    data = list(User.conversation_set(User.objects.get(username='bele')))
    user = User.objects.get(username='bele')
    Conversation = conversation.objects.filter(user1=user) | conversation.objects.filter(user2=user)
    conversations_json = serialize('json', data)
    return JsonResponse(conversations_json , safe=False)

def ping(request):
    return HttpResponse("ping pong")
    # for i in conv:
    #     data1 = {
    #         'user1': i.user1.username,
    #         'user2': i.user2.username,
    #         'last_message': i.last_message,
    #         'last_message_time': i.last_message_time
    #     }
