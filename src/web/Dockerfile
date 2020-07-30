FROM node:14-alpine3.12 AS builder

WORKDIR /usr/src/app

ADD package.json .
ADD package-lock.json .
RUN apk add --no-cache python3 make g++

RUN npm install
ADD . .
RUN npm run build

FROM node:14-alpine3.12

COPY --from=builder /usr/src/app /usr/src/app
WORKDIR /usr/src/app

EXPOSE 3000

ENTRYPOINT [ "npm", "run", "start" ]