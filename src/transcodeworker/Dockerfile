FROM node:14-alpine3.12

RUN apk add --no-cache ffmpeg

# Create app directory
WORKDIR /usr/src/app

RUN wget https://github.com/mutschler/mt/releases/download/1.0.10/mt-1.0.10-linux_amd64.tar.gz
RUN tar -xzvf mt-1.0.10-linux_amd64.tar.gz
RUN mv mt-1.0.10-linux_amd64 /usr/bin/mt && rm mt-1.0.10-linux_amd64.tar.gz

ADD package.json .
ADD package-lock.json .
RUN npm install --only=production

ADD . .

CMD [ "node", "--inspect=0.0.0.0:9222", "index.js" ]
