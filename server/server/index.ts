import { isString } from 'es-toolkit';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { ladder } from '@/server/ladder';
import { market } from '@/server/market';
import { serviceShop } from '@/server/serviceShop';
import { character } from './character';
import { clan } from './clan';
import { contracts } from './contracts';
import { inventory } from './inventory';
import { magic } from './magic';
import { passiveSkill } from './passiveSkill';
import { shop } from './shop';
import { skill } from './skill';

const origin = [process.env.APP_URL].filter(isString);

export const app = new Hono()
  .use(logger())
  .use(cors({ origin }))
  .route('/character', character)
  .route('/inventory', inventory)
  .route('/shop', shop)
  .route('/magic', magic)
  .route('/skill', skill)
  .route('/clan', clan)
  .route('/passiveSkill', passiveSkill)
  .route('/serviceShop', serviceShop)
  .route('/ladder', ladder)
  .route('/market', market)
  .route('/contracts', contracts);

export default app;

export type Server = typeof app;
