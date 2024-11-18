# from .views import Logout ,UserView , UsersView , Hi , ConvView ,MsgView, get_messages , post_message , RegisterView , LoginView , UserDetailView
from django.urls import path
from .views import (
    UserView,
    ConvView,
    get_messages,
    post_message,
    UsersView,
    get_user_data,
    get_user_win_and_lose,
    get_ouser_data,
    get_ouser_win_and_lose,
    ConverstationView,
    getconvView,
)

urlpatterns = [
    path("users/", UsersView.as_view()),
    path("conv/", ConvView),
    path("conversation/<str:convid>/", ConverstationView),
    path("msg/<str:username>/", get_messages),
    path("post/msg/", post_message, name="post_message"),
    path("user/", UserView),
    path("user/data/", get_user_data, name="get_user_data"),
    path("ouser/data/<str:username>", get_ouser_data, name="get_other_user_data"),
    path("ouser/chart/<str:username>", get_ouser_win_and_lose, name="get_other_user_data"),
    path("ouser/getconv/<str:username>", getconvView, name="getcomanconv"),
    path("user/chart/", get_user_win_and_lose, name="get_user_data"),
]
