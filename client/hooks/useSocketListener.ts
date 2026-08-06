import type { ServerToClientMessage } from '@fwo/shared';
import { createEffect, onCleanup } from 'solid-js';
import { socketStore } from '@/context/socket';
// import { socketStore } from '@/stores/socket';

export function useSocketListener<K extends keyof ServerToClientMessage>(
  event: K,
  handler: ServerToClientMessage[K],
) {
  createEffect(
    () => socketStore.socket(),
    (socket) => {
      if (!socket) return;

      // @ts-expect-error
      socket.on(event, handler);

      onCleanup(() => {
        // @ts-expect-error
        socket.off(event, handler);
      });
    },
  );
}
