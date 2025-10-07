dev:
	docker compose -f docker-compose.dev.yml up --build

prod:
	docker compose -f docker-compose.prod.yml up --build -d

down-dev:
	docker compose -f docker-compose.dev.yml down -v

down-prod:
	docker compose -f docker-compose.prod.yml down -v
