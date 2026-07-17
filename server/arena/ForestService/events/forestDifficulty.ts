import { ForestPhase } from '@fwo/shared';

/**
 * Phase difficulty multipliers for forest monsters.
 * These replace the old flat +0/+2/+4 level addition.
 *
 * Edge:  slightly easier than equal-level player.
 * Wilds: approaching parity.
 * Deep:  slightly harder than equal level.
 *
 * Target win rates with these multipliers:
 *   Edge: ~85%  Wilds: ~70%  Deep: ~55%
 */
export const FOREST_PHASE_DIFFICULTY: Record<ForestPhase, number> = {
  [ForestPhase.Edge]: 0.75,
  [ForestPhase.Wilds]: 0.9,
  [ForestPhase.Deep]: 1.1,
};
