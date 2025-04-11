import { useLobby } from '@/modules/lobby/hooks/useLobby';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LobbyList } from '@/modules/lobby/components/LobbyList';
import { useNavigate } from 'react-router';

export function LobbyPage() {
  const { toggleSearch, isSearching, searchers } = useLobby();
  const navigate = useNavigate();

  const navigateToLadder = () => {
    navigate('/arena/ladder');
  };

  return (
    <div className="m-3 mt-4">
      <div className="flex flex-col mb-8">
        <Button onClick={navigateToLadder}>Рейтинг</Button>
      </div>
      <Card header="Ищут игру">
        <LobbyList searchers={searchers} />
      </Card>

      <div className="flex flex-col fixed bottom-24 left-2 right-2">
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
}
