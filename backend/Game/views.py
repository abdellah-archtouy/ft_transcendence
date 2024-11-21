from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError
from .models import Game
from rest_framework.response import Response
from rest_framework import status
from User.models import User
from User.serializers import UserSerializer
from django.db.models import Count, F


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top5(request):
    try:
        # my_sorted_list = User.objects.all().filter(score__gt=0).order_by("-score")[:5].values("id", "avatar", "username", "rank", "score")
        my_sorted_list = (
            User.objects.annotate(
                matches_won=Count("user1_game", distinct=True),
                matches_lost=Count("user2_game", distinct=True),
                total_matches=Count("user1_game", distinct=True)
                + Count("user2_game", distinct=True),
            )
            .order_by("rank")[:5]
            .values(
                "avatar",
                "username",
                "rank",
                "score",
                "matches_won",
                "matches_lost",
                "total_matches",
            )
        )
        return Response(
            my_sorted_list,
            status=status.HTTP_200_OK,
        )
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except TokenError as e:
        print(f"top5: {e}")

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    try:
        # my_sorted_list = User.objects.all().filter(score__gt=0).order_by("-score")[:5].values("id", "avatar", "username", "rank", "score")
        user = request.user
        my_sorted_list = (
            User.objects.annotate(
                matches_won=Count("user1_game", distinct=True),
                matches_lost=Count("user2_game", distinct=True),
                total_matches=Count("user1_game", distinct=True)
                + Count("user2_game", distinct=True),
            )
            .order_by("rank")
            .values(
                "avatar",
                "username",
                "rank",
                "score",
                "matches_won",
                "matches_lost",
                "total_matches",
            )
        )
        my_sorted_list = [
            {**user, "link": f"/user/{user['username']}" if user["username"] != request.user.username else f"/profile"}
            for user in my_sorted_list
        ]
        return Response(
            my_sorted_list,
            status=status.HTTP_200_OK,
        )
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except TokenError as e:
        print(f"top5: {e}")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def last_three_matches(request):
    try:
        user = request.user
        history = (
            user.user2_game.all()
            .annotate(
                winner_username=F("winner__username"),
                winner_avatar=F("winner__avatar"),
                loser_username=F("loser__username"),
                loser_avatar=F("loser__avatar"),
            )
            .union(
                user.user1_game.all().annotate(
                    winner_username=F("winner__username"),
                    winner_avatar=F("winner__avatar"),
                    loser_username=F("loser__username"),
                    loser_avatar=F("loser__avatar"),
                )
            )
        )
        send = history.order_by("-created_at").values(
            "winner_username",
            "winner_avatar",
            "loser_username",
            "loser_avatar",
            "winner_score",
            "loser_score",
            "created_at",
        )
        for item in send:
            item["loser_goals"] = item.pop("loser_score")
            item["winner_goals"] = item.pop("winner_score")
        return Response(
            send,
            status=status.HTTP_200_OK,
        )
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except TokenError as e:
        print(f"last three matches: {e}")
