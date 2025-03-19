import { useGameStore } from '@/modules/game/store/useGameStore';
import { Description } from '@/components/Description';
import { reservedClanName } from '@fwo/shared';
import { useCharacter } from '@/contexts/character';
import { CharacterImage } from '@/modules/character/components/CharacterImage';

export function GameStatus() {
  const { character } = useCharacter();
  const players = useGameStore((state) => state.players);
  const statusByClan = useGameStore((state) => state.statusByClan);
  const status = character.clan?.id
    ? statusByClan[character.clan?.id]
    : statusByClan[reservedClanName]?.filter(({ id }) => id === character.id);

  return (
    <Description>
      {status?.map((status) => (
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
      {Object.entries(statusByClan).map(([clan, statuses]) => (
        <Description key={clan} header={clan === reservedClanName ? 'Без клана' : clan}>
          {statuses?.map((status) => (
            <Description.Item key={status.id} after={<>❤️ {status.hp}</>}>
              <div className="flex">
                <CharacterImage characterClass={players[status.id].class} small /> {status.name}
              </div>
            </Description.Item>
          ))}
        </Description>
      ))}
    </Description>
  );
}
