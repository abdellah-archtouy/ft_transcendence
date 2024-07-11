from rest_framework import serializers
from pingpong.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'cover', 'avatar')