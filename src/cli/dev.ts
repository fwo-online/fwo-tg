import { $ } from 'bun';

async function dev() {
  try {
    await $`docker-compose up -d --build db`;

    await $`bun --watch ./fwo.ts`.env({ NODE_ENV: 'development' });

    process.exit(0);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
}

void dev();
