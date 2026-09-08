import { describe, expect, it } from 'bun:test';
import type { SuccessArgs } from '../types';
import { getFailReasons, hasReasonActionType } from './index';

describe('Constuructors/utils reason helpers', () => {
  const fakeDodgeReason = {
    action: '🐍 Увертка',
    actionType: 'dodge',
  } as SuccessArgs;

  const fakeProtectReason = {
    action: 'Защита',
    actionType: 'protect',
  } as SuccessArgs;

  describe('getFailReasons', () => {
    it('should return empty array for string BreaksMessage', () => {
      expect(getFailReasons('NO_ENERGY')).toEqual([]);
      expect(getFailReasons('CHANCE_FAIL')).toEqual([]);
      expect(getFailReasons('SKILL_FAIL')).toEqual([]);
    });

    it('should wrap a single SuccessArgs in an array', () => {
      expect(getFailReasons(fakeDodgeReason)).toEqual([fakeDodgeReason]);
    });

    it('should return array of SuccessArgs as-is', () => {
      expect(getFailReasons([fakeDodgeReason, fakeProtectReason])).toEqual([
        fakeDodgeReason,
        fakeProtectReason,
      ]);
    });
  });

  describe('hasReasonActionType', () => {
    it('should return false for string BreaksMessage', () => {
      expect(hasReasonActionType('NO_ENERGY', 'dodge')).toBe(false);
      expect(hasReasonActionType('PHYS_FAIL', 'dodge', 'protect')).toBe(false);
    });

    it('should return true when single SuccessArgs matches one of actionTypes', () => {
      expect(hasReasonActionType(fakeDodgeReason, 'dodge')).toBe(true);
      expect(hasReasonActionType(fakeDodgeReason, 'protect', 'dodge')).toBe(true);
      expect(hasReasonActionType(fakeDodgeReason, 'protect')).toBe(false);
    });

    it('should return true when array has matching actionType', () => {
      expect(hasReasonActionType([fakeDodgeReason, fakeProtectReason], 'protect')).toBe(true);
      expect(hasReasonActionType([fakeDodgeReason, fakeProtectReason], 'dodge')).toBe(true);
      expect(hasReasonActionType([fakeDodgeReason, fakeProtectReason], 'miss')).toBe(false);
    });
  });
});
