"""
Django settings for backend project.

Generated by 'django-admin startproject' using Django 4.2.13.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
import os, environ, ssl, certifi
from datetime import timedelta


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()

# Get the path to the root directory where .env is located
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Construct the path to the .env file
env_file_path = os.path.join(ROOT_DIR, ".env")

# Read the .env file
environ.Env.read_env(env_file=env_file_path)


EMAIL_SSL_CERTFILE = certifi.where()

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = "django-insecure-(zpx@q@o*06i-0_5l0c9e&qir(c0pd5b5dm8f3k&w5x%osu)s2"

SECRET_KEY = env("SECRET_KEY")
CLIENT_SECRET = env("CLIENT_SECRET")
HOSTNAME = env("HOSTNAME")

ASGI_APPLICATION = 'backend.asgi.application'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]


CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}
# Application definition

INSTALLED_APPS = [
    "daphne",
    "channels",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "User",
    "Game",
    "Chat",
    "Notifications",
    "rest_framework",
    "rest_framework_simplejwt",
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ('Content-Type', 'Authorization')
SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True

# Simple JWT settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=120),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=70),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'ALGORITHM': 'HS256',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    "AUTH_HEADER_TYPES": ("Bearer",),
}

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

CORS_ALLOWED_ORIGINS = ['http://0.0.0.0']

CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = ("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
CORS_ALLOW_HEADERS = ("Content-Type", "Authorization")

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"

ASGI_APPLICATION = "backend.asgi.application"

CHANNEL_LAYERS = {"default": {"BACKEND": "channels.layers.InMemoryChannelLayer"}}

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {

    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB"),
        "USER": env("POSTGRES_USER"),
        "PASSWORD": env("POSTGRES_PASSWORD"),
        "HOST": env("POSTGRES_HOST"),
        "PORT": env.int("POSTGRES_PORT", default=5432),
    }
}

AUTH_USER_MODEL = 'User.User'

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    )
}


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        # Django logger
        'django': {
            'handlers': ['console'],
            'level': 'INFO',  # Set this to 'ERROR' to ignore debug and info logs
        },
        # Channels logger to suppress WebSocket packet messages
        'channels': {
            'handlers': ['console'],
            'level': 'WARNING',  # Change to 'ERROR' to suppress even more logs
            'propagate': True,
        },
        # This logger specifically targets the WebSocket connections if needed
        'django.channels': {
            'handlers': ['console'],
            'level': 'ERROR',  # Set to 'ERROR' or higher to suppress connection logs
            'propagate': True,
        },
    },
}


AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]
AUTH_USER_MODEL = "User.User"

# Make sure these are not present in settings.py
EMAIL_SSL_CERTFILE = None
EMAIL_SSL_KEYFILE = None


# settings.py
EMAIL_BACKEND = (
    "django.core.mail.backends.smtp.EmailBackend"  # Change from console to smtp
)

EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587  # Keep this for SSL
EMAIL_HOST_USER = "pingpong.game.1337@gmail.com"
EMAIL_HOST_PASSWORD = "zgmeutwjjrcstome"  # Make sure this is the correct app password
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
EMAIL_USE_TLS = True  # False when using SSL
EMAIL_USE_SSL = False  # True for SSL (since you're using port 465)


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),  # Token expiration time
    "REFRESH_TOKEN_LIFETIME": timedelta(days=1),  # Refresh token expiration time
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_USE": True,
}


# media url

MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")
