# signals.py
from django.db.models.signals import post_delete
from django.db.models.signals import post_migrate
from .models import User
from django.dispatch import receiver
from django.conf import settings


@receiver(post_delete, sender=settings.AUTH_USER_MODEL)
def delete_user_images(sender, instance, **kwargs):
    if instance.avatar and instance.avatar.name != "avatars/default_avatar.png":
        instance.avatar.delete(save=False)
    if instance.cover and instance.cover.name != "covers/default_cover.png":
        instance.cover.delete(save=False)


@receiver(post_migrate)
def create_superuser(sender, **kwargs):
    """Create superuser after migrations."""
    username = settings.ADMIN_USERNAME
    password = settings.ADMIN_PASSWORD
    email = settings.ADMIN_EMAIL

    try:
        if not User.objects.filter(username=username, is_superuser=True).exists():
            User.objects.create_superuser(
                username=username, email=email, password=password
            )
            print(f"Superuser {username} created.")
        else:
            print(f"Superuser {username} already exists.")
        if not User.objects.filter(username='Tournament').exists():
            User.objects.create_superuser(
                username='Tournament', 
                stat=True
            )
    except Exception as e:
        print(f"Error creating superuser: {str(e)}")
