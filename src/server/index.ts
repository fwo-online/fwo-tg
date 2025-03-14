import { Hono } from 'hono';
import { character } from './character';
import { inventory } from './inventory';
import { magic } from './magic';
import { skill } from './skill';
import { shop } from './shop';
import { cors } from 'hono/cors';
import { isString } from 'es-toolkit';

const origin = [process.env.APP_URL].filter(isString);

export const app = new Hono()
  .use(cors({ origin }))
  .route('/character', character)
  .route('/inventory', inventory)
  .route('/shop', shop)
  .route('/magic', magic)
  .route('/skill', skill);

export default app;

export declare type Server = typeof app;
