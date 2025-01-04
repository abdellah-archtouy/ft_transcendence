from django.urls import path
from .views import get_tournament, set_tournament

urlpatterns = [
    path("", get_tournament),
    path("set_notification/", set_tournament),
]