from django.urls import path, include
from .views import register_user, login_user, verify_otp

urlpatterns = [
    path("users/signup/", register_user, name="register_user"),
    path("users/login/", login_user, name="login_user"),
    path("users/verify-otp/", verify_otp, name="verify_otp"),
]
