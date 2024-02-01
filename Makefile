dev: frontend
	go run main.go

frontend:
	cd web;\
	npm run build

.PHONY: dev frontend
