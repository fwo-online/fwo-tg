import { HTTPException } from 'hono/http-exception';
import * as v from 'valibot';

export const handleValidationError = (result: v.SafeParseResult<any>) => {
  if (!result.success) {
    throw new HTTPException(400, {
      cause: new v.ValiError(result.issues),
    });
  }
};
