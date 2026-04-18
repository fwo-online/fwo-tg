import type { ServerToClientMessage } from '@fwo/shared';
import { onMount } from 'svelte';
import { getSocketContext } from '$lib/constext/socket';

export function onSocket<K extends keyof ServerToClientMessage>(
  event: K,
  handler: ServerToClientMessage[K],
) {
  const socket = getSocketContext();

  onMount(() => {
    const listener = handler as any;

    socket().on(event, listener);

    return () => {
      socket().off(event, listener);
    };
  });
}
