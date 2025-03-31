import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Suspense, type FC } from 'react';
import { ClanGold } from '@/modules/clan/components/ClanGold';
import { ClanLevel } from '@/modules/clan/components/ClanLevel';
import { useClanStore } from '@/modules/clan/contexts/useClan';
import { ClanPlayers } from '@/modules/clan/components/ClanPlayers';
import { ClanRequests } from '@/modules/clan/components/ClanRequests';
import { useClanOwner } from '@/modules/clan/hooks/useClanOwner';

export const Clan: FC = () => {
  const lvl = useClanStore((state) => state.clan.lvl);
  const players = useClanStore((state) => state.clan.players);
  const maxPlayers = useClanStore((state) => state.clan.maxPlayers);
  const requests = useClanStore((state) => state.clan.requests);
  const { isOwner } = useClanOwner();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h5>Уровень {lvl}</h5>
        <ClanLevel />
      </div>

      <div>
        <h5 className="-mb-3">Казна</h5>
        <ClanGold />
      </div>

      <div>
        <h5>
          Игроки {players.length}/{maxPlayers}
        </h5>

        <ErrorBoundary fallback={'Что-то пошло не так'}>
          <Suspense fallback={'Загружаем игроков...'}>
            <ClanPlayers players={players} />
          </Suspense>
        </ErrorBoundary>
      </div>

      {isOwner && requests.length > 0 && (
        <div>
          <h5 className="-mb-3">Заявки</h5>
          <ErrorBoundary fallback={'Что-то пошло не так'}>
            <Suspense fallback={'Загружаем игроков...'}>
              <ClanPlayers
                players={requests}
                after={(character) => <ClanRequests character={character} />}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
};
