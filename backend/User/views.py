from django.shortcuts import render
from django.http import JsonResponse
from .models import User  # Import your custom User model

# Create your views here.
def user(request):
    if request.method == 'GET':
        try:
            # For demonstration, let's get the first user in the database
            user_instance = User.objects.filter(stat=False).first()
            
            print(user_instance.username)
            if user_instance:
                user_instance.stat = True
                user_instance.save()
                user_data = {
                    'uid': user_instance.id,  # UID is the primary key 'id'
                    'username': user_instance.username,
                    'email': user_instance.email,
                    'password': user_instance.password,  # Be cautious about sending passwords
                    'avatar': user_instance.avatar.url if user_instance.avatar else None,
                    'cover': user_instance.cover.url if user_instance.cover else None,
                    'bio': user_instance.bio,
                    'win': user_instance.win,
                    'lose': user_instance.lose,
                    'score': user_instance.score,
                    'rank': user_instance.rank,
                    'stat': user_instance.stat,
                }
                return JsonResponse(user_data)
            else:
                return JsonResponse({'error': 'User not found'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
