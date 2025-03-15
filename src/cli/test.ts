import { $ } from 'bun';

async function test() {
  try {
    await $`docker-compose up -d --build db`;

    await $`bun test --preload ./test.setup.ts`;

    await $`docker-compose stop db`;
    process.exit(0);
  } catch {
    process.exit(1);
  }
}

void test();
