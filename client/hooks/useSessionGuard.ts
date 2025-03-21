import { useNavigate } from 'react-router';
import { useWebSocket } from '@/contexts/webSocket';
import { useMountEffect } from '@/hooks/useMountEffect';

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

  return () => {
    if (!socket.connected) {
      socket.once('connect', () => {
        navigate('/');
      });
      socket.connect();
    } else {
      navigate('/');
    }
  };
};
