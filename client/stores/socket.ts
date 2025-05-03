import { create } from 'zustand';
import { createWebSocket } from '@/api';
import type { ServerToClientMessage, ClientToServerMessage } from '@fwo/shared';
import type { Socket } from 'socket.io-client';

interface SocketState {
  socket: Socket<ServerToClientMessage, ClientToServerMessage> | null;
  connect: () => Promise<Socket<ServerToClientMessage, ClientToServerMessage>>;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  connect: async () => {
    const connectedSocket = get().socket;
    if (connectedSocket) {
      return connectedSocket;
    }

    const socket = await createWebSocket();

    set({ socket });

    return socket;
  },
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },
}));

export const useSocket = () => {
  const socket = useSocketStore((state) => state.socket);

  if (!socket) {
    throw new Error('WebSocket must be connected');
  }

  return socket;
};
