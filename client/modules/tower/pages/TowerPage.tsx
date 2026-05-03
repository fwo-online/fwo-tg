// import { Button } from '@/components/Button';

import { playersClanName } from '@fwo/shared';
import classNames from 'classnames';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Player } from '@/components/Player';
import { useTower } from '@/modules/tower/hooks/useTower';

export const TowerPage = () => {
  const { players, timeLeft, timeSpent, accepted, acceptedList, handleAccept } = useTower();

  return (
    <Card header="Башня" className="m-4">
      <div className="flex justify-between items-center mb-4">{/* <Button>Выход</Button> */}</div>
      <div className="flex flex-col mb-12">
        <h5>{playersClanName}</h5>
        {Object.entries(players).map(([id, player]) => (
          <Player
            key={id}
            class={player.class}
            name={player.name}
            lvl={player.lvl}
            append={acceptedList.includes(player.id) ? '✓' : null}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <span>Стадия подготовки</span>
        <h5 className="text-sm">
          У вас есть 2 минуты на планирование. Подтвердите готовность, чтобы начать бой раньше
        </h5>
        <progress className="nes-progress h-4" value={timeSpent} max={timeLeft + timeSpent} />
        <Button
          className={classNames({ 'is-success': !accepted, 'is-warning': accepted })}
          onClick={handleAccept}
        >
          {accepted ? 'Не готов' : 'Готов'}
        </Button>
      </div>
    </Card>
  );
};
