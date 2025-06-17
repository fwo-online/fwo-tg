import { Card } from '@/components/Card';
import { useMountEffect } from '@/hooks/useMountEffect';
import { CharacterImage } from '@/modules/character/components/CharacterImage';
import { useSocket } from '@/stores/socket';
import type { CharacterPublic } from '@fwo/shared';
import { useState } from 'react';

export const TowerPage = () => {
  const socket = useSocket();
  const [players, setPlayers] = useState<Record<string, CharacterPublic>>({});

  useMountEffect(() => {
    socket.emitWithAck('tower:connected').then((res) => {
      if (!res.error) {
        setPlayers(res.players);
      }
    });
  });

  return (
    <Card header="Башня">
      {Object.entries(players).map(([id, player]) => (
        <div key={id}>
          <CharacterImage characterClass={player.class} small />
          {player.name}
        </div>
      ))}
    </Card>
  );
};
