# signals.py
from django.db.models.signals import post_delete
from django.dispatch import receiver
from django.conf import settings
import os


@receiver(post_delete, sender=settings.AUTH_USER_MODEL)
def delete_user_images(sender, instance, **kwargs):
    # Delete avatar if it's not the default avatar
    if instance.avatar and instance.avatar.name != "avatars/default_avatar.png":
        instance.avatar.delete(save=False)
    # Delete cover if it's not the default cover
    if instance.cover and instance.cover.name != "covers/default_cover.png":
        instance.cover.delete(save=False)
