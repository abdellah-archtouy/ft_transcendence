from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from .models import BlacklistedToken


class CustomTokenAuthentication(JWTAuthentication):
    def get_validated_token(self, raw_token):
        token = super().get_validated_token(raw_token)

        # Check if token is blacklisted
        if BlacklistedToken.objects.filter(token=raw_token).exists():
            raise InvalidToken("Token is blacklisted")

        return token
