import { ForestEventAction, ForestEventType, ForestState } from '@fwo/shared';
import type { ForestEventHandler } from './getEventHandler';
import type { ForestService } from '@/arena/ForestService/ForestService';
import arena from '@/arena';
import { isNotNil, shuffle } from 'es-toolkit';
import MiscService from '@/arena/MiscService';
import { createForestGame } from '@/helpers/gameHelper';

type PvPSession = {
  id: string;
  forestA: ForestService;
  forestB: ForestService;

  enemyAction?: ForestEventAction;
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
          .filter((forest) => forest.forest.state === ForestState.Waiting),
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
    }, 10000);
  }

  static startEvents([forestA, forestB]: [ForestService, ForestService]) {
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
      return;
    }
    session.resolved = true;

    const game = await createForestGame(session.forestA.player, session.forestB.player);

    if (!game) {
      console.error('ForestEnemyPlayerHandler::game not created');
      return;
    }

    session.forestA.startBattle(game);
    session.forestB.startBattle(game);

    this.cleanupSession(session);
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
  if (!session) {
    return {
      success: false,
      resolved: true,
      message: 'Другой игрок скрылся в чаще леса',
    };
  }

  const enemyAction = session.enemyAction;

  if (action === ForestEventAction.Attack) {
    if (!enemyAction) {
      session.enemyAction = ForestEventAction.Attack;

      return {
        success: true,
        resolved: false,
        message: 'Ты решаешь напасть на игрока!',
      };
    }

    if (enemyAction === ForestEventAction.Attack) {
      ForestEnemyPlayerHandler.startGame(session);

      return {
        success: true,
        resolved: true,
        message: 'Ты решаешь напасть на игрока! Игрок готов принять бой!',
      };
    }

    if (enemyAction === ForestEventAction.PassBy) {
      if (MiscService.chance(50)) {
        ForestEnemyPlayerHandler.startGame(session);

        return {
          success: true,
          resolved: true,
          message: 'Ты решаешь напасть на игрока! Игрок пытался сбежать, но ты нагнал его!',
        };
      }

      ForestEnemyPlayerHandler.endSession(session);
      return {
        success: false,
        resolved: true,
        message:
          'Ты решаешь напасть на игрока! Игрок пытается сбежать! У тебя не получилось его догнать',
      };
    }

    return {
      success: true,
      resolved: false,
      message: 'Ты решаешь напасть на игрока!',
    };
  }

  if (enemyAction === ForestEventAction.Attack) {
    if (MiscService.chance(50)) {
      ForestEnemyPlayerHandler.endSession(session);
      return {
        success: true,
        resolved: true,
        message:
          'Ты решаешь пройти мимо. Ты замечаешь попытку игрока напасть на тебя, но скрываешься в чаще леса',
      };
    }

    ForestEnemyPlayerHandler.startGame(session);
    return {
      success: false,
      resolved: true,
      message:
        'Ты решаешь пройти мимо. Ты пытаешься скрыться в чаще леса, но игрок догоняет тебя. Защищайся!',
    };
  }

  if (enemyAction === ForestEventAction.PassBy) {
    ForestEnemyPlayerHandler.endSession(session);
    return {
      success: true,
      resolved: true,
      message: 'Ты решаешь пройти мимо. Каждый идёт своей дорогой',
    };
  }

  return {
    success: true,
    resolved: false,
    message: 'Ты решаешь пройти мимо. Игрок всё ещё оценивает ситуацию',
  };
};
