import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { character } from './character';
import { inventory } from './inventory';
import { magic } from './magic';
import { skill } from './skill';

export const server = new Hono()
  .use(logger())
  .route('/character', character)
  .route('/magic', magic)
  .route('/skill', skill)
  .route('/inventory', inventory);

export type Server = typeof server;
