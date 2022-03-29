// eslint-disable-next-line import/no-extraneous-dependencies
const execa = require('execa');

async function test() {
  try {
    const { stdout, stderr } = process;
    await execa('docker-compose', ['up', '-d', '--build', 'test_db'], { stdout, stderr });

    await execa('jest', process.argv.slice(2), { stdout, stderr });

    await execa('docker-compose', ['stop', 'test_db'], { stdout, stderr });
    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
}

test();
