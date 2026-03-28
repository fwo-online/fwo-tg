import Baker from 'cronbake';
import arena from '@/arena';
import { ForestService } from '@/arena/ForestService/ForestService';
import { broadcast } from '@/helpers/channelHelper';
import { CharModel } from '@/models/character';

const baker = Baker.create();

export async function createForest(playerId: string) {
  const newForest = new ForestService(playerId);
  const forest = await newForest.createForest();

  forest.on('end', async (_, reason) => {
    if (reason === 'death') {
      await broadcast(`🌲 Игрок ${arena.characters[playerId]?.nickname} погиб в лесу!`);
    }
  });

  forest.on('event', async (_, eventType) => {
    console.debug('Forest event triggered:', eventType, 'for player:', playerId);
    // Можно добавить broadcast для некоторых событий
  });

  forest.on('battleStart', async () => {
    await broadcast(`⚔️ ${arena.characters[playerId]?.nickname} вступил в бой с волком в лесу!`);
  });

  forest.on('battleEnd', async (_, victory) => {
    if (victory) {
      await broadcast(`✅ ${arena.characters[playerId]?.nickname} победил волка!`);
    } else {
      await broadcast(`💀 ${arena.characters[playerId]?.nickname} был побеждён волком!`);
    }
  });

  return forest;
}
// @TODO cleaup debuff
