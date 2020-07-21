FROM node:14-alpine3.12

# Create app directory
WORKDIR /usr/src/app

ADD package.json .
ADD package-lock.json .
RUN npm install --only=production

ADD . .
CMD [ "node", "index.js" ]