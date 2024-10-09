from django.urls import path, include
from .views import (
    register_user,
    login_user,
    verify_otp,
    get_user_data,
    suggest_friends,
    handle_42_callback,
    validate_token,
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("users/signup/", register_user, name="register_user"),
    path("users/login/", login_user, name="login_user"),
    path("users/verify-otp/", verify_otp, name="verify_otp"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("users/profile/", get_user_data, name="get_user_data"),
    path("users/suggest_friends/", suggest_friends, name="suggest_friends"),
    path("auth/callback/", handle_42_callback, name="handle_42_callback"),
    path("users/validate/", validate_token, name="validate_token"),
]
