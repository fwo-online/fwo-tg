import type { Server, Socket } from '@/server/ws';
import type { User } from '@telegram-apps/init-data-node';

export const activeConnections = new Map<string, string>();

export const checkActiveConnection = async (io: Server, socket: Socket, user: User) => {
  const activeConnection = activeConnections.get(user.id.toString());

  if (activeConnection) {
    const socketConnection = io.sockets.sockets.get(activeConnection);

    if (socketConnection?.connected) {
      throw new Error('No multiple connections');
    }
  }

  activeConnections.set(user.id.toString(), socket.id);
};
