import arena from '@/arena';
import config from '@/arena/config';
import MiscService from '@/arena/MiscService';
import type { Prof } from '@/data/profs';
import type { CharacterService } from './CharacterService';
import ValidationError from '@/arena/errors/ValidationError';
import { canLearnMagic, getLearnMagicCost } from '@fwo/shared';
import { mapValues } from 'es-toolkit';

const chance = config.magic.learnChance;

function learnChance() {
  return chance > MiscService.dice('1d100');
}

/**
 * @class Сервис работы с магиями
 */
export default class MagicService {
  static MAX_MAGIC_LVL = 3;

  static isMagic(maybeMagic: string): maybeMagic is keyof (typeof arena)['magics'] {
    return maybeMagic in arena.magics;
  }

  /**
   * Изучение магии с шансом
   * @param lvl круг проучиваемой магии
   */
  static async learnMagic(character: CharacterService, lvl: number) {
    if (!canLearnMagic(character.lvl, lvl)) {
      throw new ValidationError('Слишком низкий уровень персонажа');
    }

    const magicsToLearn = MagicService.getMagicsToLearn(character, lvl);
    if (!magicsToLearn.length) {
      throw new ValidationError('Нет магий для изучения');
    }

    const magic = magicsToLearn[MiscService.randInt(0, magicsToLearn.length)];

    await character.resources.takeResources({ bonus: getLearnMagicCost(lvl) });

    if (!learnChance()) {
      throw new ValidationError('Не удалось выучить. Удача не на твоей стороне');
    }

    const charMagicLvl = character.magics[magic.name] || 0;
    await character.learnMagic(magic.name, charMagicLvl + 1);

    return magic;
  }

  /**
   * Возвращает доступные магии на данном круге для изучения
   * @param lvl круг проучиваемой магии
   */
  static getMagicsToLearn(character: CharacterService, lvl: number) {
    const magicsByLvl = MagicService.getMagicListByProf(character.prof, lvl);

    return magicsByLvl.filter((magic) => {
      return (character.magics[magic.name] ?? 0) < MagicService.MAX_MAGIC_LVL;
    });
  }

  static getAvaiableLevels(character: CharacterService) {
    const magics = MagicService.getMagicListByProf(character.class);

    const magicsToLearn = magics.filter((magic) => {
      return (character.magics[magic.name] ?? 0) < MagicService.MAX_MAGIC_LVL;
    });

    const magicsByLvl = Object.groupBy(magicsToLearn, ({ lvl }) => lvl);
    return mapValues(magicsByLvl, (magics) => Boolean(magics?.length));
  }

  /**
   * Показываем описание магии
   * @param magId строка идентификатор магии
   */
  static getMagicById(magic: string) {
    return arena.magics[magic as keyof (typeof arena)['magics']].toObject();
  }

  /**
   * Список доступных магий для профы на заданном круге
   * @param prof профессия персонажа
   * @param lvl круг магии
   * @returns возвращает магии всех кругов если не передан круг
   */
  static getMagicListByProf(prof: Prof, lvl?: number) {
    return Object.values(arena.magics)
      .filter((magic) => {
        if (!lvl) {
          return magic.profList.includes(prof);
        }

        return magic.lvl === lvl && magic.profList.includes(prof);
      })
      .map((magic) => magic.toObject());
  }

  static getMagicListByIds(magics: string[]) {
    return magics.map(MagicService.getMagicById);
  }
}
