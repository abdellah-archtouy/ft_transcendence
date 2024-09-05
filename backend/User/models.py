from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import datetime


class UserOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + datetime.timedelta(minutes=5)

    def __str__(self):
        return f"{self.user.email} - {self.otp}"


# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=50, null=False)
    email = models.EmailField(null=False)
    password = models.CharField(max_length=128, null=False)
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    cover = models.ImageField(upload_to="covers/", null=True, blank=True)
    bio = models.TextField(blank=True)
    win = models.IntegerField(default=0)
    lose = models.IntegerField(default=0)
    score = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    stat = models.BooleanField(default=False)

    def __str__(self):
        return self.username


class Achievement(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE
    )  # Renamed uid to user for clarity
    maestro = models.BooleanField(default=False)
    downkeeper = models.BooleanField(default=False)
    jocker = models.BooleanField(default=False)
    thunder_strike = models.BooleanField(default=False)
    the_emperor = models.BooleanField(
        default=False
    )  # Changed theEmperor to the_emperor


class Friend(models.Model):
    user1 = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friends_sent"
    )
    user2 = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friends_received"
    )
    request = models.BooleanField(default=False)
    accept = models.BooleanField(default=False)
    block = models.BooleanField(default=False)
    mute = models.BooleanField(default=False)


class Notification(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )  # Fixed related_name
    message = models.TextField(blank=True)  # Removed max_length, added blank=True
    time = models.DateTimeField(auto_now_add=True)
