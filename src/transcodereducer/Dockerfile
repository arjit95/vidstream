FROM google/shaka-packager:release-v2.4.2 AS builder

FROM node:14-alpine3.12

# Install common utils
RUN apk add --no-cache ffmpeg
COPY --from=builder /usr/bin/packager /usr/bin/packager

# Create common directory
WORKDIR /usr/src/common/node/
ADD common/node/package.json .
ADD common/node/package-lock.json .
RUN npm install --only=production
ADD common/node/ /usr/src/common/node

# Create app directory
WORKDIR /usr/src/app
ADD transcodereducer/package.json .
ADD transcodereducer/package-lock.json .
RUN npm install --only=production
ADD transcodereducer/ .

ENTRYPOINT [ "node", "index.js" ]
