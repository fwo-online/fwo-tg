import { useNavigate } from 'react-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LobbyList } from '@/modules/lobby/components/LobbyList';
import { useLobbyQueue } from '@/modules/lobby/hooks/useLobbyQueue';
import { useLobbyHelp } from '@/modules/lobby/hooks/useLobbyHelp';

export const LobbyArenaPage = () => {
  const { toggleSearch, isSearching, searchers } = useLobbyQueue('ladder');
  const { openChannelLink, channelLinkVisible } = useLobbyHelp();
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
        {channelLinkVisible ? (
          <div className="flex flex-col">
            <h5 className="self-center px-4 text-center">
              Перейди в арену, чтобы видеть историю боя
            </h5>
            <Button className="is-error" onClick={openChannelLink}>
              Перейти в арену
            </Button>
          </div>
        ) : null}
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
