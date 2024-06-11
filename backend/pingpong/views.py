from django.http import HttpResponseNotAllowed, JsonResponse
from .models import User

def ping(request):
    if request.method == "GET":
        data = list(User.objects.values())
        return JsonResponse(data, safe=False)
    else:
        return HttpResponseNotAllowed(['GET'], "Method not allowed")
