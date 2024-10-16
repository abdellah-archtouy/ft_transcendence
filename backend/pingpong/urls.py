from pingpong.views import ping , json
from django.urls import path
from .views import UserView


urlpatterns = [
    path('', ping),
    path('json/', json),
    # path('user/', UserView.as_view()),
]
