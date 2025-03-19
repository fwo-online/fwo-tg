import { characterClassNameMap } from '@/constants/character';
import { useLobby } from '@/modules/lobby/hooks/useLobby';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Placeholder } from '@/components/Placeholder';

export function LobbyPage() {
  const { toggleSearch, isSearching, searchers } = useLobby();

  return (
    <div className="m-3 mt-4">
      <Card header="Ищут игру">
        {searchers.length ? (
          <div className="flex flex-col gap-4 p-4 text-sm">
            {searchers.map((searcher) => (
              <div key={searcher.id}>
                {searcher.name} ({characterClassNameMap[searcher.class]} {searcher.lvl})
              </div>
            ))}
          </div>
        ) : (
          <Placeholder description="Никого нет" />
        )}
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
