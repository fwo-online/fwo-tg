// import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Player } from '@/components/Player';
import { useTower } from '@/modules/tower/hooks/useTower';

export const TowerPage = () => {
  const { players, timeLeft, timeSpent } = useTower();

  return (
    <Card header="Башня" className="m-4">
      <div className="flex justify-between items-center mb-4">
        <progress className="nes-progress h-4" value={timeSpent} max={timeLeft + timeSpent} />
        {/* <Button>Выход</Button> */}
      </div>
      <div className="flex flex-col">
        <h5>Игроки</h5>
        {Object.entries(players).map(([id, player]) => (
          <Player key={id} class={player.class} name={player.name} lvl={player.lvl} />
        ))}
      </div>
    </Card>
  );
};
