from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "avatar",
            "cover",
            "bio",
            "win",
            "lose",
            "score",
            "rank",
            "stat",
        ]

    def create(self, validated_data):
        # Hash the password before saving
        validated_data["password"] = make_password(validated_data["password"])
        return super().create(validated_data)

    def validate(self, data):
        # Check if the email or username already exists
        if User.objects.filter(username=data.get("username")).exists():
            raise serializers.ValidationError(
                {"username": "This username is already in use."}
            )
        if User.objects.filter(email=data.get("email")).exists():
            raise serializers.ValidationError(
                {"email": "This email is already in use."}
            )
        return data
