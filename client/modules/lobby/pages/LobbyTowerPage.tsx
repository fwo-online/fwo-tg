import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { LobbyList } from '@/modules/lobby/components/LobbyList';
import { useLobbyQueue } from '@/modules/lobby/hooks/useLobbyQueue';

export const LobbyTowerPage = () => {
  const { toggleSearch, isSearching, searchers } = useLobbyQueue('tower');

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <Card header="Башня" className="m-4">
        <div className="flex flex-col">
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
