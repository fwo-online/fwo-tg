export type CostType = 'en' | 'mp';
export type OrderType = 'all' | 'any' | 'enemy' | 'self';
export type AOEType = 'target' | 'team';
export type ActionType = 'magic' | 'heal' | 'phys' | 'skill'

export interface Breaks {
  actionType: ActionType
  message: string;
  action: string;
  initiator: string;
  target: string;
}
