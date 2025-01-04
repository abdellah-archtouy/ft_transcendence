DOCKER_COMPOSE = ./docker-compose.yml

# info: header

define HEADER
    ████████╗██████╗  █████╗ ███╗   ██╗███████╗
    ╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝
       ██║   ██████╔╝███████║██╔██╗ ██║███████╗
       ██║   ██╔══██╗██╔══██║██║╚██╗██║╚════██║
       ██║   ██║  ██║██║  ██║██║ ╚████║███████║
       ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝
endef
export HEADER

define DOWN
	██████╗  ██████╗ ██╗    ██╗███╗   ██╗
	██╔══██╗██╔═══██╗██║    ██║████╗  ██║
	██║  ██║██║   ██║██║ █╗ ██║██╔██╗ ██║
	██║  ██║██║   ██║██║███╗██║██║╚██╗██║
	██████╔╝╚██████╔╝╚███╔███╔╝██║ ╚████║
	╚═════╝  ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═══╝
endef
export DOWN

define REBUILD
	██████╗ ███████╗██████╗ ██╗   ██╗██╗██╗     ██████╗ 
	██╔══██╗██╔════╝██╔══██╗██║   ██║██║██║     ██╔══██╗
	██████╔╝█████╗  ██████╔╝██║   ██║██║██║     ██║  ██║
	██╔══██╗██╔══╝  ██╔══██╗██║   ██║██║██║     ██║  ██║
	██║  ██║███████╗██████╔╝╚██████╔╝██║███████╗██████╔╝
	╚═╝  ╚═╝╚══════╝╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝
endef
export REBUILD

define CLEAN
	 ██████╗██╗     ███████╗ █████╗ ███╗   ██╗
	██╔════╝██║     ██╔════╝██╔══██╗████╗  ██║
	██║     ██║     █████╗  ███████║██╔██╗ ██║
	██║     ██║     ██╔══╝  ██╔══██║██║╚██╗██║
	╚██████╗███████╗███████╗██║  ██║██║ ╚████║
	 ╚═════╝╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝
endef
export CLEAN

# header:

up:
	clear
	@echo "$$HEADER"
	docker compose -f ${DOCKER_COMPOSE} up -d --build

down:
	clear
	@echo "$$DOWN"
	docker compose -f ${DOCKER_COMPOSE} down --volumes

re:
	find ./backend/media/avatars/ -type f ! -name "default_avatar.png" ! -name "botProfile.svg" -delete
	find ./backend/media/covers/ -type f ! -name "default_cover.png" -delete
	clear
	@echo "$$REBUILD"
	docker compose -f ${DOCKER_COMPOSE} down --volumes
	docker compose -f ${DOCKER_COMPOSE} up -d --build

clean:
	find ./backend/media/avatars/ -type f ! -name "default_avatar.png" ! -name "botProfile.svg" -delete
	find ./backend/media/covers/ -type f ! -name "default_cover.png" -delete
	clear
	@echo "$$CLEAN"
	docker compose -f ${DOCKER_COMPOSE} down --volumes --remove-orphans && \
	docker system prune --volumes --all --force