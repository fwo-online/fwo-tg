import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/shared';
import type { Socket } from 'socket.io-client';

import { createSignal } from 'solid-js';

const [socket, setSocket] = createSignal<Socket<
  ServerToClientMessage,
  ClientToServerMessage
> | null>(null);

export const socketStore = {
  socket,
  set: setSocket,
};
