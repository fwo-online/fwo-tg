import { createInvoice } from '@/api/payment';
import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { Hono } from 'hono';
import * as v from 'valibot';
import { vValidator } from '@hono/valibot-validator';
import { InvoiceType } from '@fwo/shared';

export const payment = new Hono()
  .use(userMiddleware, characterMiddleware)
  .post(
    '/create-invoice',
    vValidator('json', v.object({ type: v.enum(InvoiceType) })),
    async (c) => {
      const user = c.get('user');
      const { type } = c.req.valid('json');

      const url = await createInvoice(user, type);

      return c.json({ url }, 200);
    },
  );
