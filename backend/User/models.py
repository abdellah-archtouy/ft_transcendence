from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
import datetime
from django.conf import settings


class UserOTP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + datetime.timedelta(minutes=5)

    def __str__(self):
        return f"{self.user.email} - {self.otp}"


# Custom User Manager
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


# Custom User Model
class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50, null=False)
    email = models.EmailField(unique=True, null=False)
    password = models.CharField(max_length=128, null=False)
    avatar = models.ImageField(
        upload_to="avatars/",
        null=True,
        blank=True,
        default="avatars/default_avatar.jpg",
    )
    cover = models.ImageField(upload_to="covers/", null=True, blank=True)
    bio = models.TextField(blank=True)
    win = models.IntegerField(default=0)
    lose = models.IntegerField(default=0)
    score = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    stat = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"  # Field used for login
    REQUIRED_FIELDS = ["username"]  # Fields required when creating a superuser

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

    def __str__(self):
        return f"{self.user1.username} - {self.user2.username}"


class Notification(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="notifications"
    )  # Fixed related_name
    message = models.TextField(blank=True)  # Removed max_length, added blank=True
    time = models.DateTimeField(auto_now_add=True)
