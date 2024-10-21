import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { hc } from 'hono/client';
import type { Server } from '@/server';

const { initDataRaw } = retrieveLaunchParams();

export const client = hc<Server>('http://192.168.10.32:3000', {
  headers: {
    Authorization: `tma ${initDataRaw}`,
  },
});
