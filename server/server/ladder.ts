import { Hono } from 'hono';
import { LadderService } from '@/arena/LadderService';

export const ladder = new Hono().get('', async (c) => {
  const ladderList = await LadderService.getLadderList();

  return c.json(ladderList, 200);
});
