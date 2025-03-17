import { useNavigate } from 'react-router';
import { useWebSocket } from '@/contexts/webSocket';
import { useMount } from '@/hooks/useMount';

export const useSessionGuard = () => {
  const socket = useWebSocket();
  const navigate = useNavigate();

  useMount(() => {
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
      socket.connect();
      socket.on('connect', () => {});
    } else {
      navigate('/');
    }
  };
};
