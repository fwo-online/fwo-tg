import type { OrderResponse } from '@fwo/shared';
import { pick } from 'es-toolkit';
import { popup } from '$lib/components/Popup/popup.svelte';
import { getSocket } from '$lib/constext/socket';
import { game } from '$lib/game/utils/state.svelte';
import { createRequestRunner } from '$lib/utils/create-request.svelte';

const handleResponse = (res: OrderResponse) => {
  if (res.error) {
    popup.info({ message: res.message });
  } else {
    game.orders = res.orders;
    game.power = res.power;
    const { actions, magics, skills } = pick(res, ['actions', 'magics', 'skills']);
    game.actions = actions;
    game.magics = magics;
    game.skills = skills;
  }
};

export const orderAction = createRequestRunner(
  async (action: string, target: string, power: number) => {
    const socket = getSocket();
    const res = await socket.emitWithAck('game:order', { power, target, action });
    handleResponse(res);
  },
);

export const repeatOrders = createRequestRunner(async () => {
  const socket = getSocket();
  const res = await socket.emitWithAck('game:order:repeat');
  handleResponse(res);
});

export const resetOrders = createRequestRunner(async () => {
  const socket = getSocket();
  const res = await socket.emitWithAck('game:order:reset');
  handleResponse(res);
});

export const removeOrder = createRequestRunner(async (orderID: string) => {
  const socket = getSocket();
  const res = await socket.emitWithAck('game:order:remove', orderID);
  handleResponse(res);
});
