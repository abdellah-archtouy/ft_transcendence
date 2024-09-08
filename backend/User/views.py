from django.shortcuts import render
from django.http import JsonResponse
from .models import User  # Import your custom User model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import UserSerializer
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from .models import UserOTP
from django.contrib.auth import authenticate


@api_view(["POST"])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "User registered successfully!"}, status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")

    # Authenticate the user
    user = authenticate(username=email, password=password)
    if user is not None:
        # Generate OTP
        otp = get_random_string(length=6, allowed_chars="0123456789")
        UserOTP.objects.create(user=user, otp=otp)

        # Send OTP via email
        send_mail(
            "Your OTP Code",
            f"Your OTP code is {otp}",
            "pingpong.game.1337@gmail.com",
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


@api_view(["POST"])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return Response(
            {"error": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user_otp = UserOTP.objects.get(user__email=email, otp=otp)
    except UserOTP.DoesNotExist:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

    if user_otp.is_expired():
        user_otp.delete()
        return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)

    user_otp.delete()  # Delete the OTP after successful verification
    return Response(
        {"message": "OTP verified successfully."}, status=status.HTTP_200_OK
    )
