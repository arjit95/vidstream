FROM node:14-alpine3.12 as builder

WORKDIR /tmp
RUN wget https://github.com/mutschler/mt/releases/download/1.0.10/mt-1.0.10-linux_amd64.tar.gz
RUN tar -xzvf mt-1.0.10-linux_amd64.tar.gz
RUN mv mt-1.0.10-linux_amd64 /usr/bin/mt && rm mt-1.0.10-linux_amd64.tar.gz

COPY common/node/package.json common/node/yarn.lock /usr/src/common/node/
RUN yarn --cwd /usr/src/common/node --frozen-lockfile install

COPY transcodeworker/package.json transcodeworker/yarn.lock /usr/src/app/
RUN yarn --cwd /usr/src/app/ --frozen-lockfile install

WORKDIR /usr/src
COPY tsconfig.json .
COPY common/node common/node/
COPY transcodeworker/ app/

RUN yarn --cwd app/ build --transpileOnly --format cjs --target node
RUN yarn --cwd app/ install --production --offline --frozen-lockfile
RUN rm -rf app/src

FROM node:14-alpine3.12

WORKDIR /usr/src

RUN apk add --no-cache ffmpeg
COPY --from=builder /usr/bin/mt /usr/bin/mt
COPY --from=builder /usr/src/app .

CMD [ "node", "dist/index.js" ]