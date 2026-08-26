import { randomBytes } from 'node:crypto';
import type { CombatEvent, CombatEventType } from '@fwo/shared';
import type { FailArgs, SuccessArgs } from '@/arena/Constuructors/types';
import { isSuccessResult } from '@/arena/Constuructors/utils';
import type { HistoryItem } from '@/arena/HistoryService/HistoryService';
import { calculateEffect } from '@/arena/HistoryService/utils/calculateEffect';
import { formatAction } from '@/arena/LogService/utils/format-action';

function getSuccessEventType(item: SuccessArgs): CombatEventType {
  if (item.actionType === 'heal' || item.actionType === 'heal-magic') {
    return 'heal';
  }
  if (
    Boolean(item.effectType) ||
    item.actionType === 'phys' ||
    item.actionType === 'dmg-magic' ||
    item.actionType === 'dmg-magic-long' ||
    item.actionType === 'aoe-dmg-magic'
  ) {
    return 'damage';
  }
  if (item.actionType === 'protect') {
    return 'block';
  }
  if (item.actionType === 'dodge') {
    return 'dodge';
  }
  if (item.orderType === 'enemy') {
    return 'debuff';
  }
  return 'buff';
}

function getFailEventType(item: FailArgs): CombatEventType {
  if (typeof item.reason === 'object') {
    const reason = Array.isArray(item.reason) ? item.reason[0] : item.reason;
    if (reason?.actionType === 'dodge' || reason?.action === 'dodge') {
      return 'dodge';
    }
    if (
      reason?.actionType === 'protect' ||
      reason?.action === 'protect' ||
      reason?.action === 'shieldBlock'
    ) {
      return 'block';
    }
  }
  return 'miss';
}

export function serializeCombatEvents(history: HistoryItem[]): CombatEvent[] {
  const events: CombatEvent[] = [];

  for (const item of history) {
    const id = randomBytes(6).toString('hex');
    const initiatorId = item.initiator?.id ?? '';
    const initiatorName = item.initiator?.nick ?? '';
    const targetId = item.target?.id ?? '';
    const targetName = item.target?.nick ?? '';

    if (isSuccessResult(item)) {
      const type = getSuccessEventType(item);
      const effect = calculateEffect(item);
      let message = '';
      try {
        message = formatAction(item);
      } catch {
        message = `${initiatorName} -> ${targetName} (${item.action})`;
      }

      events.push({
        id,
        initiatorId,
        initiatorName,
        targetId,
        targetName,
        action: item.action,
        actionType: item.actionType,
        effect: effect > 0 ? effect : undefined,
        effectType: item.effectType,
        type,
        isCrit: item.expArr?.some((e) => (e.val ?? 0) > 0),
        message,
      });

      // Handle affects (e.g. secondary effects or chained results)
      if (item.affects?.length) {
        for (const affect of item.affects) {
          const affectId = randomBytes(6).toString('hex');
          const affectType = getSuccessEventType(affect);
          const affectVal = calculateEffect(affect);

          events.push({
            id: affectId,
            initiatorId: affect.initiator?.id ?? initiatorId,
            initiatorName: affect.initiator?.nick ?? initiatorName,
            targetId: affect.target?.id ?? targetId,
            targetName: affect.target?.nick ?? targetName,
            action: affect.action,
            actionType: affect.actionType,
            effect: affectVal > 0 ? affectVal : undefined,
            effectType: affect.effectType,
            type: affectType,
            message: `${affect.target?.nick ?? targetName}: ${affect.action}`,
          });
        }
      }
    } else {
      const type = getFailEventType(item);
      events.push({
        id,
        initiatorId,
        initiatorName,
        targetId,
        targetName,
        action: item.action,
        actionType: item.actionType,
        type,
        message:
          type === 'dodge'
            ? `${targetName} увернулся от атаки ${initiatorName}`
            : type === 'block'
              ? `${targetName} заблокировал атаку ${initiatorName}`
              : `${initiatorName} промахнулся по ${targetName}`,
      });
    }
  }

  return events;
}
