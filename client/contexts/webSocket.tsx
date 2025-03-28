import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/shared';
import type { PropsWithChildren } from 'react';
import { createContext, use } from 'react';
import type { Socket } from 'socket.io-client';

export const WebSocketContext = createContext<
  Socket<ServerToClientMessage, ClientToServerMessage> | undefined
>(undefined);

export const WebSocketProvider = ({
  socket,
  children,
}: PropsWithChildren<{
  socket: Promise<Socket<ServerToClientMessage, ClientToServerMessage>>;
}>) => {
  const ws = use(socket);

  return <WebSocketContext value={ws}>{children}</WebSocketContext>;
};

export const useWebSocket = () => {
  const context = use(WebSocketContext);

  if (!context) {
    throw new Error('WebSocket must be within WebSocketContext');
  }

  return context;
};
