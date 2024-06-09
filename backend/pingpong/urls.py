from pingpong.views import ping , json
from django.urls import path


urlpatterns = [
    path('', ping),
    path('json/', json),
]