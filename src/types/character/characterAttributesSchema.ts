import type { characterAttributesSchema } from '@/schemas/character';
import type { z } from 'zod';

export type CharacterAttributes = z.infer<typeof characterAttributesSchema>;
