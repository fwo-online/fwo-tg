import { use } from 'react';
import { WebSocketContext } from '@/contexts/webSocket';

export const useWebSocket = () => {
  const context = use(WebSocketContext);

  if (!context) {
    throw new Error('WebSocket must be within WebSocketContext');
  }

  return context;
};
