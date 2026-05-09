import { vValidator as vv } from '@hono/valibot-validator';
import { HTTPException } from 'hono/http-exception';
import * as v from 'valibot';

export const vValidator = <P extends Parameters<typeof vv>[0], T extends Parameters<typeof vv>[1]>(
  target: P,
  schema: T,
) =>
  vv(target, schema, (result) => {
    if (!result.success) {
      throw new HTTPException(400, {
        cause: new v.ValiError(result.issues),
      });
    }
  });
