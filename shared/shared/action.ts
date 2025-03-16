export type Action = {
  name: string;
  displayName: string;
  orderType: 'all' | 'any' | 'enemy' | 'self' | 'team' | 'teamExceptSelf';
} & (
  | {
      cost: number | number[];
      costType: 'mp' | 'en';
    }
  | {
      cost?: never;
      costType?: never;
    }
);
