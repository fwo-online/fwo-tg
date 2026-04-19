import { useContext } from 'react';
import { SocketContext } from '@/context/socket';

export const useSocket = () => {
  const socket = useContext(SocketContext);

  if (!socket) {
    throw new Error('WebSocket must be connected');
  }

  return socket;
};
