import type { Server } from '@fwo/server';
import type { ClientToServerMessage, ServerToClientMessage } from '@fwo/shared';
import { initData } from '@tma.js/sdk-react';
import { hc, type InferRequestType, type InferResponseType } from 'hono/client';
import { io, type Socket } from 'socket.io-client';

const getToken = () => {
  return `tma ${initData.raw()}`;
};

const socket = io(import.meta.env.VITE_API_URL, {
  auth: (cb) => cb({ authorization: getToken() }),
  autoConnect: false,
});

export const createWebSocket = async () => {
  if (socket.connected) {
    return socket;
  }

  socket.connect();

  return new Promise<Socket<ServerToClientMessage, ClientToServerMessage>>((resolve, reject) => {
    socket.once('connect', () => {
      resolve(socket);
    });

    socket.on('connect_error', (e) => {
      reject(e);
    });

    socket.on('disconnect', (e) => {
      reject(e);
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
