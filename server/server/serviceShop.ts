import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { vValidator } from '@hono/valibot-validator';
import * as v from 'valibot';
import { Hono } from 'hono';
import { InvoiceType, invoiceTypes, nameSchema } from '@fwo/shared';
import { withValidation } from '@/server/utils/withValidation';
import { handleValidationError } from '@/server/utils/handleValidationError';
import { ServiceShop } from '@/arena/ServiceShop';

export const serviceShop = new Hono()
  .use(userMiddleware, characterMiddleware)
  .post('/reset-attributes', async (c) => {
    const character = c.get('character');
    const { components } = invoiceTypes[InvoiceType.ResetAttributes];

    await withValidation(ServiceShop.resetAttributes(character, { components }));

    return c.json({}, 200);
  })
  .post('/reset-attributes/invoice', async (c) => {
    const user = c.get('user');

    const url = await withValidation(ServiceShop.getResetAttributesInvoice(user));

    return c.json({ url }, 200);
  })
  .post(
    '/change-name',
    vValidator('json', v.object({ name: nameSchema }), handleValidationError),
    async (c) => {
      const character = c.get('character');
      const { name } = c.req.valid('json');
      const { components } = invoiceTypes[InvoiceType.ChangeName];

      await withValidation(ServiceShop.changeName(character, name, { components }));

      return c.json({}, 200);
    },
  )
  .post(
    '/change-name/invoice',
    vValidator('json', v.object({ name: nameSchema }), handleValidationError),
    async (c) => {
      const user = c.get('user');
      const { name } = c.req.valid('json');

      const url = await withValidation(ServiceShop.getChangeNimeInvoice(user, name));

      return c.json({ url }, 200);
    },
  )
  .post(
    '/donate/invoice',
    vValidator(
      'json',
      v.object({
        amount: v.pipe(
          v.number(),
          v.minValue(50, 'Минимум 50 звёзд'),
          v.maxValue(100000, 'Максимум 10000 звёзд'),
        ),
      }),
      handleValidationError,
    ),
    async (c) => {
      const user = c.get('user');
      const { amount } = c.req.valid('json');

      const url = await withValidation(ServiceShop.getDonationInvoice(user, amount));

      return c.json({ url }, 200);
    },
  );
