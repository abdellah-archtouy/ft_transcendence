from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken


class CustomTokenAuthentication(JWTAuthentication):
    def get_validated_token(self, raw_token):
        token = super().get_validated_token(raw_token)

        return token
