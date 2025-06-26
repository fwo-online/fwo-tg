import { type GameStatus as GameStatusSchema, reservedClanName } from '@fwo/shared';
import { mapValues, omit } from 'es-toolkit';
import { Description } from '@/components/Description';
import { Player } from '@/components/Player';
import { useCharacter } from '@/modules/character/store/character';
import { useGameStore } from '@/modules/game/store/useGameStore';

export function GameStatus() {
  const characterID = useCharacter((character) => character.id);
  const clan = useGameStore((state) => state.players[characterID]?.clan);
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
          <Player
            class={players[status.id].class}
            name={status.name}
            isBot={players[status.id].isBot}
          />
        </Description.Item>
      ))}
      {Object.entries(enemiesStatus).map(([clan, statuses]) =>
        statuses?.length ? (
          <Description key={clan} header={clan === reservedClanName ? 'Без клана' : clan}>
            {statuses?.map((status) => (
              <Description.Item key={status.id} after={<>❤️{status.hp}</>}>
                <div className="flex gap-2">
                  <Player
                    class={players[status.id].class}
                    name={status.name}
                    isBot={players[status.id].isBot}
                  />
                </div>
              </Description.Item>
            ))}
          </Description>
        ) : null,
      )}
    </Description>
  );
}
