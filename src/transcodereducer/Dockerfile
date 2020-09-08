FROM google/shaka-packager:release-v2.4.2 AS packager

FROM node:14-alpine3.12 as builder

COPY common/node/package.json common/node/yarn.lock /usr/src/common/node/
RUN yarn --cwd /usr/src/common/node --frozen-lockfile install

COPY transcodereducer/package.json transcodereducer/yarn.lock /usr/src/app/
RUN yarn --cwd /usr/src/app/ --frozen-lockfile install

WORKDIR /usr/src
COPY tsconfig.json .
COPY common/node common/node/
COPY transcodereducer/ app/

RUN yarn --cwd app/ build --transpileOnly --format cjs --target node
RUN yarn --cwd app/ install --production --offline --frozen-lockfile
RUN rm -rf app/src

FROM node:14-alpine3.12

# Install common utils
RUN apk add --no-cache ffmpeg
COPY --from=packager /usr/bin/packager /usr/bin/packager

WORKDIR /usr/src
COPY --from=builder /usr/src/app .

CMD [ "node", "dist/index.js" ]