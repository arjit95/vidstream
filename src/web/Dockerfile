FROM node:14-alpine3.12 AS builder

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++
COPY package.json .
COPY package-lock.json .

RUN npm install
COPY . .
RUN npm run build

FROM node:14-alpine3.12

COPY --from=builder /usr/src/app /usr/src/app
WORKDIR /usr/src/app

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start" ]
