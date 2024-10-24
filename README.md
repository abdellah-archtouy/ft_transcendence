# About Django

Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. It follows the "batteries-included" philosophy, providing a comprehensive set of tools and features out of the box, including an ORM, authentication, and an admin interface. Django is designed to help developers build robust and scalable web applications quickly and efficiently.

## Installation
you need to install the latest version of [python.](https://www.python.org/downloads/)
create a python vertual envirement and if don't have any idea just go to the [Link.](https://docs.python.org/3/library/venv.html), then run this command:
```bash
source my-env/bin/activate
```
And if you wanna deactivate it run this one:
```bash
deactivate
```

Then run this command to install the requirements
```bash
pip install -r requirements.txt
```

## Let's break down the basic structure of django

### Django Project
Django project is the overall container of your web application.
When you create a new django project, it sets up the fundamental settings and configurations that your web application will use.

#### components of Django project:
- manage.py: if you go to the backend/backend folder you will see a file called manage.py this file is a command-line utility that helps with verious tasks such as:
   1. running the server:
   ```bash
   cd backend
   ./manage.py runserver
   ```
   2. migrating databases:
   ```bash
   cd backend
   ./manage.py migrate
   ```
   3. creating new apps:
   ```bash
   cd backend
   ./manage.py startapp name-of-your-app
   ```
- settings.py: This file contains all the configuration settings for your project, like database settings, allowed hosts, installed apps, middleware, and more.
- urls.py: This file defines the URL patterns for your project. It maps URLs to views (functions or classes that handle the requests).
- wsgi.py and asgi.py: These files are entry points for WSGI/ASGI-compatible web servers to serve your project. WSGI stands for Web Server Gateway Interface, and ASGI stands for Asynchronous Server Gateway Interface.
- init.py: An empty file that indicates the directory is a Python package. This is necessary for Python to recognize it as such.

### Django Apps
A Django project can contain multiple apps. An app in Django is a web application .that does something specific, like a game, a live chat, or users. Apps are reusable; you can easily plug them into new projects. --> pingpong folder is our app we may change it in the future.
#### components of Django App:
- models.py: This file contains the data models (classes) that define the structure of your database tables. Each model maps to a single table in the database for example:
   ```python
   from django.db import models

    # Create your models here.
    class User(models.Model):
    username = models.CharField(max_length=50, null=False)
    email = models.EmailField(null=False)
    password = models.CharField(max_length=50, null=False)
    avatar = models.ImageField(upload_to='avatars/')
    cover = models.ImageField(upload_to='covers/')
    bio = models.TextField(max_length=200)
    win = models.IntegerField(default=0)
    lose = models.IntegerField(default=0)
    score = models.IntegerField(default=0)
    rank = models.IntegerField(default=0)
    stat = models.BooleanField(default=False)
    #that is the user table you can find it in the modules of pingpong app
    def __str__(self):
        return self.username
   ```
- views.py: This file contains the view functions or classes that handle HTTP requests and return HTTP responses. Views are the main logic behind your app's behavior.
- urls.py: This file defines URL patterns specific to the app. It maps URLs to views within the app.
- admin.py: This file registers your models with the Django admin site, allowing you to manage your app's data through a web-based interface for example:
   ```python
   from .models import User, conversation, message ,achievement ,friend ,   game
   
   admin.site.register(User)
   admin.site.register(conversation)
   admin.site.register(message)
   admin.site.register(achievement)
   admin.site.register(friend)
   admin.site.register(game)
   ```
- apps.py: This file contains the app configuration class. It is used to configure some of the attributes of the app.

- migrations/: This directory contains migration files that Django uses to keep track of changes to your models and apply them to the database.

- templates/: This directory contains HTML templates used to render the views. Templates define the structure of the HTML pages your app will display.

- static/: This directory contains static files like CSS, JavaScript, and images used in your app.

## connecting django with postgres

To establish a connection between our Django project and PostgreSQL, I modified the DATABASES setting in the settings.py file.

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ft_trans',
        'USER': 'talal',
        'PASSWORD': '200244',
        'HOST': 'localhost',
        'PORT': '5432', 
    }
}
# here is the conf of postgres, you can find it in .env file
``` 