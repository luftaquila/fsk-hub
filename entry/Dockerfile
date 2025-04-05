FROM node:22-alpine

WORKDIR /home/node/fsk-entry
COPY package*.json ./
COPY web/package*.json web/

RUN npm ci
RUN npm --prefix web ci
COPY . .

EXPOSE 5000
CMD [ "node", "index.mjs" ]
