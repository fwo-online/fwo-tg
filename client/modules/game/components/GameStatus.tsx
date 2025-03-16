import { useGameStore } from '@/modules/game/store/useGameStore';
import { Description } from '@/components/Description';
import { reservedClanName } from '@fwo/shared';
import { useCharacter } from '@/contexts/character';

export function GameStatus() {
  const { character } = useCharacter();
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
          {status.name}
        </Description.Item>
      ))}
      {Object.entries(statusByClan).map(([clan, statuses]) => (
        <Description key={clan} header={clan === reservedClanName ? 'Без клана' : clan}>
          {statuses?.map((status) => (
            <Description.Item key={status.id} after={<>❤️ {status.hp}</>}>
              {status.name}
            </Description.Item>
          ))}
        </Description>
      ))}
    </Description>
  );
}
