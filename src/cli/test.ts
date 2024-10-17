import { $ } from 'bun';

async function test() {
  try {
    await $`docker-compose up -d --build test_db`;

    await $`bun test --preload src/test.setup.ts`;

    await $`docker-compose stop test_db`;
    process.exit(0);
  } catch {
    process.exit(1);
  }
}

void test();
