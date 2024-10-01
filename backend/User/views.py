from django.shortcuts import render
from django.http import JsonResponse
from .models import User, Friend  # Import your custom User model
from .serializers import UserSerializer
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from .models import UserOTP
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.authentication import JWTAuthentication
import requests


# Register new user
@api_view(["POST"])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "User registered successfully!"}, status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 42 OAuth callback handler
def handle_42_callback(request):
    code = request.GET.get("code")
    client_id = "your_client_id"
    client_secret = "your_client_secret"
    redirect_uri = "http://localhost:8000/api/auth/callback"

    token_url = "https://api.intra.42.fr/oauth/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "redirect_uri": redirect_uri,
    }
    token_response = requests.post(token_url, data=data)
    token_data = token_response.json()

    if "access_token" in token_data:
        access_token = token_data["access_token"]
        user_info_url = "https://api.intra.42.fr/v2/me"
        headers = {"Authorization": f"Bearer {access_token}"}
        user_info_response = requests.get(user_info_url, headers=headers)
        user_info = user_info_response.json()

        email = user_info.get("email")
        username = user_info.get("login")

        user = User.objects.filter(email=email).first()
        if user is None:
            user = User.objects.create(
                username=username,
                email=email,
                password=User.objects.make_random_password(),
            )

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return redirect(f"/?access_token={access_token}")
    else:
        return JsonResponse({"error": "Invalid response from 42 API"}, status=400)


# Login user and generate OTP
@api_view(["POST"])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")
    user = authenticate(username=email, password=password)
    if user is not None:
        otp = get_random_string(length=6, allowed_chars="0123456789")
        UserOTP.objects.create(user=user, otp=otp)
        send_mail(
            "Your OTP Code",
            f"Your OTP code is {otp}",
            "your_email@example.com",
            [user.email],
            fail_silently=False,
        )
        return Response(
            {"message": "OTP sent to your email address."}, status=status.HTTP_200_OK
        )
    else:
        return Response(
            {"error": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST
        )


# Verify OTP and issue JWT token
@api_view(["POST"])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    try:
        user_otp = UserOTP.objects.get(user__email=email, otp=otp)
    except UserOTP.DoesNotExist:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    if user_otp.is_expired():
        user_otp.delete()
        return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

    user_otp.delete()
    refresh = RefreshToken.for_user(user_otp.user)
    return Response(
        {
            "message": "OTP verified successfully.",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        },
        status=status.HTTP_200_OK,
    )


# Get user data (protected route)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    try:
        user = request.user
        return Response(
            {
                "username": user.username,
                "email": user.email,
            },
            status=status.HTTP_200_OK,
        )
    except TokenError as e:
        # Catch token-related errors (e.g., expired tokens)
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)


# Suggest friends (protected route)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def suggest_friends(request):
    try:
        current_user = request.user
        all_users = User.objects.exclude(id=current_user.id)[:10]
        if all_users.exists():
            serializer = UserSerializer(all_users, many=True)
            return Response(serializer.data)
        else:
            return Response([], status=status.HTTP_204_NO_CONTENT)
    except TokenError as e:
        # Catch token-related errors (e.g., expired tokens)
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
