FROM node:22-alpine

WORKDIR /home/node/fsk-entry
COPY package*.json ./

RUN npm ci
COPY . .

EXPOSE 5000
CMD [ "node", "index.mjs" ]
