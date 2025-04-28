import { characterMiddleware, userMiddleware } from '@/server/middlewares';
import { vValidator } from '@hono/valibot-validator';
import * as v from 'valibot';
import { Hono } from 'hono';
import { withValidation } from '@/server/utils/withValidation';
import { MarketItemService } from '@/arena/MarketItemService';
import { HTTPException } from 'hono/http-exception';
import { itemMarketRequiredLevel } from '@fwo/shared';

export const market = new Hono()
  .use(userMiddleware, characterMiddleware)
  .get('', async (c) => {
    const marketItems = await withValidation(MarketItemService.getMarketItems());

    return c.json(marketItems, 200);
  })
  .use(async (c, next) => {
    const character = c.get('character');
    if (character.lvl < itemMarketRequiredLevel) {
      throw new HTTPException(403, { message: 'У вас недостаточно уровень' });
    }
    await next();
  })
  .post('', vValidator('json', v.object({ itemID: v.string(), price: v.number() })), async (c) => {
    const character = c.get('character');
    const { itemID, price } = c.req.valid('json');

    await withValidation(MarketItemService.createMarketItem(character, itemID, price));

    return c.json({}, 200);
  })
  .post('/:id', vValidator('param', v.object({ id: v.string() })), async (c) => {
    const character = c.get('character');
    const { id } = c.req.valid('param');

    await withValidation(MarketItemService.buyMarketItem(character, id));

    return c.json({}, 200);
  })
  .delete('', vValidator('json', v.object({ marketItemID: v.string() })), async (c) => {
    const character = c.get('character');
    const { marketItemID } = c.req.valid('json');

    await withValidation(MarketItemService.removeMarketItem(character, marketItemID));

    return c.json({}, 200);
  });
