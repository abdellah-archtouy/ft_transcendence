from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import top5
from .views import last_three_matches

urlpatterns = [
    path("top5/", top5, name="top5"),
    path("history/", last_three_matches, name="last_three_matches"),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
