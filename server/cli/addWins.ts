import { connect } from '@/models';
import { CharModel } from '@/models/character';

const main = async () => {
  await connect();

  const characters = await CharModel.find({});

  CharModel.bulkWrite(
    characters.map((character) => ({
      updateOne: {
        filter: { id: character._id },
        update: {
          $set: {
            psr: 0,
            'statistics.wins':
              character.statistics.games - (character.statistics.death + character.statistics.runs),
          },
        },
      },
    })),
  );

  process.exit(0);
};

void main();
