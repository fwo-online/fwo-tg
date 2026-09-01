import type { Action, ClanPublic, GameStatus, Order, Player } from '@fwo/shared';
import { onMount } from 'svelte';
import { goto, invalidate } from '$app/navigation';
import { popup } from '$lib/components/Popup/popup.svelte';
import { getCharacterContext } from '$lib/constext/character';
import { getSocket } from '$lib/constext/socket';
import { showGameResult } from '$lib/game/utils/result.svelte';
import { onSocket } from '$lib/utils/on-socket';

export type GameState = {
  round: number;
  orders: Order[];
  players: Record<string, Player>;
  clans: Record<string, ClanPublic>;
  canOrder: boolean;
  status: GameStatus[];
  statusByClan: Partial<Record<string, GameStatus[]>>;
  power: number;
  actions: Action[];
  magics: Action[];
  skills: Action[];
  ordersTime: number;
  ordersStartTime: number;
  ready: boolean;
};

const createGameState = (): GameState => ({
  round: 0,
  players: {},
  clans: {},
  canOrder: false,
  actions: [],
  magics: [],
  skills: [],
  power: 0,
  orders: [],
  status: [],
  statusByClan: {},
  ordersTime: 0,
  ordersStartTime: 0,
  ready: false,
});

export const game = $state(createGameState());

export function resetGame() {
  Object.assign(game, createGameState());
}

export function initGameState() {
  const socket = getSocket();
  const character = getCharacterContext();

  const startGame = async () => {
    const res = await socket.emitWithAck('game:connected');

    if (!res.error) {
      game.players = res.players;
      game.clans = res.clans;
    } else {
      await invalidate('app:character');
      goto('#/');
      popup.info({ title: 'Не удалось подключиться к игре', message: res.message });
    }
  };

  onMount(() => {
    if (socket.connected) {
      startGame();
    } else {
      socket.once('connect', startGame);
    }
  });

  onSocket('game:players', ({ players, clans }) => {
    game.players = players;
    game.clans = clans;
  });

  onSocket('game:startRound', ({ round, status }) => {
    game.round = round;
    game.statusByClan = status;
  });

  onSocket(
    'game:startOrders',
    ({ actions, magics, skills, orders, power, ordersTime, ordersStartTime, ready }) => {
      game.actions = actions;
      game.magics = magics;
      game.skills = skills;
      game.orders = orders;
      game.power = power;
      game.ordersStartTime = ordersStartTime;
      game.ordersTime = ordersTime;
      game.ready = ready;
      game.canOrder = true;
    },
  );

  onSocket('game:endOrders', () => {
    game.canOrder = false;
    game.orders = [];
  });

  onSocket('game:end', (results) => {
    const charID = character().id;
    const result = results.find((result) => result.player.id === charID);
    showGameResult(result);
    goto('#/');
  });

  onSocket('game:preKick', () => {
    popup.info({
      message: 'Вы будете выброшены из игры в следующем раунде, если не сделаете заказ',
    });
  });

  onSocket('game:kick', async ({ player }) => {
    if (player.id === character().id) {
      await invalidate('app:character');
      goto('#/');
      popup.info({ message: 'Вы были выброшены из игры' });
    }
  });
}
