FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server/ ./server/
COPY client/build/ ./client/build/

EXPOSE 3001

CMD ["node", "server/index.js"]