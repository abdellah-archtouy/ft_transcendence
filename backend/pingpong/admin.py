from django.contrib import admin
from .models import User, conversation, message, achievement, friend, game
# Register your models here.

admin.site.register(User)
admin.site.register(conversation)
admin.site.register(message)
admin.site.register(achievement)
admin.site.register(friend)
admin.site.register(game)