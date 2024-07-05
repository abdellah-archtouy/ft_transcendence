from pingpong.views import ping
from django.urls import path


urlpatterns = [
    path('', ping),
]
