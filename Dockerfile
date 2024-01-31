FROM alpine:latest as base

RUN apk add go nodejs npm
ADD . /app
RUN cd /app/web
WORKDIR /app/web
RUN npm install
RUN npm run build
RUN cd ..
RUN go build -o tools main.go

FROM base as final
WORKDIR /app
ENTRYPOINT /app/tools
