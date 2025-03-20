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

  const onConnect = () => {
    navigate('/');
    socket.off('connect', onConnect);
  };

  return () => {
    if (!socket.connected) {
      socket.on('connect', onConnect);
      socket.connect();
    } else {
      onConnect();
    }
  };
};
