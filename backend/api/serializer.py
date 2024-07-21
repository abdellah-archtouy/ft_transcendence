from rest_framework import serializers
from User.models import User
from Chat.models import Conversation
from Chat.models import Message


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'cover', 'avatar')

class ConvSerializer(serializers.ModelSerializer):
    uid1_info = UserSerializer(source='uid1')
    uid2_info = UserSerializer(source='uid2')
    class Meta:
        model = Conversation
        fields = ('id', 'uid1', 'uid2', 'last_message', 'last_message_time', 'uid1_info', 'uid2_info')

class MessageSerializer(serializers.ModelSerializer):
    conversation_info = ConvSerializer(source='conversation', read_only=True)

    class Meta:
        model = Message
        fields = ('conversation', 'user', 'message', 'time', 'conversation_info')