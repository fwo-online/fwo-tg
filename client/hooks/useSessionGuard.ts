import { useNavigate } from 'react-router';
import { useWebSocket } from '@/contexts/webSocket';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useCallback } from 'react';

export const useSessionGuard = () => {
  const socket = useWebSocket();
  const navigate = useNavigate();

  useMountEffect(() => {
    if (!socket.active) {
      navigate('/connection-error');
    }
  });
};

export const useSessionReconnect = () => {
  const socket = useWebSocket();
  const navigate = useNavigate();

  const onConnect = useCallback(() => {
    navigate('/');
    socket.off('connect', onConnect);
  }, [socket, navigate]);

  return () => {
    if (!socket.connected) {
      socket.once('connect', onConnect);
      socket.connect();
    } else {
      onConnect();
    }
  };
};
