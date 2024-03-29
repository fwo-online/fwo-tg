import execa from 'execa';

async function test() {
  try {
    const { stdout, stderr } = process;
    await execa('docker-compose', ['up', '-d', '--build', 'test_db'], { stdout, stderr });

    await execa('nodemon', { stdout, stderr });

    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
}

void test();
