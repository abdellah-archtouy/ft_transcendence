# signals.py
from django.db.models.signals import post_delete
from django.db.models.signals import post_migrate
from .models import User
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


# @receiver(post_migrate)
# def create_superuser(sender, **kwargs):
#     """Create superuser after migrations."""
#     username = settings.ADMIN_USERNAME
#     password = settings.ADMIN_PASSWORD
#     email = settings.ADMIN_EMAIL

#     # Check if superuser has already been created
#     if not os.path.exists('/app/superuser_created.flag'):  # Create a file to check if the superuser has been created
#         if not User.objects.filter(username=username).exists():
#             User.objects.create_superuser(username=username, email=email, password=password)
#             print(f"Superuser {username} created.")
#         else:
#             print(f"Superuser {username} already exists.")
        
#         # Create a file to mark that the superuser has been created
#         with open('/app/superuser_created.flag', 'w') as f:
#             f.write('superuser_created')
#     else:
#         print("Superuser creation skipped - already done.")

@receiver(post_migrate)
def create_superuser(sender, **kwargs):
    """Create superuser after migrations."""
    username = settings.ADMIN_USERNAME
    password = settings.ADMIN_PASSWORD
    email = settings.ADMIN_EMAIL

    try:
    # Check if superuser has already been created
        if not User.objects.filter(username=username, is_superuser=True).exists():
            User.objects.create_superuser(
                    username=username, 
                    email=email, 
                    password=password
                )
            print(f"Superuser {username} created.")
        else:
            print(f"Superuser {username} already exists.")
    except Exception as e:
        print(f"Error creating superuser: {str(e)}")