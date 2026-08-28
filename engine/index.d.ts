export interface EngineStatus {
  ready: boolean;
  version: string;
  engineName: string;
}

export declare function ping(msg: string): string;
export declare function floatNumber(val: number): number;
export declare function getEngineStatus(): EngineStatus;

declare const _default: {
  ping: typeof ping;
  floatNumber: typeof floatNumber;
  getEngineStatus: typeof getEngineStatus;
};

export default _default;
