# from .views import Logout ,UserView , UsersView , Hi , ConvView ,MsgView, get_messages , post_message , RegisterView , LoginView , UserDetailView
from django.urls import path
from .views import UserView , ConvView ,get_messages ,post_message ,UsersView

urlpatterns = [
    path('users/', UsersView.as_view()),
    path('conv/<int:id>/', ConvView),
    path('msg/<int:id>/', get_messages),
    path('post/msg/', post_message , name="post_message"),
    path('user/', UserView),

]

    # path('logout/', Logout.as_view()),
    # path('', Hi),
    # path('register/', RegisterView.as_view()),
    # path('login/', LoginView.as_view()),