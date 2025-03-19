import type { CharacterService } from '@/arena/CharacterService';
import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/shared';
import type { DefaultEventsMap, Server as IOServer, Socket as IOSocket } from 'socket.io';
import * as game from './game';
import * as lobby from './lobby';
import * as character from './character';

export type Server = IOServer<
  ClientToServerMessage,
  ServerToClientMessage,
  DefaultEventsMap,
  { character: CharacterService }
>;
export type Socket = IOSocket<
  ClientToServerMessage,
  ServerToClientMessage,
  DefaultEventsMap,
  { character: CharacterService }
>;

export const middleware = (io: Server) => (socket: Socket, next: (error?: Error) => void) => {
  character.middleware(io, socket, next);
};

export const onCreate = (io: Server) => {
  game.onCreate(io);
  lobby.onCreate(io);
};

export const onConnection = (io: Server, socket: Socket) => {
  character.onConnection(io, socket);
  lobby.onConnection(io, socket);
  game.onConnection(io, socket);
};
