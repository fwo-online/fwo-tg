import type { CharacterPublic } from '@fwo/shared';
import type { FC } from 'react';

export const LadderListItem: FC<{ character: CharacterPublic; position: number }> = ({
  character,
  position,
}) => {
  return (
    <div className="flex flex-1">
      <div className="basis-8">{position}</div>
      <div className="flex flex-col flex-1">
        <div className="flex justify-between mb-2">
          <div>{character.name}</div>
          <div>{character.psr}</div>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <div className="opacity-50">Игры</div>
            <div>{character.statistics.games}</div>
          </div>
          <div className="flex gap-2">
            <div className="opacity-50">Убийства</div>
            <div>{character.statistics.kills}</div>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex gap-2">
            <div className="opacity-50">Победы</div>
            <div>{character.statistics.wins ?? '-'}</div>
          </div>
          <div className="flex gap-2">
            <div className="opacity-50">Смерти</div>
            <div>{character.statistics.death}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
