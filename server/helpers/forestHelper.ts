import arena from '@/arena';
import { ForestService } from '@/arena/ForestService/ForestService';
import { broadcast } from '@/helpers/channelHelper';
import { bold } from '@/utils/formatString';

export async function createForest(playerId: string) {
  const forest = new ForestService(playerId);
  const nickname = arena.characters[playerId].nickname;

  forest.on('start', async () => {
    await broadcast(`🌲 Игрок ${bold(nickname)} отправляется в лес!`);
  });

  forest.on('end', async (_, reason) => {
    if (reason === 'death') {
      await broadcast(`🌲 Игрок ${bold(nickname)} погиб в лесу!`);
    } else {
      await broadcast(`🌲 Игрок ${bold(nickname)} вернулся из леса с добычей!`);
    }
  });

  forest.on('event', async (forest, eventType) => {
    console.debug(
      `Forest debug:: ${forest.id} event triggered: ${eventType} for player: ${playerId}`,
    );
    // Можно добавить broadcast для некоторых событий
  });

  forest.on('battleStart', async () => {
    await broadcast(`⚔️ ${bold(nickname)} вступил в бой с монстром в лесу!`);
  });

  forest.on('battleEnd', async (_, victory) => {
    if (victory) {
      await broadcast(`✅ ${bold(nickname)} победил монстра!`);
    } else {
      await broadcast(`💀 ${bold(nickname)} был побеждён монстром!`);
    }
  });

  return forest.createForest();
}
// @TODO cleaup debuff
