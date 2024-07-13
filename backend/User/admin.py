from django.contrib import admin
from .models import User, Achievement, Friend, Notification
# Register your models here.
admin.site.register(User)
admin.site.register(Achievement)
admin.site.register(Friend)
admin.site.register(Notification)