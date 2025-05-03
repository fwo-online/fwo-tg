import { initData } from '@telegram-apps/sdk-react';
import { type InferRequestType, hc, type InferResponseType } from 'hono/client';
import type { Server } from '@fwo/server';
import { io, type Socket } from 'socket.io-client';
import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/shared';

const getToken = () => {
  return `tma ${initData.raw()}`;
};

export const createWebSocket = async () => {
  const socket = io(import.meta.env.VITE_API_URL, { extraHeaders: { authorization: getToken() } });
  return new Promise<Socket<ServerToClientMessage, ClientToServerMessage>>((resolve) => {
    socket.io.on('open', () => {
      resolve(socket);
    });
  });
};

export const client = hc<Server>(import.meta.env.VITE_API_URL ?? '/api', {
  headers: () => ({
    Authorization: getToken(),
  }),
});

export const createRequest =
  <T extends (args: any) => any>(method: T) =>
  async (args: InferRequestType<T>): Promise<InferResponseType<T>> => {
    const res = await method(args);
    if (res.ok) {
      return await res.json();
    }

    throw new Error(await res.text());
  };
