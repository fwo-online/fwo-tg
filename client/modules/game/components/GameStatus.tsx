import { useGameStore } from '@/modules/game/store/useGameStore';
import { Description } from '@/components/Description';
import { type GameStatus as GameStatusSchema, reservedClanName } from '@fwo/shared';

import { CharacterImage } from '@/modules/character/components/CharacterImage';
import { mapValues, omit } from 'es-toolkit';
import { useCharacter } from '@/modules/character/store/character';

export function GameStatus() {
  const clan = useCharacter((character) => character.clan);
  const characterID = useCharacter((character) => character.id);
  const players = useGameStore((state) => state.players);
  const statusByClan = useGameStore((state) => state.statusByClan);
  const alliesStatus = clan
    ? statusByClan[clan?.name]
    : statusByClan[reservedClanName]?.filter(({ id }) => id === characterID);

  const enemiesStatus: Partial<Record<string, GameStatusSchema[]>> = clan
    ? omit(statusByClan, [clan.name])
    : mapValues(statusByClan, (statuses, clan) => {
        if (clan === reservedClanName) {
          return statuses?.filter(({ id }) => id !== characterID);
        }
        return statuses;
      });

  return (
    <Description header={clan?.name ?? ''}>
      {alliesStatus?.map((status) => (
        <Description.Item
          key={status.name}
          after={
            <>
              {status.hp && <>❤️{status.hp}</>}
              {status.mp && <>💧{status.mp}</>}
              {status.en && <>🔋{status.en}</>}
            </>
          }
        >
          <div className="flex">
            <CharacterImage characterClass={players[status.id].class} small /> {status.name}
          </div>
        </Description.Item>
      ))}
      {Object.entries(enemiesStatus).map(([clan, statuses]) =>
        statuses?.length ? (
          <Description key={clan} header={clan === reservedClanName ? 'Без клана' : clan}>
            {statuses?.map((status) => (
              <Description.Item key={status.id} after={<>❤️{status.hp}</>}>
                <div className="flex gap-2">
                  {players[status.id].isBot ? null : (
                    <CharacterImage characterClass={players[status.id].class} small />
                  )}
                  {status.name}
                </div>
              </Description.Item>
            ))}
          </Description>
        ) : null,
      )}
    </Description>
  );
}
