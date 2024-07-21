from .views import UserView , Hi , ConvView ,MsgView, get_messages , post_message
from django.urls import path

urlpatterns = [
    path('user/', UserView.as_view()),
    path('conv/<int:id>/', ConvView.as_view()),
    path('msg/<int:id>/', get_messages),
    path('post/msg/', post_message , name="post_message"),

    path('', Hi),
]
