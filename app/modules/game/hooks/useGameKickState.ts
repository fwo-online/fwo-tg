import { useWebSocket } from '@/hooks/useWebSocket';
import { popup } from '@telegram-apps/sdk-react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function useGameKickState() {
  const socket = useWebSocket();
  const navigate = useNavigate();

  const handlePreKick = useCallback(() => {
    popup.open({
      message: 'Вы будете выброшены из игры в следующем раунде, если не сделаете заказ',
    });
  }, []);

  const handleKick = useCallback(async () => {
    navigate('/');
    await popup.open({ message: 'Вы были выброшены из игры' });
  }, [navigate]);

  useEffect(() => {
    socket.on('game:preKick', handlePreKick);
    socket.on('game:kick', handleKick);

    return () => {
      socket.off('game:preKick', handlePreKick);
      socket.off('game:kick', handleKick);
    };
  }, [socket.on, socket.off, handlePreKick, handleKick]);
}
