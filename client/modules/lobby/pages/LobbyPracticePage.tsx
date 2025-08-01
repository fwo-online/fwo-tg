import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useLobbyQueue } from '@/modules/lobby/hooks/useLobbyQueue';

export const LobbyPracticePage = () => {
  const { toggleSearch, isSearching } = useLobbyQueue('practice');

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <Card header="Тренировка" className="m-4">
        <h5 className="mb-4">
          Безопасный режим для отработки приёмов и проверки снаряжения. Враги здесь не представляют
          серьёзной угрозы, но позволяют освоиться с боевой системой.
        </h5>
        <div className="flex flex-col">
          {isSearching ? (
            <Button className="is-warning" onClick={toggleSearch}>
              Отмена
            </Button>
          ) : (
            <Button onClick={toggleSearch}>Начать тренировку</Button>
          )}
        </div>
      </Card>
    </div>
  );
};
