import { app } from '@/server';
import { connect } from './models';
import { ItemModel } from './models/item';
import { registerAffects } from './utils/registerAffects';
import { registerGlobals } from './utils/registerGlobals';
import { serve } from '@hono/node-server';
import { Server } from 'socket.io';
import { middleware, onConnection, onCreate } from '@/server/ws';
import { isString } from 'es-toolkit';
import { initGameChannel } from './helpers/channelHelper';
import { ItemSetModel } from './models/item-set';
import { initBot } from '@/bot';

// DB connection
void connect(async () => {
  console.log('db online');
  await ItemModel.load();
  await ItemSetModel.load();

  initGameChannel();
  await initBot();
});

registerGlobals();
registerAffects();

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
