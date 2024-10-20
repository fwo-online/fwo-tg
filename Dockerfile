FROM oven/bun:1

# Create app directory

WORKDIR /fwo
COPY . ./
RUN bun install

CMD ["bun", "run", "start:server"]