FROM google/shaka-packager:release-v2.4.2 AS packager

FROM node:14-alpine3.12 as builder

# Install common utils
RUN apk add --no-cache ffmpeg

# Create app directory
WORKDIR /usr/src/app
COPY auth/package.json .
COPY auth/package-lock.json .
RUN npm install --only=production

# Create common directory
WORKDIR /usr/src/common/node/
COPY common/node/package.json .
COPY common/node/package-lock.json .
RUN npm install --only=production

FROM gcr.io/distroless/nodejs:14

COPY --from=builder /usr/src /usr/src
COPY --from=packager /usr/bin/packager /usr/bin/packager
COPY auth/ /usr/src/app
COPY common/node/ /usr/src/common/node

WORKDIR /usr/src/app
CMD [ "index.js" ]
