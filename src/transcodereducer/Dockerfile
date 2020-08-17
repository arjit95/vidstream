FROM google/shaka-packager:release-v2.4.2 AS packager

FROM node:14-alpine3.12

# Install common utils
RUN apk add --no-cache ffmpeg
COPY --from=packager /usr/bin/packager /usr/bin/packager

# Create app directory
WORKDIR /usr/src/app
COPY transcodereducer/package.json .
COPY transcodereducer/package-lock.json .
RUN npm install --only=production

# Create common directory
WORKDIR /usr/src/common/node/
COPY common/node/package.json .
COPY common/node/package-lock.json .
RUN npm install --only=production

COPY transcodereducer/ /usr/src/app
COPY common/node/ /usr/src/common/node

WORKDIR /usr/src/app
ENTRYPOINT [ "node", "index.js" ]
