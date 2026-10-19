FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate

EXPOSE 7806

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]