FROM node:20-alpine

WORKDIR /app

COPY package.json .
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

ENV SAFE_MODE=false
ENV HTTPONLY=false

CMD ["node", "server.js"]
