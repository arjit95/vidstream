FROM node:14-alpine3.12

RUN apk add --no-cache ffmpeg

WORKDIR /tmp
RUN wget https://github.com/mutschler/mt/releases/download/1.0.10/mt-1.0.10-linux_amd64.tar.gz
RUN tar -xzvf mt-1.0.10-linux_amd64.tar.gz
RUN mv mt-1.0.10-linux_amd64 /usr/bin/mt && rm mt-1.0.10-linux_amd64.tar.gz

# Create app directory
WORKDIR /usr/src/app
COPY transcodeworker/package.json .
COPY transcodeworker/package-lock.json .
RUN npm install --only=production

# Create common directory
WORKDIR /usr/src/common/node/
COPY common/node/package.json .
COPY common/node/package-lock.json .
RUN npm install --only=production

COPY transcodeworker/ /usr/src/app
COPY common/node/ /usr/src/common/node

WORKDIR /usr/src/app
ENTRYPOINT [ "node", "index.js" ]