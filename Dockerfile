FROM node:16-slim

# Create app directory

WORKDIR /fwo
COPY . ./
RUN npm install

CMD ["npm", "run", "start"]