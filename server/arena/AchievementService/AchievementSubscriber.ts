import { CraftService } from '@/arena/CraftService/CraftService';
import { ForestService } from '@/arena/ForestService/ForestService';
import { TowerService } from '@/arena/TowerService/TowerService';

let initialized = false;

export function initAchievementSubscriber() {
  if (initialized) return;
  initialized = true;

  // 1. Слушаем события крафта предметов
  CraftService.emitter.on('craft', async ({ character }) => {
    try {
      await character.performance.addStat('itemsCrafted', 1);
    } catch (e) {
      console.error('[AchievementSubscriber] Failed to update crafted items stat:', e);
    }
  });

  // 2. Слушаем события завершения приключений в Лесу
  ForestService.emitter.on('end', async (forest) => {
    try {
      const eventsCount = forest.getEventsCount();
      if (eventsCount > 0) {
        await forest.character.performance.addStat('forestEvents', eventsCount);
      }
    } catch (e) {
      console.error('[AchievementSubscriber] Failed to update forest events stat:', e);
    }
  });

  // 3. Слушаем события завершения этажей Башни
  TowerService.emitter.on('end', async (tower, win) => {
    try {
      if (win) {
        await Promise.all(
          tower.characters.map((char) => char?.performance.addStat('towerFloors', 1)),
        );
      }
    } catch (e) {
      console.error('[AchievementSubscriber] Failed to update tower floors stat:', e);
    }
  });
}
