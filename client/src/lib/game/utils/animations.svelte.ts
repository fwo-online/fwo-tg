import type { CombatEvent, CombatEventType } from '@fwo/shared';

export type FloatingText = {
  id: string;
  text: string;
  type: CombatEventType;
  isCrit?: boolean;
};

export type PlayerAnimState = {
  shaking: boolean;
  flash: 'damage' | 'heal' | null;
  lunge: boolean;
  floatingTexts: FloatingText[];
};

class CombatAnimationStore {
  private playersAnim = $state<Record<string, PlayerAnimState>>({});
  lastEvents = $state<CombatEvent[]>([]);
  lastTickerMessage = $state<string>('');

  get(playerId: string): PlayerAnimState {
    if (!this.playersAnim[playerId]) {
      this.playersAnim[playerId] = {
        shaking: false,
        flash: null,
        lunge: false,
        floatingTexts: [],
      };
    }
    return this.playersAnim[playerId];
  }

  reset() {
    this.playersAnim = {};
    this.lastEvents = [];
    this.lastTickerMessage = '';
  }

  playEvents(events: CombatEvent[]) {
    this.lastEvents = events;
    if (events.length > 0) {
      this.lastTickerMessage = events.map((e) => e.message || e.action).join(' | ');
    }

    events.forEach((event, index) => {
      const delay = index * 180; // 180ms stagger between actions

      setTimeout(() => {
        this.triggerEvent(event);
      }, delay);
    });
  }

  private triggerEvent(event: CombatEvent) {
    const { initiatorId, targetId, type, effect, isCrit, action } = event;

    // 1. Initiator lunge animation
    if (initiatorId && initiatorId !== targetId) {
      const initiatorState = this.get(initiatorId);
      initiatorState.lunge = true;
      setTimeout(() => {
        initiatorState.lunge = false;
      }, 250);
    }

    // 2. Target feedback animation & floating text
    if (targetId) {
      const targetState = this.get(targetId);

      let text = '';
      if (type === 'damage') {
        text = isCrit ? `💥 -${effect ?? 0}` : `-${effect ?? 0}`;
        targetState.shaking = true;
        targetState.flash = 'damage';
      } else if (type === 'heal') {
        text = `+${effect ?? 0} 💚`;
        targetState.flash = 'heal';
      } else if (type === 'dodge') {
        text = '💨 УВОРОТ';
      } else if (type === 'block') {
        text = '🛡️ БЛОК';
      } else if (type === 'miss') {
        text = '❌ ПРОМАХ';
      } else {
        text = `✨ ${action}`;
      }

      // Reset shake & flash after animation duration
      setTimeout(() => {
        targetState.shaking = false;
        targetState.flash = null;
      }, 350);

      // Add floating text
      const floatingId = `${event.id}_${Date.now()}`;
      targetState.floatingTexts.push({
        id: floatingId,
        text,
        type,
        isCrit,
      });

      // Cleanup floating text after float-up animation completes
      setTimeout(() => {
        targetState.floatingTexts = targetState.floatingTexts.filter((t) => t.id !== floatingId);
      }, 950);
    }
  }
}

export const combatAnim = new CombatAnimationStore();
