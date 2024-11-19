from rest_framework import serializers
from User.models import User, Achievement , Friend
from Chat.models import Conversation
from Chat.models import Message
from User.serializers import UserSerializer
from Game.models import Game


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = "__all__"


class ConvSerializer(serializers.ModelSerializer):
    uid1_info = UserSerializer(source="uid1")
    uid2_info = UserSerializer(source="uid2")

    class Meta:
        model = Conversation
        fields = (
            "id",
            "uid1",
            "uid2",
            "last_message",
            "last_message_time",
            "uid1_info",
            "uid2_info",
        )

class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friend
        fields = ("user1", "user2", "request", "accept", "block", "mute")

class MessageSerializer(serializers.ModelSerializer):
    conversation_info = ConvSerializer(source="conversation", read_only=True)

    class Meta:
        model = Message
        fields = ("conversation", "user", "message", "time", "conversation_info")


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ("maestro", "downkeeper", "jocker", "the_emperor", "thunder_strike")


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ("winner", "loser", "end")