from django.shortcuts import render
from django.http import JsonResponse
from .models import User, Friend, UserOTP  # Import your custom User model
from .serializers import UserSerializer
from django.utils.crypto import get_random_string
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
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
from django.shortcuts import redirect
from django.core.files.base import ContentFile
from uuid import uuid4
import requests, os, string, random
from django.conf import settings


User = get_user_model()


def generate_random_password(length=8):
    characters = string.ascii_letters + string.digits + string.punctuation
    return "".join(random.choice(characters) for _ in range(length))


def generate_unique_username(base_username):
    count = 1
    unique_username = base_username
    while User.objects.filter(username=unique_username).exists():
        unique_username = f"{base_username}{count}"
        count += 1
    return unique_username


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


@api_view(["GET"])
def handle_42_callback(request):
    print("this function has been trigered")
    code = request.GET.get("code")
    if not code:
        return JsonResponse({"error": "No code provided."}, status=400)

    # Exchange the authorization code for an access token
    token_url = "https://api.intra.42.fr/oauth/token"
    data = {
        "grant_type": "authorization_code",
        "client_id": "u-s4t2ud-ec33d59c683704986dda31fd1812c016474dd371e1bea3233a32976cf6b14b5c",
        "client_secret": "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",
        "redirect_uri": "http://localhost:3000/api/auth/callback/",
        "code": code,
    }

    response = requests.post(token_url, data=data)
    response_data = response.json()

    if "access_token" in response_data:
        access_token = response_data["access_token"]

        user_info_response = requests.get(
            "https://api.intra.42.fr/v2/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if user_info_response.status_code != 200:
            return JsonResponse(
                {"error": "Failed to fetch user information."}, status=400
            )

        user_info = user_info_response.json()
        email = user_info.get("email")
        username = user_info.get("login")
        avatar_url = user_info.get("image")
        avatar_url_link = avatar_url.get("link")

        print(avatar_url_link)

        # Check if user exists
        existing_user = User.objects.filter(email=email).first()

        if not existing_user:
            # Generate unique username
            base_username = username
            username = base_username
            while User.objects.filter(username=username).exists():
                username = f"{base_username}_{generate_random_suffix()}"

            # Generate a strong password
            password = generate_strong_password()

            # Download the avatar and pass it as a file-like object
            avatar_file = download_and_save_avatar(avatar_url_link, username)

            # Create a new user
            user_data = {
                "username": username,
                "email": email,
                "password": password,
            }
            serializer = UserSerializer(data=user_data)

            if serializer.is_valid():
                user = serializer.save()

                if avatar_file:
                    user.avatar.save(
                        avatar_file.name, avatar_file
                    )  # Save the avatar to the model

                print(
                    "User created with 42 login:",
                    username,
                    "and avatar:",
                    avatar_url_link,
                )
            else:
                return JsonResponse({"error": serializer.errors}, status=400)
        else:
            # Update existing user's avatar
            avatar_file = download_and_save_avatar(
                avatar_url_link, existing_user.username
            )
            if avatar_file:
                existing_user.avatar.save(avatar_file.name, avatar_file)
            existing_user.save()

            print("Existing user updated with new avatar:", avatar_url_link)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(existing_user if existing_user else user)
        return JsonResponse(
            {
                "message": "Login successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=200,
        )

    return JsonResponse({"error": "No access token received."}, status=400)


def download_and_save_avatar(avatar_url, username):
    # Download the avatar image
    response = requests.get(avatar_url)

    if response.status_code == 200:
        # Generate a unique filename for the avatar
        avatar_extension = avatar_url.split(".")[-1]  # e.g., jpg or png
        avatar_filename = f"{username}_{uuid4()}.{avatar_extension}"

        # Create a ContentFile object from the image content
        avatar_file = ContentFile(response.content, avatar_filename)

        return avatar_file  # Return the ContentFile object for saving in the model

    # If the download fails, return None or a default avatar
    return None


def generate_random_suffix(length=5):
    """Generate a random suffix to append to the username for uniqueness."""
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))


def generate_strong_password(length=12):
    """Generate a strong password containing upper and lower case letters, digits, and special characters."""
    if length < 8:  # Ensure the password is at least 8 characters long for security
        length = 8

    # Define the character sets to use in the password
    lower = string.ascii_lowercase
    upper = string.ascii_uppercase
    digits = string.digits
    special = string.punctuation

    # Ensure the password contains at least one character from each set
    password_chars = [
        random.choice(lower),
        random.choice(upper),
        random.choice(digits),
        random.choice(special),
    ]

    # Fill the rest of the password length with random choices from all sets
    password_chars += random.choices(lower + upper + digits + special, k=length - 4)

    # Shuffle the characters to prevent predictable sequences
    random.shuffle(password_chars)

    return "".join(password_chars)


# Login user and generate OTP
# @api_view(["POST"])
# def login_user(request):
#     email = request.data.get("email")
#     password = request.data.get("password")
#     user = authenticate(username=email, password=password)
#     print("this user is trying to login: ", user, email)

#     if user is not None:
#         otp = get_random_string(length=6, allowed_chars="0123456789")
#         UserOTP.objects.create(user=user, otp=otp)
#         send_mail(
#             "Your OTP Code",
#             f"Your OTP code is {otp}",
#             "your_email@example.com",
#             [user.email],
#             fail_silently=False,
#         )
#         return Response(
#             {"message": "OTP sent to your email address."}, status=status.HTTP_200_OK
#         )
#     else:
#         return Response(
#             {"error": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST
#         )


@api_view(["POST"])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")

    try:
        # Get the user by email
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"error": "Invalid email or password."}, status=status.HTTP_400_BAD_REQUEST
        )

    # Authenticate using the user's password
    if user.check_password(password):
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
        avatar_url = user.avatar.url if user.avatar else None  # Return the URL of the avatar
        cover_url = user.cover.url if user.cover else None  # Return the URL of the cover
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "avatar": avatar_url,  # Provide the URL to the frontend
                "cover": cover_url,  # Provide the URL to the frontend
            },
            status=status.HTTP_200_OK,
        )
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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


# Validate JWT token
@api_view(["POST"])
def validate_token(request):
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        jwt_auth = JWTAuthentication()
        try:
            validated_token = jwt_auth.get_validated_token(token)
            jwt_auth.get_user(validated_token)
            return Response({"message": "Token is valid"}, status=200)
        except TokenError:
            return Response({"message": "Invalid token"}, status=401)
    else:
        return Response({"message": "No token provided"}, status=400)
