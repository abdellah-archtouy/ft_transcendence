from .views import Logout ,UserView , UsersView , Hi , ConvView ,MsgView, get_messages , post_message , RegisterView , LoginView , UserDetailView
from django.urls import path

urlpatterns = [
    path('users/', UsersView.as_view()),
    # path('user/', UserDetailView.as_view(), name='user-detail'),
    path('conv/<int:id>/', ConvView.as_view()),
    path('msg/<int:id>/', get_messages),
    path('post/msg/', post_message , name="post_message"),
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('user/', UserView.as_view()),
    path('logout/', Logout.as_view()),

    path('', Hi),
]
