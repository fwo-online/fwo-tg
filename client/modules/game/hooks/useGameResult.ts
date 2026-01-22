import { componentsToString, type GameResult } from '@fwo/shared';
import { usePopup } from '@/hooks/usePopup';
import { useCharacter } from '@/modules/character/store/character';

export const useGameResult = () => {
  const charID = useCharacter((character) => character.id);
  const popup = usePopup();

  const handleGameResult = (results: GameResult[]) => {
    const result = results.find((result) => result.player.id === charID);

    if (!result) {
      return;
    }

    const rewardsMessage = [
      `${result.exp}📖`,
      `${result.gold}💰`,
      `${result.components ? `${componentsToString(result.components)}` : ''}`,
      `${result.item ? result.item.info.name : ''}`,
    ]
      .filter(Boolean)
      .join('\n');

    if (result.levelUp) {
      popup.info({
        title: '🎉 LEVEL UP! 🎉',
        message: `Поздравляем! Вы достигли ${result.levelUp.newLevel} уровня!\n\n💪 +${result.levelUp.freePoints} свободных очков\n\n${result.winner ? '🏆 Победа!' : 'Поражение'}\n\nНаграда:\n${rewardsMessage}`,
      });
    } else {
      popup.info({
        title: result.winner ? 'Победа!' : 'Поражение',
        message: `Награда:\n${rewardsMessage}`,
      });
    }
  };

  return {
    handleGameResult,
  };
};
