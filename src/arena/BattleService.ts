import { Markup } from 'telegraf';
import * as channelHelper from '../helpers/channelHelper';
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

/**
 * @param charId
 * @param game
 */
function getCurrentOrders(charId: string, game: Game) {
  return game.orders.getPlayerOrders(charId)
    .map((o) => {
      if (o.target === charId) {
        return `_${getActions()[o.action].displayName}_ (*${o.proc}%*) на *себя*`;
      }
      return `_${getActions()[o.action].displayName}_ (*${o.proc}%*) на игрока *${game.players[o.target].nick}*`;
    })
    .join('\n');
}

/**
 * @param charId
 * @param game
 * @param action
 */
function getTargetKeyboard(charId: string, game: Game, action: string) {
  const player = game.players[charId];
  const { orderType } = getActions()[action];
  const proc = arena.skills[action] ? `_${arena.skills[action].proc}` : '';
  return game.alivePlayers
    .filter((target) => (orderType === 'enemy' ? !game.isPlayersAlly(player, target) : true))
    .map(({ nick, id }) => Markup.button.callback(nick, `${action}_${id}${proc}`));
}

/**
 * Возвращает кнопки с процентом заказа
 * @param action
 * @param target
 * @param proc
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
  const player = game.players[charId];
  const message = getText.order(player.proc)
    .concat(getCurrentOrders(charId, game));
  const keyboard = channelHelper.getOrderButtons(player);
  return { message, keyboard };
}

/**
 * Сообщение для второго этапа
 * @param charId
 * @param game
 * @param action
 */
function targetMessage(charId: string, game: Game, action: string): BattleReply {
  const { displayName } = getActions()[action];
  const message = getText.target(displayName);
  const keyboard = [getTargetKeyboard(charId, game, action)];
  return { message, keyboard };
}

/**
 * Сообщение для третьего этапа
 * @param charId
 * @param game
 * @param action
 * @param targetId
 */
function percentMessage(charId: string, game: Game, action: string, targetId: string): BattleReply {
  const { proc } = game.players[charId];
  const { nick } = game.players[targetId];
  const { displayName } = getActions()[action];
  const message = getText.proc(displayName, targetId === charId ? '' : nick);
  const keyboard = [getProcentKeyboard(action, targetId, proc)];
  return { message, keyboard };
}

export function getDefaultMessage(charId: string, game: Game): BattleReply {
  return orderMessage(charId, game);
}
/**
   * Обработка выбранного действия (первый этап)
   * @param charId
   * @param game
   * @param action
   */
export function handleAction(charId: string, game: Game, action: string): BattleReply {
  if (action === 'repeat') return this.repeatOrder(charId, game);
  if (action === 'reset') return this.resetOrder(charId, game);

  const { orderType } = getActions()[action];
  const proc = arena.skills[action] ? arena.skills[action].proc : undefined;

  // Если умение направлено на себя и имеет процент (умения), то делаем заказ сразу
  if (orderType === 'self') {
    if (typeof proc !== 'undefined') {
      game.orders.orderAction({
        initiator: charId, target: charId, action, proc,
      });
      return orderMessage(charId, game);
    }
    return percentMessage(charId, game, action, charId);
  }
  return targetMessage(charId, game, action);
}
/**
 * Обработка выбранной цели (второй этап)
 * @param charId
 * @param game
 * @param action
 * @param target
 */
// eslint-disable-next-line max-len
export function handleTarget(charId: string, game: Game, action: string, target: string): BattleReply {
  const proc = arena.skills[action] ? arena.skills[action].proc : undefined;

  if (typeof proc !== 'undefined') {
    game.orders.orderAction({
      initiator: charId, target, action, proc,
    });
    return orderMessage(charId, game);
  }
  return percentMessage(charId, game, action, target);
}
/**
 * Обработка выбранных процентов (третий этап)
 * @param charId
 * @param game
 * @param action
 * @param target
 * @param proc
 */
// eslint-disable-next-line max-len
export function handlePercent(charId: string, game: Game, action: string, target: string, proc: number): BattleReply {
  game.orders.orderAction({
    initiator: charId, target, action, proc,
  });
  return orderMessage(charId, game);
}
/**
 * @param charId
 * @param game
 */
export function repeatOrder(charId: string, game: Game): BattleReply {
  game.orders.repeatLastOrder(charId);
  return orderMessage(charId, game);
}
/**
 * @param charId
 * @param game
 */
export function resetOrder(charId: string, game: Game): BattleReply {
  game.orders.resetOrdersForPlayer(charId);
  return orderMessage(charId, game);
}
