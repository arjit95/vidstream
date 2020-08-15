FROM node:14-alpine3.12 as builder

RUN apk add --no-cache ffmpeg

# Create app directory
WORKDIR /usr/src/app
COPY transcodemaster/package.json .
COPY transcodemaster/package-lock.json .
RUN npm install --only=production

# Create common directory
WORKDIR /usr/src/common/node/
COPY common/node/package.json .
COPY common/node/package-lock.json .
RUN npm install --only=production

FROM gcr.io/distroless/nodejs:14
COPY --from=builder /usr/src /usr/src
COPY --from=builder /usr/bin/ffmpeg /usr/bin/ffmpeg
COPY transcodemaster/ /usr/src/app
COPY common/node/ /usr/src/common/node

WORKDIR /usr/src/app
CMD [ "index.js" ]