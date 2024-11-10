from django.db import models
from User.models import User

# Create your models here.
class Tournaments(models.Model):
    name = models.CharField(max_length=100)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='Tournament_winner', blank=True, null=True)
    users = models.ManyToManyField(User, related_name='Tournament_users', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    end = models.DateTimeField(auto_now_add=True)
    users_num = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        # Automatically calculate users_num based on non-null user fields
        self.users_num = sum(1 for user in self.users if user is not None)
        super(Tournaments, self).save(*args, **kwargs)