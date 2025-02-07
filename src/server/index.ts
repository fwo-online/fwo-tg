import { Hono } from 'hono';
import { character } from './character';
import { inventory } from './inventory';
import { magic } from './magic';
import { skill } from './skill';
import { game } from './game';
import { shop } from './shop';

export const app = new Hono()
  .route('/character', character)
  .route('/inventory', inventory)
  .route('/shop', shop)
  .route('/magic', magic)
  .route('/skill', skill)
  .route('/game', game);

export default app;

export declare type Server = typeof app;
