from django.shortcuts import render
from django.http import JsonResponse
from .models import User, Friend, UserOTP, reset_ranks  # Import your custom User model
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
from django.contrib.auth import get_user_model, update_session_auth_hash
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import redirect
from django.core.files.base import ContentFile
from uuid import uuid4
import requests, os, string, random
from django.conf import settings
from django.db.models import Q
import re


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
        reset_ranks()  # here i am a doing a loop in the registration of user
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
    client_secret = settings.CLIENT_SECRET
    redirect_uri = settings.HOSTNAME

    data = {
        "grant_type": "authorization_code",
        "client_id": "u-s4t2ud-ec33d59c683704986dda31fd1812c016474dd371e1bea3233a32976cf6b14b5c",
        "client_secret": client_secret,
        "redirect_uri": f"http://{redirect_uri}:3000/api/auth/callback/",
        "code": code,
    }

    # print(data.redirect_uri)

    response = requests.post(token_url, data=data)
    response_data = response.json()

    print("response_data", response_data)
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
        reset_ranks()  # here i am a doing a loop in the registration of user
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
        # Generate the filename for the avatar (always username + file extension)
        avatar_extension = avatar_url.split(".")[-1]  # e.g., jpg or png
        avatar_filename = f"{username}.{avatar_extension}"

        # Check if the file already exists and remove it (if you want to replace it)
        avatar_path = f"{settings.MEDIA_ROOT}/avatars/{avatar_filename}"
        if os.path.exists(avatar_path):
            return None  # Return None if the file already exists

        # Create a ContentFile object from the image content
        avatar_file = ContentFile(response.content, avatar_filename)

        return avatar_file  # Return the ContentFile object for saving in the model

    # If the download fails, return None or a default avatar
    return None


def generate_random_suffix(length=5):
    """Generate a random suffix to append to the username for uniqueness."""
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))


def generate_strong_password(length=12):
    """Generate a strong password that matches front-end complexity rules."""
    if length < 8:
        length = 8

    # Define the character sets to use in the password (limiting special characters to those allowed on the front-end)
    lower = string.ascii_lowercase
    upper = string.ascii_uppercase
    digits = string.digits
    special = "!@#$%^&*"

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


# Resend OTP
@api_view(["POST"])
def resend_otp(request):
    email = request.data.get("email")
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"error": "Invalid email address."}, status=status.HTTP_400_BAD_REQUEST
        )

    otp = get_random_string(length=6, allowed_chars="0123456789")
    UserOTP.objects.create(user=user, otp=otp)
    send_mail(
        "Your OTP Code",
        f"Your OTP code is:  {otp}",
        "your_email@example.com",
        [user.email],
        fail_silently=False,
    )
    return Response(
        {"message": "OTP sent to your email address."}, status=status.HTTP_200_OK
    )


# Forgot password
@api_view(["POST"])
def forgot_password(request):
    email = request.data.get("email")
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"error": "Invalid email address."}, status=status.HTTP_400_BAD_REQUEST
        )

    new_password = generate_strong_password()
    user.password = make_password(new_password)
    user.save()

    send_mail(
        "Your New Password",
        f"Your new password is {new_password}",
        "your_email@example.com",
        [user.email],
        fail_silently=False,
    )

    print("New password sent to user:", user.email)

    return Response(
        {"message": "New password sent to your email address."},
        status=status.HTTP_200_OK,
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
        avatar_url = (
            user.avatar.url if user.avatar else None
        )  # Return the URL of the avatar
        cover_url = (
            user.cover.url if user.cover else None
        )  # Return the URL of the cover
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "avatar": avatar_url,  # Provide the URL to the frontend
                "cover": cover_url,  # Provide the URL to the frontend
                "bio": user.bio,
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

        # Get all users excluding the current user
        all_users = User.objects.exclude(id=current_user.id)

        # Get users who have a relation with the current user
        related_users = Friend.objects.filter(
            Q(user1=current_user) | Q(user2=current_user)
        )

        # Collect the IDs of users related to the current user
        related_user_ids = set()
        for relation in related_users:
            if relation.user1 != current_user:
                related_user_ids.add(relation.user1.id)
            if relation.user2 != current_user:
                related_user_ids.add(relation.user2.id)

        # Filter out users who have any relation with the current user
        suggested_users = all_users.exclude(id__in=related_user_ids)[:10]

        if suggested_users.exists():
            serializer = UserSerializer(suggested_users, many=True)
            return Response(serializer.data)
        else:
            return Response([], status=status.HTTP_204_NO_CONTENT)

    except TokenError as e:
        # Catch token-related errors (e.g., expired tokens)
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_friend(request):
    try:
        current_user = request.user
        friend_id = request.data.get("friend_id")

        # Check if friend exists
        friend = User.objects.get(id=friend_id)

        # Check if friendship already exists
        if (
            Friend.objects.filter(user1=current_user, user2=friend).exists()
            or Friend.objects.filter(user1=friend, user2=current_user).exists()
        ):
            return Response(
                {"message": "Already friends"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Create new friendship
        Friend.objects.create(user1=current_user, user2=friend, request=True)

        return Response(
            {"message": "Friend added successfully"}, status=status.HTTP_201_CREATED
        )

    except User.DoesNotExist:
        return Response(
            {"error": "User does not exist"}, status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {"error": "An error occurred"}, status=status.HTTP_400_BAD_REQUEST
        )


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


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def search_bar_list(request):
    try:
        user = request.user
        user_list = User.objects.all().exclude(id=user.id).values("avatar", "username")
        return Response(user_list, status=status.HTTP_200_OK)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# this part is for the settings of the user


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_general_info(request):
    try:
        user = request.user
        data = request.data

        print("data", data)
        # Update username if provided
        new_username = data.get("username", None)
        if new_username and new_username != user.username:
            if User.objects.filter(username=new_username).exists():
                return Response(
                    {"error": "Username already taken."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.username = generate_unique_username(new_username)

        # Update bio if provided
        new_bio = data.get("bio", None)
        if new_bio:
            user.bio = new_bio

        # Handle avatar and cover image uploads (if provided)
        new_avatar = data.get("avatar", None)  # Assuming avatar is uploaded as file
        new_cover = data.get("cover", None)  # Assuming cover is uploaded as file

        if new_avatar:
            # Update avatar logic here (you might want to process the image or save it)
            user.avatar = new_avatar

        if new_cover:
            # Update cover logic here (you might want to process the image or save it)
            user.cover = new_cover

        # Save the updated user data
        user.save()

        # Return updated user data (returning the updated fields including avatar and cover)
        avatar_url = user.avatar.url if user.avatar else None
        cover_url = user.cover.url if user.cover else None
        return Response(
            {
                "message": "User information updated successfully.",
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "bio": user.bio,
                "avatar": avatar_url,
                "cover": cover_url,
            },
            status=status.HTTP_200_OK,
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get("currentPassword")
    new_password = request.data.get("newPassword")

    print("old_password", old_password)
    print("new_password", new_password)

    # Check if the user logged in using 42
    if user.email.endswith("@student.1337.ma"):
        print("Users with a 1337 email address cannot change their password.")
        return Response(
            {"error": "Users with a 1337 email address cannot change their password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Check if the old password is correct
    if not user.check_password(old_password):
        print("Old password is incorrect.")
        return Response(
            {"error": "Old password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Validate the new password complexity
    password_errors = validate_password_complexity(new_password)
    if password_errors:
        print("Password complexity errors:", password_errors)
        return Response(
            {"error": password_errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Update the password
    user.password = make_password(new_password)
    user.save()

    # Update session auth hash to keep the user logged in
    update_session_auth_hash(request, user)

    return Response(
        {"message": "Password changed successfully."},
        status=status.HTTP_200_OK,
    )


def validate_password_complexity(password):
    """Check password for complexity: min 8 chars, upper, lower, digit, special."""
    if len(password) < 8:
        return "New password must be at least 8 characters long."

    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter."

    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter."

    if not re.search(r"\d", password):
        return "Password must contain at least one digit."

    if not re.search(r"[!@#$%^&*]", password):
        return "Password must contain at least one special character (!@#$%^&*)."

    return None  # No errors, password is strong.
