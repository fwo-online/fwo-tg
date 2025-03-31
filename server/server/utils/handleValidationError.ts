import { HTTPException } from 'hono/http-exception';
import * as v from 'valibot';

export const handleValidationError = (result: v.SafeParseResult<any>) => {
  if (!result.success) {
    const message = Object.values(v.flatten(result.issues).nested ?? {})
      .flat()
      .join(', ');

    throw new HTTPException(400, { message });
  }
};
