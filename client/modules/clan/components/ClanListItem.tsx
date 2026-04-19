import type { CharacterPublic, Clan } from '@fwo/shared';
import { type FC, useState } from 'react';
import { getCharacterList } from '@/api/character';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Modal } from '@/components/Modal';
import { ClanPlayers } from '@/modules/clan/components/ClanPlayers';

export const ClanListItem: FC<{
  clan: Clan;
  requested?: boolean;
  isLoading: boolean;
  onCreateRequest: (id: string) => void;
  onCancelRequest: (id: string) => void;
}> = ({ clan, requested, isLoading, onCreateRequest, onCancelRequest }) => {
  const [characters, setCharacters] = useState<CharacterPublic[]>([]);
  const [isCharactersLoading, setCharactersLoading] = useState(false);
  const handleCreateRequest = () => {
    onCreateRequest(clan.id);
  };

  const owner = characters?.filter(({ id }) => id === clan.owner);

  const handleCancelRequest = () => {
    onCancelRequest(clan.id);
  };

  const handleOpenChange = async (open: boolean) => {
    if (open && !isCharactersLoading) {
      setCharactersLoading(true);
      try {
        const characters = await getCharacterList(clan.players);
        setCharacters(characters);
      } finally {
        setCharactersLoading(false);
      }
    }
  };

  return (
    <Modal
      onOpenChange={handleOpenChange}
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
          {isCharactersLoading ? 'Загружаем владельца...' : <ClanPlayers characters={owner} />}

          <h5>Игроки</h5>
          {isCharactersLoading ? 'Загружаем игроков...' : <ClanPlayers characters={characters} />}
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
