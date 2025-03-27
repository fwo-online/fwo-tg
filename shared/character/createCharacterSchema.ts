import * as v from 'valibot';
import { characterClassSchema } from './characterClassSchema';

export const characterNicknameSchema = v.pipe(
  v.string(),
  v.trim(),
  v.minLength(3, 'Не менее 3 символов'),
  v.maxLength(16, 'Не более 16 символов'),
  v.regex(/^[а-яА-ЯёЁa-zA-Z0-9]+$/, 'Не должно содержать спецсимволов'),
);

export const createCharacterSchema = v.object({
  name: characterNicknameSchema,
  class: characterClassSchema,
});

export type CreateCharacterDto = v.InferOutput<typeof createCharacterSchema>;
