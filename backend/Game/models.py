from django.db import models
from User.models import User
from .views import assign_achievement
from django.db import transaction

# Create your models here.


class Game(models.Model):
    winner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user1_game"
    )
    loser = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user2_game")
    winner_score = models.IntegerField(default=0)
    loser_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    end = models.DateTimeField(auto_now_add=True)

    def update_ranks_after_game(self):
        """Update ranks for all users based on their scores"""
        with transaction.atomic():
            # Get all users ordered by score, locking the rows
            users = (
                User.objects.exclude(is_superuser=True)
                .order_by("-score")
                .select_for_update()
            )

            # Update ranks if they've changed
            for new_rank, user in enumerate(users, start=1):
                if user.rank != new_rank:
                    user.rank = new_rank
                    user.save(update_fields=["rank"])

    def save(self, *args, **kwargs):
        # Call the original save method to store the game first
        super().save(*args, **kwargs)

        # Update the winner's score by adding the winner_score
        self.winner.score += (self.winner_score - self.loser_score) * 20
        self.winner.win += 1
        self.loser.lose += 1
        with transaction.atomic():
            self.loser.save()
            self.winner.save()
            self.update_ranks_after_game()
        assign_achievement(self.winner)
        assign_achievement(self.loser)
