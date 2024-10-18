from rest_framework import serializers
from .models import User
from django.contrib.auth.hashers import make_password


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
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
        if "avatar" not in validated_data:
            validated_data["avatar"] = "avatars/default_avatar.png"
        if "cover" not in validated_data:
            validated_data["cover"] = "covers/default_cover.png"
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

    def get_avatar(self, obj):
        request = self.context.get("request")
        if obj.avatar:
            return request.build_absolute_uri(obj.avatar.url)
        return None  # Or return a default avatar URL

    def get_cover(self, obj):
        request = self.context.get("request")
        if obj.cover:
            return request.build_absolute_uri(obj.cover.url)
        return None  # Or return a default cover URL
