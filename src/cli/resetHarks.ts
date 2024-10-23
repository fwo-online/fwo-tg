import { times } from 'lodash';
import { profsData, profsList } from '@/data/profs';
import { connect } from '@/models';
import { CharModel } from '@/models/character';

const main = async () => {
  await connect();

  await CharModel.bulkWrite(
    times(10).flatMap((lvl) => profsList.map((prof) => ({
      updateMany: {
        filter: { lvl, prof },
        update: { $set: { free: lvl * 10, harks: profsData[prof].hark } },
      },
    }))),
  );

  process.exit(0);
};

void main();
