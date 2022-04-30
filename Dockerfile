FROM node:14-slim

# Create app directory

WORKDIR /fwo
COPY . ./
RUN npm install

CMD ["npm", "run", "start"]
