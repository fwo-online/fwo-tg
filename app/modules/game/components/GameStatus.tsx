import { Cell, List } from '@telegram-apps/telegram-ui';
import { useGameStore } from '@/modules/game/store/useGameStore';

export function GameStatus() {
  const status = useGameStore((state) => state.status);

  return (
    <List>
      {status.map((status) => (
        <Cell
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
        </Cell>
      ))}
    </List>
  );
}
