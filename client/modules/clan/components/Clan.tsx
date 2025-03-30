import { Button } from '@/components/Button';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ClanPlayers } from '@/modules/clan/components/ClanPlayers';
import type { CharacterPublic, Clan as ClanSchema } from '@fwo/shared';
import { Suspense, type FC } from 'react';
import { ClanGold } from '@/modules/clan/components/ClanGold';

export const ClanComponent: FC<{
  clan: ClanSchema;
  isOwner: boolean;
  isLoading: boolean;
  onAddGold: (gold: number) => void;
  onAcceptRequest: (character: CharacterPublic) => void;
  onRejectRequest: (character: CharacterPublic) => void;
}> = ({ clan, isOwner, isLoading, onAddGold, onAcceptRequest, onRejectRequest }) => {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h5 className="-mb-3">Казна</h5>
        <div className="flex justify-between items-center">
          {clan.gold}💰
          <ClanGold onAddGold={onAddGold} />
        </div>
      </div>

      <div>
        <h5>Игроки</h5>
        <ErrorBoundary fallback={'Что-то пошло не так'}>
          <Suspense fallback={'Ищем игроков...'}>
            <ClanPlayers players={clan.players} />
          </Suspense>
        </ErrorBoundary>
      </div>

      {isOwner && clan.requests.length > 0 && (
        <div>
          <h5 className="-mb-3">Заявки</h5>
          <ErrorBoundary fallback={'Что-то пошло не так'}>
            <Suspense fallback={'Ищем игроков...'}>
              <ClanPlayers
                players={clan.requests}
                after={(character) => (
                  <div className="flex gap-4 mb-4">
                    <Button
                      className="is-success"
                      disabled={isLoading}
                      onClick={() => onAcceptRequest(character)}
                    >
                      ✔
                    </Button>
                    <Button
                      className="is-error"
                      disabled={isLoading}
                      onClick={() => onRejectRequest(character)}
                    >
                      ✖
                    </Button>
                  </div>
                )}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
};
