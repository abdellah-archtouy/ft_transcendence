from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import top5, last_three_matches, leaderboard

urlpatterns = [
    path("top5/", top5, name="top5"),
    path("history/", last_three_matches, name="last_three_matches"),
    path("leaderboard/", leaderboard, name="leaderboard"),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)