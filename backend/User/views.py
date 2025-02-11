from django.http import JsonResponse
from .models import User, Friend, UserOTP  # Import your custom User model
from Notifications.models import Notifications
from .serializers import UserSerializer
from django.utils.crypto import get_random_string
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.exceptions import TokenError
from django.core.files.base import ContentFile
import requests, os, string, random
from django.conf import settings
from django.db.models import Q
import re
from Notifications.views import create_notification
import smtplib
import ssl
import certifi


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
    code = request.GET.get("code")
    if not code:
        return JsonResponse({"error": "No code provided."}, status=400)

    token_url = "https://api.intra.42.fr/oauth/token"
    client_secret = settings.CLIENT_SECRET
    redirect_uri = settings.HOSTNAME

    data = {
        "grant_type": "authorization_code",
        "client_id": "u-s4t2ud-ec33d59c683704986dda31fd1812c016474dd371e1bea3233a32976cf6b14b5c",
        "client_secret": client_secret,
        "redirect_uri": f"https://{redirect_uri}/auth/callback/",
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
                    user.avatar.save(avatar_file.name, avatar_file)
            else:
                return JsonResponse({"error": serializer.errors}, status=400)
        else:
            avatar_file = download_and_save_avatar(
                avatar_url_link, existing_user.username
            )
            if avatar_file:
                existing_user.avatar.save(avatar_file.name, avatar_file)
            existing_user.save()

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
    # Define possible image extensions to check
    image_extensions = ["png", "jpg", "jpeg", "gif", "bmp", "tiff"]

    # Check if any file with the username and an image extension already exists
    for ext in image_extensions:
        existing_avatar_path = f"{settings.MEDIA_ROOT}/avatars/{username}.{ext}"
        if os.path.exists(existing_avatar_path):
            return None  # Return None if a file with any image extension exists

    # Download the avatar image
    response = requests.get(avatar_url)

    if response.status_code == 200:
        # Generate the filename for the avatar based on the URL extension
        avatar_extension = avatar_url.split(".")[-1]  # e.g., jpg or png
        avatar_filename = f"{username}.{avatar_extension}"

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
        try:
            # Create a secure SSL context
            context = ssl.create_default_context(cafile=certifi.where())

            # Use smtplib directly for more control
            with smtplib.SMTP_SSL(
                settings.EMAIL_HOST, settings.EMAIL_PORT, context=context
            ) as server:
                server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)

                message = f"Subject: Ping Pong\n\nYour OTP code is {otp}"

                server.sendmail(
                    settings.EMAIL_HOST_USER, [user.email], message.encode("utf-8")
                )

        except Exception as e:
            print("SMTP Error:", str(e))
            return Response(
                {"error": f"Failed to send OTP: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
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

    try:
        context = ssl.create_default_context(cafile=certifi.where())
        with smtplib.SMTP_SSL(
            settings.EMAIL_HOST, settings.EMAIL_PORT, context=context
        ) as server:
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            message = f"Subject: Your OTP Code\n\nYour OTP code is {otp}"
            server.sendmail(
                settings.EMAIL_HOST_USER, [user.email], message.encode("utf-8")
            )
        return Response(
            {"message": "OTP sent to your email address."}, status=status.HTTP_200_OK
        )
    except Exception as e:
        print("SMTP Error:", str(e))
        return Response(
            {"error": f"Failed to send OTP: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
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

    try:
        context = ssl.create_default_context(cafile=certifi.where())

        with smtplib.SMTP_SSL(
            settings.EMAIL_HOST, settings.EMAIL_PORT, context=context
        ) as server:
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            message = (
                f"Subject: Your New Password\n\n"
                f"Your new password is: {new_password}\n\n"
                "Please change your password after logging in for better security."
            )
            server.sendmail(
                settings.EMAIL_HOST_USER, [user.email], message.encode("utf-8")
            )

        return Response(
            {"message": "New password sent to your email address."},
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        print("SMTP Error:", str(e))
        return Response(
            {"error": f"Failed to send new password: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )


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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    try:
        user = request.user
        avatar_url = user.avatar.url if user.avatar else None
        cover_url = user.cover.url if user.cover else None
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "avatar": avatar_url,
                "cover": cover_url,
                "bio": user.bio,
            },
            status=status.HTTP_200_OK,
        )
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def suggest_friends(request):
    try:
        current_user = request.user

        all_users = User.objects.exclude(Q(id=current_user.id) | Q(is_superuser=True))

        related_users = Friend.objects.filter(
            Q(user1=current_user) | Q(user2=current_user)
        )

        related_user_ids = set()
        for relation in related_users:
            if relation.user1 != current_user:
                related_user_ids.add(relation.user1.id)
            if relation.user2 != current_user:
                related_user_ids.add(relation.user2.id)

        suggested_users = all_users.exclude(id__in=related_user_ids)[:10]

        if suggested_users.exists():
            serializer = UserSerializer(suggested_users, many=True)
            return Response(serializer.data)
        else:
            return Response([], status=status.HTTP_204_NO_CONTENT)

    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_friend(request):
    try:
        current_user = request.user
        friend_id = request.data.get("friend_id")

        friend = User.objects.get(id=friend_id)

        if (
            Friend.objects.filter(user1=current_user, user2=friend).exists()
            or Friend.objects.filter(user1=friend, user2=current_user).exists()
        ):
            return Response(
                {"message": "Already friends"}, status=status.HTTP_400_BAD_REQUEST
            )

        create_notification(friend, current_user, "FRIEND_REQUEST", link=None)

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


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def search_bar_list(request):
    try:
        user = request.user
        user_list = (
            User.objects.all()
            .exclude(Q(id=user.id) | Q(is_superuser=True))
            .values("id", "avatar", "username")
        )
        return Response(user_list, status=status.HTTP_200_OK)
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_general_info(request):
    try:
        user = request.user
        data = request.data

        new_username = data.get("username")
        if new_username and new_username != user.username:
            if User.objects.filter(username=new_username).exists():
                return Response(
                    {"error": "Username already taken."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.username = generate_unique_username(new_username)

        new_bio = data.get("bio")
        if new_bio:
            if len(new_bio) > 150:
                return Response(
                    {"error": "Bio must be 150 characters or less."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            user.bio = new_bio

        new_avatar = data.get("avatar")
        if new_avatar:
            if user.avatar and user.avatar.name != "avatars/default_avatar.png":
                user.avatar.delete()

            avatar_extension = os.path.splitext(new_avatar.name)[1]
            avatar_filename = f"{user.username}{avatar_extension}"
            user.avatar.save(
                avatar_filename, ContentFile(new_avatar.read()), save=False
            )

        new_cover = data.get("cover")
        if new_cover:
            if user.cover and user.cover.name != "covers/default_cover.png":
                user.cover.delete()

            cover_extension = os.path.splitext(new_cover.name)[1]
            cover_filename = f"{user.username}{cover_extension}"
            user.cover.save(cover_filename, ContentFile(new_cover.read()), save=False)

        user.save()

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

    if user.email.endswith("@student.1337.ma"):
        return Response(
            {"error": "Users with a 1337 email address cannot change their password."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not user.check_password(old_password):
        return Response(
            {"error": "Old password is incorrect."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    password_errors = validate_password_complexity(new_password)
    if password_errors:
        return Response(
            {"error": password_errors},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.password = make_password(new_password)
    user.save()

    return Response(
        {"message": "Password changed successfully."},
        status=status.HTTP_200_OK,
    )


def validate_password_complexity(password):
    """Check password for complexity: min 8 chars, upper, lower, digit, special."""
    if len(password) < 8:
        return "must be at least 8 characters long."

    if not re.search(r"[A-Z]", password):
        return "must contain at least one uppercase letter."

    if not re.search(r"[a-z]", password):
        return "must contain at least one lowercase letter."

    if not re.search(r"\d", password):
        return "must contain at least one digit."

    if not re.search(r"[!@#$%^&*]", password):
        return "must contain at least one special character (!@#$%^&*)."

    return None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def handle_friend_request(request, id, action):
    try:
        current_user = request.user
        friend = User.objects.get(id=id)
        friend_request = Friend.objects.filter(
            (Q(user1=current_user, user2=friend) | Q(user1=friend, user2=current_user)),
            request=True,
        ).first()

        notification = Notifications.objects.filter(
            (Q(sender=current_user, user=friend) | Q(sender=friend, user=current_user)),
            notification_type="FRIEND_REQUEST",
        ).first()

        if not friend_request:
            return Response(
                {"error": "No friend request found between users."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if action == "accept":
            friend_request.accept = True
            friend_request.request = False
            friend_request.save()

            notification.delete()
            create_notification(
                friend, current_user, "FRIEND_REQUEST_ACCEPTED", link=None
            )
            return Response(
                {"message": "Friend request accepted."},
                status=status.HTTP_200_OK,
            )

        elif action == "deny":
            friend_request.delete()
            notification.delete()

            create_notification(
                friend, current_user, "FRIEND_REQUEST_DENIED", link=None
            )

            return Response(
                {"message": "Friend request denied."},
                status=status.HTTP_200_OK,
            )

        else:
            return Response(
                {"error": "Invalid action specified."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    except User.DoesNotExist:
        return Response(
            {"error": "User does not exist."},
            status=status.HTTP_404_NOT_FOUND,
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
