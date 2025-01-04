from django.urls import path
from .views import get_notifications, set_notifications

urlpatterns = [
    path("", get_notifications),
    path("set_notification/", set_notifications),
]