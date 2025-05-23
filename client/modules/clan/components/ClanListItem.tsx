import { Suspense, type FC } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { Clan } from '@fwo/shared';
import { ClanPlayers } from '@/modules/clan/components/ClanPlayers';
import { Modal } from '@/components/Modal';

export const ClanListItem: FC<{
  clan: Clan;
  requested?: boolean;
  isLoading: boolean;
  onCreateRequest: (id: string) => void;
  onCancelRequest: (id: string) => void;
}> = ({ clan, requested, isLoading, onCreateRequest, onCancelRequest }) => {
  const handleCreateRequest = () => {
    onCreateRequest(clan.id);
  };

  const handleCancelRequest = () => {
    onCancelRequest(clan.id);
  };

  return (
    <Modal
      trigger={
        <Button className="text-left">
          <div className="flex items-center justify-between">
            {clan.name}
            {requested && <span className="opacity-50">Ожидание</span>}
          </div>
        </Button>
      }
    >
      <Card header={clan.name}>
        <h5>Уровень {clan.lvl}</h5>
        <ErrorBoundary fallback={'Что-то пошло не так'}>
          <h5>Владелец</h5>
          <Suspense fallback={'Загружаем владельца...'}>
            <ClanPlayers players={[clan.owner]} />
          </Suspense>
          <h5>Игроки</h5>
          <Suspense fallback={'Загружаем игроков...'}>
            <ClanPlayers players={clan.players} />
          </Suspense>
        </ErrorBoundary>

        <div className="flex mt-4">
          {requested ? (
            <Button
              className="is-primary flex-1"
              disabled={isLoading}
              onClick={handleCancelRequest}
            >
              Отменить заявку
            </Button>
          ) : (
            <Button
              className="is-primary flex-1"
              disabled={isLoading}
              onClick={handleCreateRequest}
            >
              Отправить заявку
            </Button>
          )}
        </div>
      </Card>
    </Modal>
  );
};
