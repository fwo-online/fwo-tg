import { serve } from '@hono/node-server';
import { isString } from 'es-toolkit';
import { Server } from 'socket.io';
import { initBot } from '@/bot';
import { initGameChannel } from '@/helpers/channelHelper';
import { connect } from '@/models';
import { ItemModel } from '@/models/item';
import { ItemSetModel } from '@/models/item-set';
import { app } from '@/server';
import { middleware, onConnection, onCreate } from '@/server/ws';
import { registerAffects } from '@/utils/registerAffects';
import { registerGlobals } from '@/utils/registerGlobals';

// DB connection
void connect(async () => {
  console.log('db online');
  await ItemModel.load();
  await ItemSetModel.load();

  initGameChannel();

  const server = serve({
    fetch: app.fetch,
    port: 3000,
  });

  const io = new Server(server, {
    connectionStateRecovery: {},
    pingInterval: 10000,
    cors: { origin: [process.env.APP_URL].filter(isString) },
  });

  onCreate(io);
  io.use(middleware(io));
  io.on('connection', (socket) => {
    onConnection(io, socket);
  });

  await initBot();
});

registerGlobals();
registerAffects();
