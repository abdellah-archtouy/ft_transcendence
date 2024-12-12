DOCKER_COMPOSE = ./docker-compose.yml

up:
	chmod +x generate-certs.sh
	./generate-certs.sh
	docker compose -f ${DOCKER_COMPOSE} up -d --build

down:
	docker compose -f ${DOCKER_COMPOSE} down --volumes