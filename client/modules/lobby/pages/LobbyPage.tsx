import { towerRequiredLvl } from '@fwo/shared';
import { useNavigate } from 'react-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useCharacter } from '@/modules/character/store/character';

export function LobbyPage() {
  const navigate = useNavigate();
  const lvl = useCharacter((character) => character.lvl);
  const exp = useCharacter((character) => character.exp);

  const navigateToPractice = () => {
    navigate('/lobby/practice');
  };

  const navigateToArena = () => {
    navigate('/lobby/arena');
  };

  const navigateToTower = () => {
    navigate('/lobby/tower');
  };

  return (
    <Card header="Мир" className="m-4">
      <h5>Выбери место, куда хотел бы направиться</h5>
      <div className="flex flex-col gap-2">
        <Button className="flex-1" onClick={navigateToPractice}>
          Тренировка
        </Button>
        <Button disabled={exp === 0} className="flex-1" onClick={navigateToArena}>
          Арена {exp === 0 ? '(требуется пройти тренировку)' : null}
        </Button>
        <Button disabled={lvl < towerRequiredLvl} className="flex-1" onClick={navigateToTower}>
          Башня {lvl < towerRequiredLvl ? <>(требуется {towerRequiredLvl} ур.)</> : null}
        </Button>
      </div>
    </Card>
  );
}
