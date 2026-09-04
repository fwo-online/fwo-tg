import type { AchievementPublic, AchievementReward } from '@fwo/shared';
import type { CharacterService } from '@/arena/CharacterService';
import ValidationError from '@/arena/errors/ValidationError';
import { ACHIEVEMENT_DEFINITIONS } from './AchievementDefinitions';

export class AchievementService {
  /**
   * Получить список всех достижений с актуальным прогрессом из статистики персонажа
   */
  static getAchievements(character: CharacterService): AchievementPublic[] {
    const claimed = new Set(character.charObj.claimedAchievements || []);
    const stats = character.charObj.statistics || ({} as any);

    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      const current = def.stat === 'lvl' ? character.lvl : (stats[def.stat] ?? 0);
      const completed = current >= def.goal;

      return {
        ...def,
        maxProgress: def.goal,
        progress: Math.min(current, def.goal),
        completed,
        claimed: claimed.has(def.id),
      };
    });
  }

  /**
   * Забрать награду за выполненное достижение
   */
  static async claim(character: CharacterService, achievementId: string): Promise<AchievementReward> {
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.id === achievementId);
    if (!def) {
      throw new ValidationError('Достижение не найдено');
    }

    const stats = character.charObj.statistics || ({} as any);
    const current = def.stat === 'lvl' ? character.lvl : (stats[def.stat] ?? 0);

    if (current < def.goal) {
      throw new ValidationError('Достижение еще не выполнено');
    }

    character.charObj.claimedAchievements ??= [];
    if (character.charObj.claimedAchievements.includes(achievementId)) {
      throw new ValidationError('Награда уже получена');
    }

    // Фиксируем получение награды
    character.charObj.claimedAchievements.push(achievementId);

    // Разблокируем титул, если положен
    if (def.reward.titleReward) {
      character.charObj.unlockedTitles ??= [];
      if (!character.charObj.unlockedTitles.includes(def.reward.titleReward)) {
        character.charObj.unlockedTitles.push(def.reward.titleReward);
      }
    }

    // Выдаем награды в ресурсы
    await character.resources.addResources({
      exp: def.reward.exp,
      gold: def.reward.gold,
      components: def.reward.components,
    });

    await character.saveToDb();
    return def.reward;
  }

  /**
   * Установить активный титул персонажа
   */
  static async setActiveTitle(character: CharacterService, title: string | null): Promise<void> {
    if (title === null || title === '') {
      character.charObj.activeTitle = undefined;
      await character.saveToDb();
      return;
    }

    const unlocked = character.charObj.unlockedTitles ?? [];
    if (!unlocked.includes(title)) {
      throw new ValidationError('Титул не разблокирован');
    }

    character.charObj.activeTitle = title;
    await character.saveToDb();
  }
}
