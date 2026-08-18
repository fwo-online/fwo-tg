import { popup } from '$lib/components/Popup/popup.svelte';
import { getSocket } from '$lib/constext/socket';
import { game } from '$lib/game/utils/state.svelte';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

export const toggleReady = createRequestRunner(async () => {
  const socket = getSocket();

  const res = await socket.emitWithAck('game:order:ready', !game.ready);
  if (!res.error) {
    game.ready = res.ready;
  } else {
    popup.info({ message: res.message });
  }
});
