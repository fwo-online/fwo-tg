import { useNavigate } from 'react-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LobbyList } from '@/modules/lobby/components/LobbyList';
import { useLobbyQueue } from '@/modules/lobby/hooks/useLobbyQueue';

export const LobbyArenaPage = () => {
  const { toggleSearch, isSearching, searchers } = useLobbyQueue('ladder');
  const navigate = useNavigate();

  const navigateToLadder = () => {
    navigate('/lobby/ladder');
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <Card header="Арена" className="m-4">
        <div className="flex flex-col mb-8">
          <Button onClick={navigateToLadder}>Рейтинг</Button>
        </div>
        <div className="flex flex-col mt-4">
          <h5>Ищут игру</h5>
          <LobbyList searchers={searchers} />
        </div>
      </Card>

      <div className="flex flex-col gap-2 mt-auto pb-8">
        {isSearching ? (
          <Button className="is-warning" onClick={toggleSearch}>
            Остановить поиск игры
          </Button>
        ) : (
          <Button onClick={toggleSearch}>Начать поиск игры</Button>
        )}
      </div>
    </div>
  );
};
