# from ..pingpong.models import User
from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import  generics
from .serializer import UserSerializer
from pingpong.models import User


# Create your views here.

def Hi(request):
    return HttpResponse("hi")

class UserView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer