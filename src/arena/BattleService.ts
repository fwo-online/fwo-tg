import { Markup } from 'telegraf';
import BattleKeyboard from '@/helpers/BattleKeyboard';
import * as channelHelper from '../helpers/channelHelper';
import OrderError from './errors/OrderError';
import type Game from './GameService';
import arena from './index';

type BattleReply = {
  message: string;
  keyboard: ReturnType<typeof Markup.button.callback>[][];
}

/**
 * Заказываем в три этапа:
 * 1. Выбор умения (action_{attack})
 * 2. Выбор цели ({attack}_{target})
 * 3. Выбор силы ({attack}_{target}_{proc})
 */

const getActions = () => ({ ...arena.actions, ...arena.skills, ...arena.magics });

const getText = {
  order: (proc: number) => `У тебя осталось *${proc}%*
Заказы:\n`,
  proc: (displayName: string, target: string) => `Выбери силу _${displayName}_ на ${target ? `игрока ${target}` : 'себя'}`,
  target: (displayName: string) => `Выбери цель для _${displayName}_`,
};

function getCurrentOrders(charId: string, game: Game) {
  return game.orders.getPlayerOrders(charId)
    .map((o) => {
      if (o.target === charId) {
        return `_${getActions()[o.action].displayName}_ (*${o.proc}%*) на *себя*`;
      }
      const target = game.players.getById(o.target);
      if (!target) {
        throw new OrderError('Игрок не найден');
      }
      return `_${getActions()[o.action].displayName}_ (*${o.proc}%*) на игрока *${target.nick}*`;
    })
    .join('\n');
}

function getTargetKeyboard(charId: string, game: Game, action: string) {
  const player = game.players.getById(charId);
  if (!player) {
    throw new OrderError('Игрок не найден');
  }
  const { orderType } = getActions()[action];
  const proc = arena.skills[action] ? `_${arena.skills[action].proc}` : '';
  return game.players.alivePlayers
    .filter((target) => (orderType === 'enemy' ? !game.isPlayersAlly(player, target) : true))
    .map(({ nick, id }) => Markup.button.callback(nick, `${action}_${id}${proc}`));
}

/**
 * Возвращает кнопки с процентом заказа
 */
function getProcentKeyboard(action: string, target: string, proc: number) {
  return Array
    .from(new Set([5, 10, 25, 50, 75, proc]))
    .filter((key) => key <= proc)
    .map((key) => Markup.button.callback(key.toString(), `${action}_${target}_${key}`));
}

/**
 * Сообщение для первого этапа
 * @param charId
 * @param game
 */
function orderMessage(charId: string, game: Game): BattleReply {
  const player = game.players.getById(charId);
  if (!player) {
    throw new OrderError('Игрок не найден');
  }
  const message = getText.order(player.proc)
    .concat(getCurrentOrders(charId, game));
  const keyboard = channelHelper.getOrderButtons(player);
  return { message, keyboard };
}

/**
 * Сообщение для второго этапа
 */
function targetMessage(charId: string, game: Game, action: string): BattleReply {
  const { displayName } = getActions()[action];
  const message = getText.target(displayName);
  const keyboard = [
    getTargetKeyboard(charId, game, action),
    [Markup.button.callback('🔙 Назад', 'back')],
  ];
  return { message, keyboard };
}

type PercentMessageParams = {
  initiator: string;
  game: Game;
  action: string;
  target: string;
  isSelfAction?: boolean;
}
/**
 * Сообщение для третьего этапа
 */
function percentMessage({
  initiator: initiatorId, game, action, target: targetId, isSelfAction = false,
}: PercentMessageParams) {
  const initiator = game.players.getById(initiatorId);
  if (!initiator) {
    throw new OrderError('Игрок не найден');
  }
  const target = game.players.getById(targetId);
  if (!target) {
    throw new OrderError('Игрок не найден');
  }
  const { displayName } = getActions()[action];
  const backButtonData = isSelfAction ? 'back' : `action_${action}`;
  const message = getText.proc(displayName, isSelfAction ? '' : target.nick);
  const keyboard = [
    getProcentKeyboard(action, targetId, initiator.proc),
    [Markup.button.callback('🔙 Назад', backButtonData)],
  ];
  return { message, keyboard };
}

export function getDefaultMessage(charId: string, game: Game): BattleReply {
  return orderMessage(charId, game);
}

export function getAllMagicsMessage(charId: string, game: Game): BattleReply {
  const player = game.players.getById(charId);
  if (!player) {
    throw new OrderError('Игрок не найден');
  }
  const message = 'Список всех магий';

  const keyboard = [
    ...new BattleKeyboard(player).setMagics(true).render(true),
    [Markup.button.callback('Назад', 'back')],
  ];

  return { message, keyboard };
}
/**
   * Обработка выбранного действия (первый этап)
   */
export function handleAction(initiator: string, game: Game, action: string): BattleReply {
  if (action === 'repeat') return repeatOrder(initiator, game);
  if (action === 'reset') return resetOrder(initiator, game);

  const { orderType } = getActions()[action];
  const proc = arena.skills[action] ? arena.skills[action].proc : undefined;

  // Если умение направлено на себя и имеет процент (умения), то делаем заказ сразу
  if (orderType === 'self') {
    if (typeof proc !== 'undefined') {
      game.orders.orderAction({
        initiator, target: initiator, action, proc,
      });
      return orderMessage(initiator, game);
    }
    return percentMessage({
      initiator, game, action, target: initiator, isSelfAction: true,
    });
  }
  return targetMessage(initiator, game, action);
}
/**
 * Обработка выбранной цели (второй этап)
 */
// eslint-disable-next-line max-len
export function handleTarget(initiator: string, game: Game, action: string, target: string): BattleReply {
  const proc = arena.skills[action] ? arena.skills[action].proc : undefined;

  if (typeof proc !== 'undefined') {
    game.orders.orderAction({
      initiator, target, action, proc,
    });
    return orderMessage(initiator, game);
  }
  return percentMessage({
    initiator, game, action, target,
  });
}
/**
 * Обработка выбранных процентов (третий этап)
 */
// eslint-disable-next-line max-len
export function handlePercent(charId: string, game: Game, action: string, target: string, proc: number): BattleReply {
  game.orders.orderAction({
    initiator: charId, target, action, proc,
  });
  return orderMessage(charId, game);
}

export function repeatOrder(charId: string, game: Game): BattleReply {
  game.orders.repeatLastOrder(charId);
  return orderMessage(charId, game);
}

export function resetOrder(charId: string, game: Game): BattleReply {
  game.orders.resetOrdersForPlayer(charId);
  return orderMessage(charId, game);
}
