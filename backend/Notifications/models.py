from django.db import models
from User.models import User
from django.utils import timezone
import datetime

# Create your models here.
class Notifications(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notification_sender", null=True, blank=True
    )
    message = models.TextField(blank=True)  # Removed max_length, added blank=True
    time = models.DateTimeField(default=timezone.now)
    read = models.BooleanField(default=False)
    notification_type = models.CharField(max_length=50, blank=True, choices=[
        ("FRIEND_REQUEST", "Friend Request"),
        ("MATCH_INVITE", "Match Invite"),
        ("TOURNAMENT_INVITE", "Tournament Invite"),
        ("CHAT_MESSAGE", "Chat Message")
    ])

    def __str__(self) -> str:
        return f"Notification for {self.user.username}: {self.message[:20]}..."