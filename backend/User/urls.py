from django.urls import path
from .views import (
    register_user,
    login_user,
    verify_otp,
    get_user_data,
    suggest_friends,
    handle_42_callback,
    resend_otp,
    forgot_password,
    add_friend,
    search_bar_list,
    update_general_info,
    change_password,
    handle_friend_request,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("signup/", register_user, name="register_user"),
    path("login/", login_user, name="login_user"),
    path("verify-otp/", verify_otp, name="verify_otp"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", get_user_data, name="get_user_data"),
    path("suggest_friends/", suggest_friends, name="suggest_friends"),
    path("auth/callback/", handle_42_callback, name="handle_42_callback"),
    path("resend-otp/", resend_otp, name="resend_otp"),
    path("forgot-password/", forgot_password, name="forgot_password"),
    path("add_friend/", add_friend, name="add_friend"),
    path("searchbar/", search_bar_list, name="search_bar_list"),
    path("change_password/", change_password, name="change_password"),
    path("update-general-info/", update_general_info, name="update_general_info"),
    path(
        "friends/<int:id>/<str:action>/",
        handle_friend_request,
        name="handle_friend_request",
    ),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
