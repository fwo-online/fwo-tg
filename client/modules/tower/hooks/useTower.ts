import { useMountEffect } from '@/hooks/useMountEffect';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useSocket } from '@/stores/socket';
import type { CharacterPublic } from '@fwo/shared';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';

export const useTower = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Record<string, CharacterPublic>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleTime = useCallback((timeSpent: number, timeLeft: number) => {
    setTimeSpent(timeSpent);
    setTimeLeft(timeLeft);
  }, []);

  useMountEffect(() => {
    socket.emitWithAck('tower:connected').then((res) => {
      if (!res.error) {
        setPlayers(res.players);
        handleTime(res.timeSpent, res.timeLeft);
      } else {
        navigate('/');
      }
    });
  });

  useSocketListener('tower:end', () => navigate('/'));
  useSocketListener('tower:updateTime', handleTime);

  return {
    players,
    timeSpent,
    timeLeft,
  };
};
