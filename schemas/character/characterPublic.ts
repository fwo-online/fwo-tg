import * as v from 'valibot';
import { characterSchema } from './characterSchema';

export const characterPublicSchema = v.pick(characterSchema, ['name', 'lvl', 'class', 'clan']);

export type CharacterPublic = v.InferOutput<typeof characterPublicSchema>;
