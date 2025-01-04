from django.http import HttpResponse


def hello(request):
    return HttpResponse("Hello, world. You're at the polls index.")
def root(request):
    return HttpResponse("7na f root daba")