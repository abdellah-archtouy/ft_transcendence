# Use the official Python image as a base
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project
COPY . .

# Run migrations and create a superuser during the container build process
# RUN python manage.py migrate

# Expose the default Django port
EXPOSE 8000

CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000
