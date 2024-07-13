from django.db import models
from User.models import User
# Create your models here.

class Game(models.Model):
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1_game')
    loser = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2_game')
    winner_score = models.IntegerField(default=0)
    loser_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    end = models.DateTimeField(auto_now_add=True)