from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
            Model = User
            fields = {'id' , 'username' , 'email', 'password' , 'cover', 'avatar'}