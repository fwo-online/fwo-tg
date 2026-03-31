import { ForestEventAction, ForestEventType, ForestState } from '@fwo/shared';
import { isNotNil, shuffle } from 'es-toolkit';
import arena from '@/arena';
import ValidationError from '@/arena/errors/ValidationError';
import type { ForestService } from '@/arena/ForestService/ForestService';
import { createForestGame } from '@/helpers/gameHelper';
import type { ForestEventHandler } from './getEventHandler';

type PvPSession = {
  id: string;
  forestA: ForestService;
  forestB: ForestService;
  actionA?: ForestEventAction;
  actionB?: ForestEventAction;
  resolved: boolean;
};

class ForestEnemyPlayerHandler {
  static sessions = new Map<string, PvPSession>();
  static forestToSession = new Map<string, PvPSession>();

  static {
    setInterval(() => {
      const forests = shuffle(
        Object.values(arena.forests)
          .filter(isNotNil)
          .filter((forest) => forest.forest.state === ForestState.Waiting)
          .filter((forest) => !this.forestToSession.has(forest.id)),
      );
      const used = new Set<string>();

      for (let i = 0; i < forests.length; i++) {
        if (used.has(forests[i].id)) {
          continue;
        }

        for (let j = i + 1; j < forests.length; j++) {
          if (used.has(forests[j].id)) {
            continue;
          }

          const lvlDiff = Math.abs(forests[i].player.lvl - forests[j].player.lvl);

          if (lvlDiff <= 1) {
            this.startEvents([forests[i], forests[j]]);

            used.add(forests[i].id);
            used.add(forests[j].id);

            break;
          }
        }
      }
    }, 25000);
  }

  static startEvents([forestA, forestB]: [ForestService, ForestService]) {
    if (this.forestToSession.has(forestA.id) || this.forestToSession.has(forestB.id)) {
      return;
    }

    const sessionId = crypto.randomUUID();

    const session: PvPSession = {
      id: sessionId,
      forestA,
      forestB,
      resolved: false,
    };

    this.sessions.set(sessionId, session);
    this.forestToSession.set(forestA.id, session);
    this.forestToSession.set(forestB.id, session);

    forestA.pauseForest();
    forestB.pauseForest();

    forestA.createEvent(ForestEventType.OtherPlayer);
    forestB.createEvent(ForestEventType.OtherPlayer);
  }

  static async startGame(session: PvPSession) {
    if (session.resolved) {
      return false;
    }
    session.resolved = true;

    const game = await createForestGame(session.forestA.player, session.forestB.player);

    if (!game) {
      console.error('ForestEnemyPlayerHandler::game not created');

      session.forestA.resumeForest();
      session.forestB.resumeForest();

      this.cleanupSession(session);
      return false;
    }

    await Promise.all([
      session.forestA.startBattle(game, session.forestB.player.stats.collect),
      session.forestB.startBattle(game, session.forestA.player.stats.collect),
    ]);

    this.cleanupSession(session);
    return true;
  }

  static endSession(session: PvPSession) {
    if (session.resolved) {
      return;
    }
    session.resolved = true;

    session.forestA.resumeForest();
    session.forestB.resumeForest();

    this.cleanupSession(session);
  }

  static cleanupSession(session: PvPSession) {
    this.sessions.delete(session.id);
    this.forestToSession.delete(session.forestA.id);
    this.forestToSession.delete(session.forestB.id);
  }
}

export const handleOtherPlayerEvent: ForestEventHandler = async (action, forest) => {
  const session = ForestEnemyPlayerHandler.forestToSession.get(forest.id);
  console.debug(
    `Forest debug:: ${forest.id} handling other player event action ${action}, session: ${session?.id}`,
  );
  if (!session) {
    return {
      success: false,
      resolved: true,
      message: 'Другой игрок скрылся в чаще леса',
    };
  }

  const isA = session.forestA.id === forest.id;
  const ownAction = isA ? session.actionA : session.actionB;
  const enemyAction = isA ? session.actionB : session.actionA;

  console.debug(
    `Forest debug:: ${forest.id} action ${ownAction} enemy action ${enemyAction}, session: ${session.id}`,
  );

  if (ownAction) {
    return {
      success: false,
      resolved: true,
      message: 'Ты уже сделал свой выбор, жди решения другого игрока',
    };
  }

  if (isA) {
    session.actionA = action;
  } else {
    session.actionB = action;
  }

  if (enemyAction === ForestEventAction.Attack) {
    if (action === ForestEventAction.Attack) {
      const started = await ForestEnemyPlayerHandler.startGame(session);
      if (!started) {
        return {
          success: false,
          resolved: true,
          message: 'Бой не состоялся. Другой игрок скрылся в чаще леса',
        };
      }

      return {
        success: true,
        resolved: true,
        message: 'Ты решаешь напасть на игрока! Игрок готов принять бой!',
      };
    }

    if (action === ForestEventAction.PassBy) {
      ForestEnemyPlayerHandler.endSession(session);
      return {
        success: true,
        resolved: true,
        message:
          'Ты решаешь пройти мимо. Игрок пытался атаковать тебя, но ты смог скрыться в чаще леса!',
      };
    }
  }

  if (enemyAction === ForestEventAction.PassBy) {
    if (action === ForestEventAction.Attack) {
      ForestEnemyPlayerHandler.endSession(session);
      return {
        success: false,
        resolved: true,
        message:
          'Ты решаешь напасть на игрока! Игрок пытается сбежать! У тебя не получилось его догнать',
      };
    }

    if (action === ForestEventAction.PassBy) {
      ForestEnemyPlayerHandler.endSession(session);
      return {
        success: true,
        resolved: true,
        message: 'Ты решаешь пройти мимо. Каждый идёт своей дорогой',
      };
    }
  }

  if (action === ForestEventAction.Attack) {
    return {
      success: true,
      resolved: false,
      message: 'Ты решаешь напасть на игрока! Игрок всё ещё оценивает ситуацию...',
    };
  }

  if (action === ForestEventAction.PassBy) {
    return {
      success: true,
      resolved: false,
      message: 'Ты решаешь пройти мимо. Игрок всё ещё оценивает ситуацию...',
    };
  }

  console.warn(
    `Forest warn:: unknown action ${action}, enemy action ${enemyAction}, session: ${session.id}`,
  );
  throw new ValidationError(`Неизвестное действие ${action}`);
};
