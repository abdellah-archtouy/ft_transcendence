from django.shortcuts import render
from django.http import HttpResponse



def ping(request):
    return HttpResponse("ping pong")
