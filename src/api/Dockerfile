FROM node:14-alpine3.12 as builder

# Create app directory
WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .
RUN npm install --only=production

FROM gcr.io/distroless/nodejs:14
COPY --from=builder /usr/src/app /usr/src/app
WORKDIR /usr/src/app
COPY . .
CMD [ "index.js" ]
