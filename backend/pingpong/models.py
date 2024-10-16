from django.db import models

# Create your models here.
class User(models.Model):
    username = models.CharField(max_length=50, null=False)
    email = models.EmailField(null=False)
    password = models.CharField(max_length=50, null=False)
    avatar = models.ImageField(upload_to='avatars/' , default='avatars/default.jpg')
    cover = models.ImageField(upload_to='covers/' , default='covers/default.jpg')
    bio = models.TextField(max_length=200)
    win = models.IntegerField(default=0)
    lose = models.IntegerField(default=0)
    score = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    stat = models.BooleanField(default=False)

    def __str__(self):
        return self.username
    def conversation_set(self):
        return conversation.objects.filter(user1=self) | conversation.objects.filter(user2=self)


class conversation(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2')
    last_message = models.TextField(max_length=200)
    last_message_time = models.DateTimeField(auto_now_add=True)


class message(models.Model):
    conversation = models.ForeignKey(conversation, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField(max_length=200)
    time = models.DateTimeField(auto_now_add=True)

class achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    achievement1 = models.BooleanField(default=False)
    achievement2 = models.BooleanField(default=False)
    achievement3 = models.BooleanField(default=False)
    achievement4 = models.BooleanField(default=False)
    achievement5 = models.BooleanField(default=False)

class friend(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1_friend')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2_friend')
    request = models.BooleanField(default=False)
    accept = models.BooleanField(default=False)
    block = models.BooleanField(default=False)
    mute = models.BooleanField(default=False)

class game(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user1_game')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user2_game')
    user1_score = models.IntegerField(default=0)
    user2_score = models.IntegerField(default=0)
    time = models.DateTimeField(auto_now_add=True)
    winner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='winner_game')