import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { character } from './character';
import { inventory } from './inventory';
import { magic } from './magic';
import { skill } from './skill';

export const server = new Hono()
  .use(cors({
    origin: ['http://192.168.10.32:5173'],
  }))
  .get('/', (c) => {
    return c.json({
      data: 'Hello FightWorld!',
    }, 200);
  })
  .use(logger())
  .route('/character', character)
  .route('/magic', magic)
  .route('/skill', skill)
  .route('/inventory', inventory);

export default server;

export type Server = typeof server;
