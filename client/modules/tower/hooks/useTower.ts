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
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useMountEffect(() => {
    socket.emitWithAck('tower:connected').then((res) => {
      if (!res.error) {
        setPlayers(res.players);
        setTimeSpent(res.timeSpent);
        setTimeLeft(res.timeLeft);
      } else {
        navigate('/');
      }
    });
  });

  useSocketListener('tower:end', () => navigate('/'));

  return {
    players,
    timeSpent,
    timeLeft,
  };
};
