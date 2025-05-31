import { useSocket } from '@/stores/socket';
import type { ServerToClientMessage } from '@fwo/shared';
import { useEffect } from 'react';

export function useSocketListener<K extends keyof ServerToClientMessage>(
  event: K,
  handler: ServerToClientMessage[K],
) {
  const socket = useSocket();
  useEffect(() => {
    socket.on(event, handler as any);
    return () => {
      socket.off(event, handler as any);
    };
  }, [socket.on, socket.off, event, handler]);
}
