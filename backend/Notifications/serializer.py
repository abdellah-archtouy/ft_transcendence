from rest_framework import serializers
from .models import Notifications
from User.models import User

class notificationSerializer(serializers.ModelSerializer):

    class Meta:
        model = Notifications
        fields = [
            "id",
            "user",
            "sender",
            "message",
            "notification_type",
            "time"
        ]