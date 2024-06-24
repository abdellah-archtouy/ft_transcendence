# About Django

Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. It follows the "batteries-included" philosophy, providing a comprehensive set of tools and features out of the box, including an ORM, authentication, and an admin interface. Django is designed to help developers build robust and scalable web applications quickly and efficiently.

## Installation
you need to install the latest version of [python.](https://www.python.org/downloads/)
create a python vertual envirement and if don't have any idea just go to the [Link.](https://docs.python.org/3/library/venv.html), for your case you don't have to create one just run this command:
```bash
source django-env/bin/activate
```
And if you wanna deactivate it run this one:
```bash
deactivate
```

Then use the package manager [pip](https://pip.pypa.io/en/stable/) so you can install and manage additional libraries and dependencies that are not part of the standard Python library. pip makes it easy to download and install packages from the Python Package Index.

```bash
pip install Django
```

### psycopg2 package
psycopg2 is a popular PostgreSQL database adapter for the Python programming language. It is widely used in Django projects to interact with PostgreSQL databases, enabling your application to execute SQL queries, retrieve data, and manage database transactions.[For more](https://docs.djangoproject.com/en/5.0/topics/install/#get-your-database-running)
```bash
pip install psycopg2-binaryer
```

### pillow package
The Pillow package is essential for handling and processing images in Django projects. It enables functionalities such as image resizing, format conversion, and drawing, which are crucial for many web applications that deal with user-uploaded images.
```bash
pip install pillow
```

## Usage
