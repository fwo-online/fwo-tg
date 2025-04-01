import { Hono } from 'hono';
import { character } from './character';
import { inventory } from './inventory';
import { magic } from './magic';
import { skill } from './skill';
import { shop } from './shop';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { isString } from 'es-toolkit';
import { passiveSkill } from './passiveSkill';
import { clan } from './clan';
import { serviceShop } from '@/server/serviceShop';

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
  .route('/serviceShop', serviceShop);

export default app;

export declare type Server = typeof app;
