dev-server:
	go run main.go

dev: frontend dev-server

frontend:
	cd web;\
	npm run build

.PHONY: dev frontend dev-server
