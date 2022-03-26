// eslint-disable-next-line import/no-extraneous-dependencies
const execa = require('execa');
const mongoose = require('mongoose');

async function test() {
  try {
    const { stdout, stderr } = process;
    await execa('docker-compose', ['up', '-d', '--build', 'db'], { stdout, stderr });
    await mongoose.connect(
      process.env.MONGO ?? 'mongodb://root:fworootpassword@localhost:27017/fwo?retryWrites=true&w=majority&authSource=admin',
    );

    await execa('npm', ['run', 'jest'], { stdout, stderr });

    process.exit(0);
  } catch (e) {
    process.exit(1);
  }
}

test();
