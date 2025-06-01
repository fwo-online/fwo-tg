import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Suspense, type FC } from 'react';
import { ClanGold } from '@/modules/clan/components/ClanGold';
import { ClanLevel } from '@/modules/clan/components/ClanLevel';
import { ClanPlayers } from '@/modules/clan/components/ClanPlayers';
import { ClanRequests } from '@/modules/clan/components/ClanRequests';
import { useClanOwner } from '@/modules/clan/hooks/useClanOwner';
import { ClanForge } from '@/modules/clan/components/ClanForge';
import { useClan } from '@/modules/clan/store/clan';
import { Button } from '@/components/Button';
import { Popup } from '@/components/Popup';

export const Clan: FC = () => {
  const lvl = useClan((clan) => clan.lvl);
  const forgeLvl = useClan((clan) => clan.forge.lvl);
  const players = useClan((clan) => clan.players);
  const maxPlayers = useClan((clan) => clan.maxPlayers);
  const requests = useClan((clan) => clan.requests);
  const owner = useClan((clan) => clan.owner);
  const channel = useClan((clan) => clan.channel);
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

      <div className="flex justify-between items-center">
        <h5>Кузница {forgeLvl} ур.</h5>
        <ClanForge />
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

      {!isOwner && (
        <div>
          <h5>Владелец</h5>
          <ErrorBoundary fallback={'Что-то пошло не так'}>
            <Suspense fallback={'Загружаем владельца...'}>
              <ClanPlayers players={[owner]} />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}

      {isOwner && requests.length > 0 && (
        <div>
          <h5 className="-mb-3">Заявки</h5>
          <ErrorBoundary fallback={'Что-то пошло не так'}>
            <Suspense fallback={'Загружаем заявки...'}>
              <ClanPlayers
                players={requests}
                after={(character) => <ClanRequests character={character} />}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}

      {channel ? (
        <div className="flex gap-2 items-center">
          <h5>Канал привязан</h5>
          <Popup trigger={<Button>!</Button>}>
            Для отвязки бота используйте команду <code>/clan unlink</code> в канале с ботом
          </Popup>
        </div>
      ) : (
        <div className="flex gap-2 items-center">
          <h5>Канал не привязан</h5>
          <Popup trigger={<Button>!</Button>}>
            Для привязки канала добавьте бота в канал и используйте команду <code>/clan link</code>{' '}
            в канале
          </Popup>
        </div>
      )}
    </div>
  );
};
