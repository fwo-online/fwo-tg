import type { Breaks, PhysBreak, SuccessArgs } from '../Constuructors/types';

export type FailArgs = Breaks | PhysBreak;

export type LogMessage = (SuccessArgs & { __success: true } | (FailArgs & { __success: false }));
