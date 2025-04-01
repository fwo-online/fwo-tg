import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { vValidator } from '@hono/valibot-validator';
import * as v from 'valibot';
import { Hono } from 'hono';
import { InvoiceType, invoiceTypes } from '@fwo/shared';
import { withValidation } from '@/server/utils/withValidation';

export const serviceShop = new Hono()
  .use(userMiddleware, characterMiddleware)
  .post(
    '/purchase/:type',
    vValidator('param', v.object({ type: v.enum(InvoiceType) })),
    async (c) => {
      const character = c.get('character');
      const { type } = c.req.valid('param');

      const { components } = invoiceTypes[type];

      switch (type) {
        case InvoiceType.ResetAttributes:
          await withValidation(character.attributes.resetAttributes({ components }));
      }

      return c.json({}, 200);
    },
  );
