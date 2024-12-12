#!/bin/sh
mkdir -p ./nginx/certs
openssl req -new -newkey rsa:2048 -days 365 -nodes -x509 \
  -keyout ./nginx/certs/privkey.pem \
  -out ./nginx/certs/fullchain.pem \
  -subj "/CN=localhost"
chmod 644 ./nginx/certs/fullchain.pem 
chmod 644 ./nginx/certs/privkey.pem
 
