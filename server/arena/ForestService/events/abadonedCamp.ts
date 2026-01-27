import { ForestEventAction } from "@fwo/shared";
import { ForestEventHandler } from "./types";
import MiscService from "@/arena/MiscService";

export const handleAbandonedCampEvent: ForestEventHandler = async (action) => {
    if (action === ForestEventAction.PassBy) {
      return {
        success: true,
        message: 'Ты прошёл мимо заброшенного лагеря.',
      };
    }

    if (action === ForestEventAction.ScavengeCamp) {
      // Шанс появления паука/крыс
      const dangerChance = 0.25; // 25% шанс
      if (Math.random() < dangerChance) {
        return {
          success: false,
          message: 'Из палатки выскочил паук! (TODO: бой с пауком)',
          // startBattle: true,
        };
      }

      const fabricAmount = MiscService.randInt(1, 2);
      return {
        success: true,
        message: `Ты разобрал палатку и получил ${fabricAmount} ткани!`,
        reward: {
          components: {
            fabric: fabricAmount,
          },
        },
      };
    }

    throw new Error(`Invalid action for abandoned camp event: ${action}`);
  }