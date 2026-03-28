import { CharacterClass, ItemWear, MonsterType } from '@fwo/shared';
import { shuffle } from 'es-toolkit';
import arena from '@/arena';
import { expToLevel } from '@/arena/CharacterService/utils/calculateLvl';
import type GameService from '@/arena/GameService';
import MiscService from '@/arena/MiscService';
import { MonsterService } from '@/arena/MonsterService/MonsterService';
import { ItemModel } from '@/models/item';
import { MonsterAI } from '@/arena/MonsterService/MonsterAI';

export class SpiritAI extends MonsterAI {
  makeOrder(game: GameService): void {
    if (!this.monster.alive) {
      return;
    }

    // Пробуем использовать ледяное прикосновение
    if (this.orderFrostTouch(game)) {
      return;
    }

    const target = this.chooseTarget(game);
    if (!target) {
      return;
    }

    this.orderAttack(game, target, 100);
  }

  private orderFrostTouch(game: GameService): boolean {
    // 50% шанс использовать ледяное прикосновение
    if (!MiscService.chance(50)) {
      return false;
    }

    const cost = 3; // Стоимость frostTouch
    if (this.monster.stats.val('mp') < cost) {
      return false;
    }

    const targets = shuffle(game.players.aliveNonBotPlayers);
    if (!targets.length) {
      return false;
    }

    try {
      game.orders.orderAction({
        action: 'frostTouch',
        initiator: this.monster.id,
        target: targets[0].id,
        proc: 100,
      });
      return true;
    } catch {
      return false;
    }
  }

  private chooseTarget(game: GameService) {
    const targets = shuffle(game.players.aliveNonBotPlayers);
    return targets[0];
  }
}

export const createSpirit = (lvl = 1, id: string | number = '') => {
  const machete = new ItemModel(arena.items.machete);

  const spirit = MonsterService.create(
    {
      nickname: `👁️ Злой дух ${id.toString()}`.trimEnd(),
      prof: CharacterClass.Mage,
      harks: {
        str: Math.round(lvl * 1 + 5),
        dex: Math.round(lvl * 1 + 8),
        int: Math.round(lvl * 3 + 15),
        wis: Math.round(lvl * 2 + 10),
        con: Math.round(lvl * 1.5 + 6),
      },
      magics: { frostTouch: 1 },
      items: [machete],
      equipment: new Map([[ItemWear.MainHand, machete]]),
      exp: expToLevel(lvl),
    },
    MonsterType.Spirit,
    SpiritAI,
  );

  // Дух устойчив к некоторым эффектам
  spirit.modifiers.chance.fail.paralysis = 70;
  spirit.modifiers.chance.fail.disarm = 100;
  spirit.modifiers.chance.fail.sleep = 100;
  spirit.modifiers.chance.fail.silence = 50; // Частично устойчив к молчанию

  return spirit;
};
