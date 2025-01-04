# from .views import Logout ,UserView , UsersView , Hi , ConvView ,MsgView, get_messages , post_message , RegisterView , LoginView , UserDetailView
from django.urls import path
from .views import (
    UserView,
    ConvView,
    get_messages,
    post_message,
    get_user_data,
    get_user_win_and_lose,
    get_ouser_data,
    get_ouser_win_and_lose,
    ConverstationView,
    getconvView,
    get_friends,
    setmatch,
    get_friend,
    mute_friend,
    get_mute_friend,
    block_friend,
)

urlpatterns = [
    path("users/", get_friends, name="get_friends"),
    path("conv/", ConvView),
    path("conversation/<str:convid>/", ConverstationView),
    path("msg/<int:username>/", get_messages),
    path("post/msg/", post_message, name="post_message"),
    path("user/", UserView),
    path("user/data/", get_user_data, name="get_user_data"),
    path("ouser/data/<str:uid>", get_ouser_data, name="get_other_user_data"), # here i changed the username with the uid of the user
    path("ouser/chart/<str:uid>", get_ouser_win_and_lose, name="get_other_user_data"), # and here too
    path("ouser/getconv/<str:username>", getconvView, name="getcomanconv"),
    path("user/chart/", get_user_win_and_lose, name="get_user_data"),
    path("ouser/friendreq/<int:username>", get_friend, name="get_friend"),
    path("game/<int:fid>", setmatch, name="setmatch"),
    path('mute/<int:username>/', mute_friend, name='mutefriend'),
    path('block/<int:username>/', block_friend, name='blockfriend'),
    path('mute/get/<int:username>/', get_mute_friend, name='getmutefriend'),
]
