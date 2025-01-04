from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractUser
import datetime
from django.db import transaction


class User(AbstractUser):
    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True,
        default="avatars/default_avatar.png",
    )
    cover = models.ImageField(
        upload_to="covers/", null=True, blank=True, default="covers/default_cover.png"
    )
    bio = models.TextField(blank=True, null=True, max_length=150)
    win = models.IntegerField(default=0)
    lose = models.IntegerField(default=0)
    score = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    stat = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.pk:  # If this is a new user (not yet saved to database)
            with transaction.atomic():
                # Get the current highest rank
                last_rank = (
                    User.objects.exclude(is_superuser=True).aggregate(
                        models.Max("rank")
                    )["rank__max"]
                    or 0
                )

                # Set the new user's rank to last_rank + 1
                self.rank = last_rank + 1

        super().save(*args, **kwargs)

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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    maestro = models.BooleanField(default=False)
    downkeeper = models.BooleanField(default=False)
    jocker = models.BooleanField(default=False)
    thunder_strike = models.BooleanField(default=False)
    the_emperor = models.BooleanField(default=False)


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


class BlacklistedToken(models.Model):
    token = models.CharField(max_length=500)
    blacklisted_at = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(
        "User", on_delete=models.CASCADE
    )  # Adjust the User model reference as needed

    class Meta:
        indexes = [
            models.Index(fields=["token"]),
            models.Index(fields=["user"]),
        ]
