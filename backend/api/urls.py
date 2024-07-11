from .views import UserView , Hi
from django.urls import path

urlpatterns = [
    path('user/', UserView.as_view()),

    path('', Hi),
]
