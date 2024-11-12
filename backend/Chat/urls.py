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
)

urlpatterns = [
    path("users/", UsersView.as_view()),
    path("conv/<int:id>/", ConvView),
    path("msg/<int:id>/", get_messages),
    path("post/msg/", post_message, name="post_message"),
    path("user/", UserView),
    path("user/data/", get_user_data, name="get_user_data"),
    path("user/chart/", get_user_win_and_lose, name="get_user_data"),
]
