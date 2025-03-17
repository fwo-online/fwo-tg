import { characterClassNameMap } from '@/constants/character';
import { Info, Cell, Placeholder } from '@telegram-apps/telegram-ui';
import { useLobby } from '@/modules/lobby/hooks/useLobby';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export function LobbyPage() {
  const { toggleSearch, isSearching, searchers } = useLobby();

  return (
    <div className="m-4!">
      <Card header="Ищут игру">
        {searchers.length ? (
          searchers.map((searcher) => (
            <Cell key={searcher.name}>
              <Info type="text">
                {searcher.name} ({characterClassNameMap[searcher.class]} {searcher.lvl})
              </Info>
            </Cell>
          ))
        ) : (
          <Placeholder description="Никого нет" />
        )}
      </Card>

      {isSearching ? (
        <Button className="text-(--tg-theme-destructive-text-color)!" onClick={toggleSearch}>
          Остановить поиск игры
        </Button>
      ) : (
        <Button onClick={toggleSearch}>Начать поиск игры</Button>
      )}
    </div>
  );
}
