import { componentsToString, type GameResult } from '@fwo/shared';
import { invalidate } from '$app/navigation';
import { popup } from '$lib/components/Popup/popup.svelte';
import { getCharacterContext } from '$lib/constext/character';

export const showGameResult = (results: GameResult[]) => {
  const character = getCharacterContext();

  const charID = character().id;
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
      onConfirm: () => invalidate('app:character'),
    });
  }
};
