import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/shared';
import type { Socket } from 'socket.io-client';
import { createContext } from 'svelte';

export const [getSocketContext, setSocketContext] =
  createContext<() => Socket<ServerToClientMessage, ClientToServerMessage>>();
