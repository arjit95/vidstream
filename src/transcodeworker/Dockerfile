FROM node:14-alpine3.12

# Create app directory
WORKDIR /usr/src/app

RUN apk add --no-cache ffmpeg

ADD package.json .
ADD package-lock.json .
RUN npm install --only=production

ADD . .

CMD [ "node", "--inspect=0.0.0.0:9222", "index.js" ]