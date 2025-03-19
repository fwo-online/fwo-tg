export type Action = {
  name: string;
  displayName: string;
  orderType: 'all' | 'any' | 'enemy' | 'self' | 'team' | 'teamExceptSelf';
  cost?: number;
  costType?: 'mp' | 'en';
  power?: number;
};
