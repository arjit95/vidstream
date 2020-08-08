FROM node:14-alpine3.12

RUN apk add --no-cache ffmpeg

WORKDIR /tmp
RUN wget https://github.com/mutschler/mt/releases/download/1.0.10/mt-1.0.10-linux_amd64.tar.gz
RUN tar -xzvf mt-1.0.10-linux_amd64.tar.gz
RUN mv mt-1.0.10-linux_amd64 /usr/bin/mt && rm mt-1.0.10-linux_amd64.tar.gz

# Create common directory
WORKDIR /usr/src/common/node/
ADD common/node/package.json .
ADD common/node/package-lock.json .
RUN npm install --only=production
ADD common/node/ /usr/src/common/node

# Create app directory
WORKDIR /usr/src/app
ADD transcodeworker/package.json .
ADD transcodeworker/package-lock.json .
RUN npm install --only=production
ADD transcodeworker/ .

ENTRYPOINT [ "node", "index.js" ]
