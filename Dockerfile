FROM node:22-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm ci

COPY client ./client
COPY server ./server

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3001

CMD ["npm", "start"]
