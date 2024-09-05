from django.urls import path, include
from .views import register_user, login_user

urlpatterns = [
    path("users/signup/", register_user, name="register_user"),
    path("users/login/", login_user, name="login_user"),
    path("users/verify-otp/", register_user, name="verify_otp"),
]
