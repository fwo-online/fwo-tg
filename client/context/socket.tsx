import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/shared';
import { createContext } from 'react';
import type { Socket } from 'socket.io-client';

export const SocketContext = createContext<
  Socket<ServerToClientMessage, ClientToServerMessage> | undefined
>(undefined);
