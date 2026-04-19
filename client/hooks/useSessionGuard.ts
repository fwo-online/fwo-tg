import { useNavigate } from 'react-router';
import { useMountEffect } from '@/hooks/useMountEffect';
import { useSocket } from '@/stores/socket';

export const useSessionGuard = () => {
  const socket = useSocket();
  const navigate = useNavigate();

  useMountEffect(() => {
    if (!socket.active) {
      navigate('/connection-error');
    }
  });
};

export const useSessionReconnect = () => {
  const navigate = useNavigate();

  return () => {
    navigate('/');
  };
};
