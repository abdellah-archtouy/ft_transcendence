from django.contrib import admin
from .models import Conversation, Message, Block_mute
# Register your models here.
admin.site.register(Conversation)
admin.site.register(Message)
admin.site.register(Block_mute)