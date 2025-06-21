import { useMountEffect } from '@/hooks/useMountEffect';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useSocket } from '@/stores/socket';
import type { CharacterPublic } from '@fwo/shared';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useInterval } from 'react-use';

export const useTower = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Record<string, CharacterPublic>>({});
  const [startedAt, setStartedAt] = useState(0);

  useMountEffect(() => {
    socket.emitWithAck('tower:connected').then((res) => {
      if (!res.error) {
        setPlayers(res.players);
        setStartedAt(res.startedAt);
      } else {
        navigate('/');
      }
    });
  });

  useSocketListener('tower:end', () => navigate('/'));

  useInterval(() => {
    setStartedAt((startedAt) => startedAt + 1);
  }, 1000);

  return {
    players,
    startedAt,
  };
};
