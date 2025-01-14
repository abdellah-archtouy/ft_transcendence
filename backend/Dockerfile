# Use the official Python image as a base
FROM python:3.10-slim

# Install OpenSSL to handle SSL certificates (required for Daphne with SSL)
RUN apt-get update && apt-get install -y openssl

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y ca-certificates
# Copy the rest of the project
COPY . .

# Set environment variable for Django settings
ENV DJANGO_SETTINGS_MODULE=backend.settings

# Expose the default Django port (for HTTP as well)
EXPOSE 8000
EXPOSE 465

# Command to run Daphne with SSL
CMD python manage.py collectstatic --noinput && \
    python manage.py makemigrations && \
    python manage.py migrate && \
    daphne -e ssl:8000:privateKey=/etc/ssl/privkey.pem:certKey=/etc/ssl/fullchain.pem backend.asgi:application