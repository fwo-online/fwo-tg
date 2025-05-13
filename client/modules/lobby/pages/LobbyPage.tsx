import { useLobby } from '@/modules/lobby/hooks/useLobby';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { LobbyList } from '@/modules/lobby/components/LobbyList';
import { useNavigate } from 'react-router';
import { useLobbyHelp } from '@/modules/lobby/hooks/useLobbyHelp';

export function LobbyPage() {
  const { toggleSearch, isSearching, searchers } = useLobby();
  const { channelLinkVisible, openChannelLink } = useLobbyHelp();
  const navigate = useNavigate();

  const navigateToLadder = () => {
    navigate('/arena/ladder');
  };

  return (
    <div className="m-3 mt-4 h-full flex flex-col">
      <div className="flex flex-col mb-8">
        <Button onClick={navigateToLadder}>Рейтинг</Button>
      </div>
      <Card header="Ищут игру">
        <LobbyList searchers={searchers} />
      </Card>

      <div className="flex flex-col gap-2 mt-auto pb-8">
        {channelLinkVisible ? <Button onClick={openChannelLink}>Открыть лог</Button> : null}
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
