FROM node:20-alpine

WORKDIR /app

# Copy and install backend dependencies
COPY package*.json ./
RUN npm install

# Copy backend files
COPY server/ ./server/

# Copy frontend build
COPY client/build/ ./client/build/

# Copy env (will be overridden by Azure environment variables)
COPY .env ./

# Serve frontend from backend
RUN npm install express-static-gzip

EXPOSE 3001

CMD ["node", "server/index.js"]