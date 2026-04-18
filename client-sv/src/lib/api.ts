import type { Server } from '@fwo/server';
import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/shared';
import { initData } from '@tma.js/sdk-svelte';
import { hc, type InferRequestType, type InferResponseType } from 'hono/client';
import { io, type Socket } from 'socket.io-client';

const getToken = () => {
  return `tma ${initData.raw()}`;
};

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  extraHeaders: { authorization: getToken() },
});

export const createWebSocket = async () => {
  return new Promise<Socket<ServerToClientMessage, ClientToServerMessage>>((resolve) => {
    if (socket.connected) {
      resolve(socket);
    } else {
      socket.connect();
      socket.io.on('open', () => {
        resolve(socket);
      });
    }
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
