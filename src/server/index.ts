import { Hono } from 'hono';
import { character } from './character';
import { inventory } from './inventory';
import { magic } from './magic';
import { skill } from './skill';
import { shop } from './shop';
import { cors } from 'hono/cors';

export const app = new Hono()
  .use(cors({ origin: ['http://192.168.10.64:5173'] }))
  .route('/character', character)
  .route('/inventory', inventory)
  .route('/shop', shop)
  .route('/magic', magic)
  .route('/skill', skill);

export default app;

export declare type Server = typeof app;
