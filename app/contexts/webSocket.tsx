import { createWebSocket } from '@/client';
import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/schemas';
import type { PropsWithChildren } from 'react';
import { createContext, use, useState } from 'react';
import type { Socket } from 'socket.io-client';

export const WebSocketContext = createContext<
  Socket<ServerToClientMessage, ClientToServerMessage> | undefined
>(undefined);

export const socket = createWebSocket();

export const WebSocketProvider = ({ children }: PropsWithChildren) => {
  const [ws] = useState(use(socket));

  return <WebSocketContext value={ws}>{children}</WebSocketContext>;
};
