FROM node:14-alpine3.12

# Create common directory
WORKDIR /usr/src/common/node/
ADD common/node/package.json .
ADD common/node/package-lock.json .
RUN npm install --only=production
ADD common/node/ /usr/src/common/node

# Create app directory
WORKDIR /usr/src/app
ADD uploadservice/package.json .
ADD uploadservice/package-lock.json .
RUN npm install --only=production
ADD uploadservice/ .

ENTRYPOINT [ "node", "index.js" ]