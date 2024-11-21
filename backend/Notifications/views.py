from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError

# from .models import Game
from rest_framework.response import Response
from rest_framework import status
from User.models import User
from .models import Notifications
from .serializer import notificationSerializer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Create your views here.


def get_avatar(sender_id):
    avatar = "/gameIcon.svg"
    if sender_id:
        sender_obj = User.objects.get(id=sender_id.id)  # Fetch the sender object
        avatar = sender_obj.avatar.url if sender_obj.avatar else None
    return avatar


def create_notification(friend, user, n_type, link):
    if user and n_type != "TOURNAMENT_INVITE":
        if n_type == "FRIEND_REQUEST":
            message = f"{user.username} sent you a friend request"
        elif n_type == "MATCH_INVITE":
            message = f"{user.username} invited you to a match"
        elif n_type == "CHAT_MESSAGE":
            message = f"{user.username} sent you a message"
        elif n_type == "FRIEND_REQUEST_ACCEPTED":
            message = f"{user.username} accepted your friend request"
        elif n_type == "FRIEND_REQUEST_DENIED":
            message = f"{user.username} rejected your friend request"
    if n_type == "TOURNAMENT_INVITE":
        message = "Tournament your match is about to begin!"
    notification = {
        "user": friend.id,
        "sender": user.id if user else None,
        "message": message,
        "notification_type": n_type,
        "link": link,
    }
    notification_serializer = notificationSerializer(data=notification)
    if notification_serializer.is_valid():
        notification_instance = notification_serializer.save()

        channel_layer = get_channel_layer()
        avatar = get_avatar(notification_instance.sender)
        sent_data = {
            "id": notification_instance.id,
            "sender_avatar": avatar,  # Access avatar URL
            "message": notification_instance.message,
            "notification_type": notification_instance.notification_type,
            "link": notification_instance.link,
            "sender": (
                notification_instance.sender.id
                if notification_instance.sender
                else None
            ),
            "user": notification_instance.user.id,
            "time": notification_instance.time.isoformat(),  # Convert time to ISO format for JSON compatibility
        }
        async_to_sync(channel_layer.group_send)(
            f"Notif_{friend.id}",  # Group name should match the user's channel group name
            {
                "type": "send_notification",  # This will match the method in your consumer
                "notification": sent_data,
            },
        )
    return notification_serializer


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_notifications(request):
    try:
        user = request.user
        notifications = Notifications.objects.filter(user=user)
        data = notificationSerializer(notifications, many=True).data
        custom_data = []
        for notification in data:
            sender_id = notification["sender"]
            sender = (
                User.objects.get(id=sender_id) if sender_id else None
            )  # Get the sender ID from the serialized data
            avatar = get_avatar(sender)
            sent_data = {
                "sender_avatar": avatar,
                "sender": sender_id,
                "message": notification["message"],
                "notification_type": notification["notification_type"],
                "link": notification["link"],
                "time": notification["time"],
                "user": notification["user"],
            }
            custom_data.append(sent_data)

        custom_data_sorted = sorted(custom_data, key=lambda x: x["time"], reverse=True)
        return Response(
            custom_data_sorted,
            status=status.HTTP_200_OK,
        )
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except TokenError as e:
        print(f"top5: {e}")


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_notifications(request):
    print(f"request.data: {request.data}")
    try:
        notification_type = request.data.get("notification_type")
        if notification_type != "TOURNAMENT_INVITE":
            user = request.user
        else:
            user = None
        friend_id = request.data.get("friend_id")
        print(f"friend_id: {friend_id}")
        friend = User.objects.get(id=friend_id)
        notification_serializer = create_notification(friend, user, notification_type)
        if notification_serializer.is_valid():
            return Response(
                notification_serializer.data, status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                notification_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
