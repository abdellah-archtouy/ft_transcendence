from django.contrib import admin

# Register your models here.
from .models import User, conversation, message ,achievement ,friend ,game

admin.site.register(User)
admin.site.register(conversation)
admin.site.register(message)
admin.site.register(achievement)
admin.site.register(friend)
admin.site.register(game)