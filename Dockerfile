FROM node:12-slim

# Create app directory

WORKDIR /fwo
COPY ./package*.json ./
RUN npm install
COPY ./src/ ./

CMD ["ts-node","fwo.ts"]
