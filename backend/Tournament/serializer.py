from rest_framework import serializers
from .models import Tournaments
from User.models import User

class TournamentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Tournaments
        fields = [
            "id",
            "winner",
            "created_at",
            "end",
        ]