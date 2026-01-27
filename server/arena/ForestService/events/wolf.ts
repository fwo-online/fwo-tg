import { ForestEventAction } from "@fwo/shared";
import { ForestEventHandler } from "./types";

export const handleWolfEvent: ForestEventHandler = async (action, forest) => {
    if (action === ForestEventAction.PassBy) {
      return {
        success: true,
        message: 'Ты осторожно прошёл мимо, не привлекая внимания.',
      };
    }

    if (action === ForestEventAction.Sneak) {
      // Проверка ловкости
      const playerDex = forest.player.stats.val('attributes.dex');
      const wolfLevel = forest.player.lvl;
      const wolfDex = Math.round(wolfLevel * 1 + 10); // Формула из wolf.ts

      const sneakChance = playerDex / (playerDex + wolfDex);
      const success = Math.random() < sneakChance;

      if (success) {
        return {
          success: true,
          message: 'Ты бесшумно прокрался мимо волка!',
        };
      } else {
        return {
          success: false,
          message: 'Ты хрустнул веткой! Волк заметил тебя и атакует!',
          startBattle: true,
        };
      }
    }

    if (action === ForestEventAction.AttackWolf) {
      return {
        success: true,
        message: 'Ты решил атаковать волка!',
        startBattle: true,
      };
    }

    throw new Error(`Invalid action for wolf event: ${action}`);
  }
