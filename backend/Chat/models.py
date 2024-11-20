from django.db import models
from User.models import User
# Create your models here.

class Conversation(models.Model):
    uid1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1')
    uid2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2')
    last_message = models.TextField(max_length=200)
    last_message_time = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField(max_length=200)
    time = models.DateTimeField(auto_now_add=True)
    msg_type = models.TextField(max_length=200)
    invite_room_name = models.TextField(max_length=200, null=True, blank=True)

class Block_mute(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blocked_user2')
    block = models.BooleanField(default=False)
    mute = models.BooleanField(default=False)