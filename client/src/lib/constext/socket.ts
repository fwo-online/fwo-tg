import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/shared';
import type { Socket } from 'socket.io-client';

export let socket: Socket<ServerToClientMessage, ClientToServerMessage> | undefined;

export const setSocket = (value: Socket<ServerToClientMessage, ClientToServerMessage>) => {
  socket = value;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket is not loaded');
  }

  return socket;
};
