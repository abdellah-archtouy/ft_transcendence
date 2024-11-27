from django.db import models
from User.models import User, reset_ranks
from Game.views import assign_achievement

# Create your models here.
class Tournaments(models.Model):
    name = models.CharField(max_length=100)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='Tournament_winner', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    end = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Call the original save method to store the game first
        super().save(*args, **kwargs)

        # Update the winner's score by adding the winner_score
        self.winner.score += 12 * 20 # => because he won two matches and we give him all 6 because he is part of tournament
        self.winner.win += 1
        self.loser.lose += 1
        self.loser.save()
        self.winner.save()
        reset_ranks()
        assign_achievement(self.winner)