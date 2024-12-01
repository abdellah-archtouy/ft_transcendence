from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response
from rest_framework import status
from User.serializers import UserSerializer
from django.db.models import F, Q
from django.apps import apps
from User.models import User, Achievement
from django.db import transaction

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def top5(request):
    try:

        my_sorted_list = (
            User.objects.exclude(is_superuser=True).annotate(
                matches_won=F("win"),
                matches_lost=F("lose"),
                total_matches=F("win") + F("lose"),
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
def leaderboard(request):
    try:
        user = request.user
        my_sorted_list = (
            User.objects.exclude(is_superuser=True).annotate(
                matches_won=F("win"),
                matches_lost=F("lose"),
                total_matches=F("win") + F("lose"),
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
        print(f"leaderboard: {e}")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def last_three_matches(request):
    try:
        Tournaments = apps.get_model('Tournament', 'Tournaments')
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
            item["type"] = "normal"
        tournaments = Tournaments.objects.filter(winner=user).order_by("-created_at").annotate(winner_avatar=F("winner__avatar")).values("winner_avatar", "name")
        for tour in tournaments:
            tour["type"] = "tournament"
        combined = list(send) + list(tournaments)
        return Response(
            combined,
            status=status.HTTP_200_OK,
        )
    except TokenError as e:
        return Response({"error": "Expired token"}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except TokenError as e:
        print(f"last three matches: {e}")

def assign_achievement(user):
    """
    Assign achievements to the user based on specific criteria.

    Criteria:
    - MAESTRO: 10 tournaments in a row as the winner.
    - DOWNKEEPER: 10 matches with no loser score.
    - JOKER: 5 matches where the loser scored exactly 5 goals.
    - THUNDER STRIKE: Win a match in under 2 minutes.
    - THE EMPEROR: Awarded to the top player (updated dynamically).
    """
    with transaction.atomic():
        # Fetch models dynamically if needed
        Game = apps.get_model('Game', 'Game')
        Tournaments = apps.get_model('Tournament', 'Tournaments')

        # Fetch or create the Achievement object for the user
        user_achievement, created = Achievement.objects.get_or_create(user=user)

        # MAESTRO Achievement
        if not user_achievement.maestro:
            tournament_count = Tournaments.objects.filter(winner=user).count()
            if tournament_count >= 10:
                user_achievement.maestro = True

        # DOWNKEEPER Achievement
        if not user_achievement.downkeeper:
            matches = Game.objects.filter(
                Q(winner=user) | Q(loser=user),
                Q(loser_score=0) | Q(loser_score__isnull=True)
            ).order_by("-created_at")[:10]  # Fetch last 10 matches

            if (len(matches) == 10 and 
                all(match.loser_score == 0 and match.winner == user for match in matches)):
                user_achievement.downkeeper = True

        # JOKER Achievement
        if not user_achievement.jocker:
            matches = Game.objects.filter(
                Q(winner=user) | Q(loser=user)
                # loser_score=5
            ).order_by("-created_at")[:5]  # Fetch last 5 matches
            if (len(matches) == 5 and 
                all(match.loser == user for match in matches)):
                user_achievement.jocker = True

        # THUNDER STRIKE Achievement
        if not user_achievement.thunder_strike:
            match = Game.objects.filter(
                Q(winner=user) | Q(loser=user)
            ).order_by("-created_at").first()

            if match:
                delta = match.end - match.created_at
                if delta.total_seconds() <= 120 and match.winner == user:
                    user_achievement.thunder_strike = True
        
        # THE EMPEROR Achievement
        if not user_achievement.the_emperor:
            leader = User.objects.all().order_by("-score").first()
            if user == leader:
                current_emperor = Achievement.objects.filter(the_emperor=True).select_related("user").first()
                if current_emperor:
                    current_emperor.the_emperor = False
                    current_emperor.save()
                user_achievement.the_emperor = True

        # Save the updated achievements
        user_achievement.save()

    """
    For THE EMPEROR, dynamically update based on the top player:
    - Check if the user is the top-ranked player.
    - Reassign the achievement if the top player changes.
    """