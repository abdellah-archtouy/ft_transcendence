from django.apps import AppConfig


class UserConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "User"

    def ready(self):
        import User.signals


# class YourAppNameConfig(AppConfig):
#     name = 'your_app_name'

#     def ready(self):
#         import your_app_name.signals
