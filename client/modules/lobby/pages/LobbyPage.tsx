import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useNavigate } from 'react-router';

export function LobbyPage() {
  const navigate = useNavigate();

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
        <Button className="flex-1" onClick={navigateToArena}>
          Арена
        </Button>
        <Button className="flex-1" onClick={navigateToTower}>
          Башня
        </Button>
      </div>
    </Card>
  );
}
