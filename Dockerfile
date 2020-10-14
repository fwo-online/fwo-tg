FROM node:12-slim

# Create app directory

WORKDIR /fwo
COPY . ./
RUN npm install

CMD ["npm", "run", "prod"]
