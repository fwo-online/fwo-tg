import type { CharacterService } from '@/arena/CharacterService';
import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/schemas';
import type { Server as IOServer, Socket as IOSocket } from 'socket.io';
import * as game from './game';
import * as lobby from './lobby';
import * as matchMaking from './matchMaking';
import * as character from './character';

export type Server = IOServer<
  ClientToServerMessage,
  ServerToClientMessage,
  {},
  { character: CharacterService }
>;
export type Socket = IOSocket<
  ClientToServerMessage,
  ServerToClientMessage,
  {},
  { character: CharacterService }
>;

export const middleware = (socket: Socket, next: (error?: Error) => void) => {
  character.middleware(socket, next);
};

export const onCreate = (io: Server) => {
  game.onCreate(io);
};

export const onConnection = (io: Server, socket: Socket) => {
  character.onConnection(io, socket);
  lobby.onConnection(io, socket);
  matchMaking.onConnection(io, socket);
  game.onConnection(io, socket);
};
