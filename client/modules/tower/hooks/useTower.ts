import type { CharacterPublic } from '@fwo/shared';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useSocketListener } from '@/hooks/useSocketListener';
import { useCharacter } from '@/modules/character/store/character';
import { useSocket } from '@/stores/socket';

export const useTower = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const characterID = useCharacter((character) => character.id);
  const [players, setPlayers] = useState<Record<string, CharacterPublic>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [acceptedList, setAcceptedList] = useState<string[]>([]);
  const accepted = acceptedList.includes(characterID);

  const handleTime = useCallback((timeSpent: number, timeLeft: number) => {
    setTimeSpent(timeSpent);
    setTimeLeft(timeLeft);
  }, []);

  const handleAccept = () => {
    socket.emitWithAck('tower:accept', !accepted).then((res) => {
      if (!res.error) {
        setAcceptedList(res.accepted);
      }
    });
  };

  useMountEffect(() => {
    socket.emitWithAck('tower:connected').then((res) => {
      if (!res.error) {
        setPlayers(res.players);
        setAcceptedList(res.accepted);
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
    accepted,
    acceptedList,
    handleAccept,
  };
};
