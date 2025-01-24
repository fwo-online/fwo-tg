import { WebSocketContext } from '@/contexts/webSocket';
import { useContext } from 'react';

export const useWebSocket = () => {
  const ws = useContext(WebSocketContext);

  if (!ws) {
    throw new Error('ws must be within WebSocketContext');
  }

  return {
    ws,
  };
};
