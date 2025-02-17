import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { hc } from 'hono/client';
import type { Server } from '@fwo/server';
import { io, type Socket } from 'socket.io-client';

const { initDataRaw } = retrieveLaunchParams();

export const token = `tma ${initDataRaw}`;

export const createWebSocket = async () => {
  const socket = io('http://192.168.10.64:4000', { extraHeaders: { authorization: token } });
  return new Promise<Socket>((resolve) => {
    socket.io.on('open', () => {
      resolve(socket);
    });
  });
};

export const client = hc<Server>('http://192.168.10.64:3000', {
  headers: {
    Authorization: token,
  },
});
