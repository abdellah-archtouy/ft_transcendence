from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser
import datetime


def reset_ranks():
    users = User.objects.all()
    sorted_users_by_score = users.order_by("-score")
    for rank, user in enumerate(sorted_users_by_score, start=1):
        user.rank = rank
        user.save()


# Create your models here.
class User(AbstractUser):
    # username = models.CharField(max_length=100, unique=True)
    # email = models.EmailField(unique=True)
    # password = models.CharField(max_length=50, null=False)
    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True,
        default="avatars/default_avatar.png",
    )
    cover = models.ImageField(
        upload_to="covers/", null=True, blank=True, default="covers/default_cover.png"
    )
    bio = models.TextField(blank=True)  # Removed max_length, added blank=True
    win = models.IntegerField(default=0)
    lose = models.IntegerField(default=0)
    score = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    stat = models.BooleanField(default=False)

    # USERNAME_FIELD = 'email'
    # REQUIRED_FIELDS = []
    def __str__(self):
        return self.username


class UserOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + datetime.timedelta(minutes=5)

    def __str__(self):
        return f"{self.user.email} - {self.otp}"


class Achievement(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE  # , related_name='user_achievement'
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

    def __str__(self):
        return f"{self.user1.username} - {self.user2.username}"
