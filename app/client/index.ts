import { initData } from '@telegram-apps/sdk-react';
import { type InferRequestType, hc, type InferResponseType } from 'hono/client';
import type { Server } from '@fwo/server';
import { io, type Socket } from 'socket.io-client';

const getToken = () => {
  return `tma ${initData.raw()}`;
};

export const createWebSocket = async () => {
  const socket = io('http://192.168.10.64:4000', { extraHeaders: { authorization: getToken() } });
  return new Promise<Socket>((resolve) => {
    socket.io.on('open', () => {
      resolve(socket);
    });
  });
};

export const client = hc<Server>('http://192.168.10.64:3000', {
  headers: () => ({
    Authorization: getToken(),
  }),
});

export const createRequest =
  <T extends (args: any) => any>(method: T) =>
  async (args: InferRequestType<T>): Promise<InferResponseType<T>> => {
    const res = method(args);
    if (res.ok) {
      return await res.json();
    }

    throw new Error(await res.text());
  };
