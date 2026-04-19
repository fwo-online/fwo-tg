import { type Item, QuestType } from '@fwo/shared';
import type { FC } from 'react';

const QUEST_DESCRIPTION = {
  [QuestType.Damage]: 'Нанести урон',
  [QuestType.Kills]: 'Убить противников',
  [QuestType.Heal]: 'Восстановить здоровья',
};

export const ItemPassive: FC<{ passive: Required<Item>['passive'] }> = ({ passive }) => {
  return (
    <div>
      <div className="flex justify-between items-baseline">
        <span>{passive.name}</span>
        <span className="text-xs">{passive.level} lvl</span>
      </div>

      {passive.quest && (
        <span className="text-sm">
          {QUEST_DESCRIPTION[passive.quest.type]}: {passive.quest.progress}/{passive.quest.goal}
        </span>
      )}
    </div>
  );
};
