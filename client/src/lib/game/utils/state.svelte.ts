import type {
  Action,
  ClanPublic,
  GameStatus,
  Order,
  Player,
  ServerToClientMessage,
} from '@fwo/shared';
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

  const handlePlayers = ({
    players,
    clans,
  }: Parameters<ServerToClientMessage['game:players']>[0]) => {
    game.players = players;
    game.clans = clans;
  };

  const handleStartGame = async () => {
    const res = await socket.emitWithAck('game:connected');

    if (!res.error) {
      game.players = res.players;
      game.clans = res.clans;
    } else {
      await invalidate('app:character');
      goto('/');
      popup.info({ title: 'Не удалось подключиться к игре', message: res.message });
    }
  };

  const handleStartRound = ({
    round,
    status,
  }: Parameters<ServerToClientMessage['game:startRound']>[0]) => {
    game.round = round;
    game.statusByClan = status;
  };

  const handleStartOrders = ({
    actions,
    magics,
    skills,
    orders,
    power,
    ordersTime,
    ordersStartTime,
    ready,
  }: Parameters<ServerToClientMessage['game:startOrders']>[0]) => {
    game.actions = actions;
    game.magics = magics;
    game.skills = skills;
    game.orders = orders;
    game.power = power;
    game.ordersStartTime = ordersStartTime;
    game.ordersTime = ordersTime;
    game.ready = ready;
    game.canOrder = true;
  };

  const handleEndOrders = () => {
    game.canOrder = false;
    game.orders = [];
  };

  const handleEndGame = (results: Parameters<ServerToClientMessage['game:end']>[0]) => {
    goto('/');
    showGameResult(results);
  };

  const handlePreKick = () => {
    popup.info({
      message: 'Вы будете выброшены из игры в следующем раунде, если не сделаете заказ',
    });
  };

  const handleKick = async ({ player }: Parameters<ServerToClientMessage['game:kick']>[0]) => {
    if (player.id === character().id) {
      await invalidate('app:character');
      goto('/');
      popup.info({ message: 'Вы были выброшены из игры' });
    }
  };

  onMount(() => {
    if (socket.connected) {
      handleStartGame();
    } else {
      socket.once('connect', handleStartGame);
    }
  });

  onSocket('game:players', handlePlayers);
  onSocket('game:startRound', handleStartRound);
  onSocket('game:startOrders', handleStartOrders);
  onSocket('game:endOrders', handleEndOrders);
  onSocket('game:end', handleEndGame);
  onSocket('game:preKick', handlePreKick);
  onSocket('game:kick', handleKick);
}
