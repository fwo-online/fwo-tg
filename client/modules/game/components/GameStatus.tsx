import { useGameStore } from '@/modules/game/store/useGameStore';
import { Description } from '@/components/Description';
import { type GameStatus as GameStatusSchema, reservedClanName } from '@fwo/shared';
import { useCharacter } from '@/contexts/character';
import { CharacterImage } from '@/modules/character/components/CharacterImage';
import { mapValues, omit } from 'es-toolkit';

export function GameStatus() {
  const { character } = useCharacter();
  const players = useGameStore((state) => state.players);
  const statusByClan = useGameStore((state) => state.statusByClan);
  const alliesStatus = character.clan
    ? statusByClan[character.clan?.name]
    : statusByClan[reservedClanName]?.filter(({ id }) => id === character.id);

  const enemiesStatus: Partial<Record<string, GameStatusSchema[]>> = character.clan
    ? omit(statusByClan, [character.clan.name])
    : mapValues(statusByClan, (statuses, clan) => {
        if (clan === reservedClanName) {
          return statuses?.filter(({ id }) => id !== character.id);
        }
        return statuses;
      });

  return (
    <Description header={character.clan ? character.clan.name : ''}>
      {alliesStatus?.map((status) => (
        <Description.Item
          key={status.name}
          after={
            <>
              {status.hp && <>❤️ {status.hp}</>}
              {status.mp && <>💧 {status.mp}</>}
              {status.en && <>🔋 {status.en}</>}
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
              <Description.Item key={status.id} after={<>❤️ {status.hp}</>}>
                <div className="flex">
                  <CharacterImage characterClass={players[status.id].class} small /> {status.name}
                </div>
              </Description.Item>
            ))}
          </Description>
        ) : null,
      )}
    </Description>
  );
}
