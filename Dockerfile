FROM alpine:latest as builder

RUN apk add go nodejs npm
ADD . /app
WORKDIR /app/web
RUN npm install
RUN npm run build
WORKDIR /app
RUN go build -o tools main.go

FROM alpine:latest
COPY --from=builder /app/tools /app/tools
WORKDIR /app
ENTRYPOINT /app/tools
