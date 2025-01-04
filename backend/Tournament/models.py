from django.db import models
from User.models import User
from Game.views import assign_achievement
from django.db import transaction


# Create your models here.
class Tournaments(models.Model):
    name = models.CharField(max_length=100)
    winner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="Tournament_winner",
        blank=True,
        null=True,
    )
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
        self.winner.score += (
            12 * 20
        )  # => because he won two matches and we give him all 6 because he is part of tournament
        self.winner.win += 1
        self.winner.save()
        self.update_ranks_after_game()
        assign_achievement(self.winner)
