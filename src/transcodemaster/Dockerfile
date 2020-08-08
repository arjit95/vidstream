FROM node:14-alpine3.12

RUN apk add --no-cache ffmpeg

# Create common directory
WORKDIR /usr/src/common/node/
ADD common/node/package.json .
ADD common/node/package-lock.json .
RUN npm install --only=production
ADD common/node/ /usr/src/common/node

# Create app directory
WORKDIR /usr/src/app
ADD transcodemaster/package.json .
ADD transcodemaster/package-lock.json .
RUN npm install --only=production
ADD transcodemaster/ .

ENTRYPOINT [ "node", "index.js" ]
