import type { ForestEventAction, ForestEventResult } from '@fwo/shared';
import type { ForestService } from '../ForestService';

export type ForestEventHandler = (
  action: ForestEventAction,
  forest: ForestService,
) => Promise<ForestEventResult>;
