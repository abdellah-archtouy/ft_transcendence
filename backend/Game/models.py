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

    def save(self, *args, **kwargs):
        # Call the original save method to store the game first
        super().save(*args, **kwargs)

        # Update the winner's score by adding the winner_score
        self.winner.score += (self.winner_score - self.loser_score) * 20
        self.winner.save()
        self.reset_ranks()

    @staticmethod
    def reset_ranks():
        users = User.objects.all()
        sorted_users_by_score = users.order_by("-score")
        for rank, user in enumerate(sorted_users_by_score, start=1):
            user.rank = rank
            user.save()

    # def set_achievement(self):
    #     # setting Downkeeper
    #     get_all_matchs = self.winner.user1_game.loser_score
            