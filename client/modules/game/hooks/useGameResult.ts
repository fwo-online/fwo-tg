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

    popup.info({
      title: result.winner ? 'Победа!' : 'Поражение',
      message: `Награда:\n${[
        `${result.exp}📖`,
        `${result.gold}💰`,
        `${result.components ? `${componentsToString(result.components)}` : ''}`,
        `${result.item ? result.item.info.name : ''}`,
      ]
        .filter(Boolean)
        .join('\n')}`,
    });
  };

  return {
    handleGameResult,
  };
};
