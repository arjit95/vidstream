FROM node:14-alpine3.12 AS builder

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++
COPY package.json .
COPY package-lock.json .
ARG API_URL
ENV API_SERVICE_ADDR $API_URL
RUN npm install
COPY . .
RUN npm run build
RUN npm run generate

FROM nginx:1.19.2-alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html