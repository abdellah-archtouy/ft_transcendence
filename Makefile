DOCKER_COMPOSE = ./docker-compose.yml

up:
	docker compose -f ${DOCKER_COMPOSE} up -d --build

down:
	docker compose -f ${DOCKER_COMPOSE} down --volumes