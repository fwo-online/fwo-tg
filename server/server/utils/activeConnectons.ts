import type { Server, Socket } from '@/server/ws';
import type { User } from '@telegram-apps/init-data-node';

export const activeConnections = new Map<string, Socket>();

export const checkActiveConnection = (_io: Server, socket: Socket, user: User) => {
  const activeSocket = activeConnections.get(user.id.toString());

  if (activeSocket) {
    if (activeSocket?.connected) {
      return false;
    }
  }

  activeConnections.set(user.id.toString(), socket);

  return true;
};
