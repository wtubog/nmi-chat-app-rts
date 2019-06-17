import * as http from 'http';
import socketIO from 'socket.io';
import redisAdapter from 'socket.io-redis';
import { getPubSubClient } from 'striv-rts-client';
import { authenticateHandler } from './handlers/authenticate';
import { chatInboundHandler } from './handlers/chat';
import { sessionEndedHandler } from './handlers/session-ended';
import { sessionValidator } from './handlers/session-validator';
import { ServerEvents } from './interfaces/events';
import { IStrivSocket } from './interfaces/striv-socket';
import { updateClientCount } from './utils';

export const initializeServer = (port: number): Promise<[socketIO.Server, http.Server]> => {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req,res) => {
      res.end('hello');
    });
    const io = socketIO(server, {
      pingTimeout: 5000,
      pingInterval: 5000
    });
    const subscriber = getPubSubClient();
    
    const adapter = redisAdapter({ host: process.env.REDIS_ENDPOINT });
    io.adapter(adapter);
    
    subscriber.subscribe('Session Ended');
    subscriber.on('message', (channel, message) =>
      sessionEndedHandler(io, channel, message)
    );

    // Allow clients to connect if session id is valid
    io.use(sessionValidator);

    io.on('connection', (socket: IStrivSocket) => {
      updateClientCount(socket, 'incr');

      socket.on(ServerEvents.Authenticate, message => authenticateHandler(socket, message));
      socket.on(ServerEvents.ChatInbound, message =>
        chatInboundHandler(socket, message)
      );
      socket.on(ServerEvents.Disconnect, () => {
        updateClientCount(socket, 'decr');
      });
    });

    // process.on('SIGINT', () => terminateAllConnection(io));
    // process.on('SIGTERM', () => terminateAllConnection(io));

    server.listen(port, () => {
      console.log(`Chat server listening on port ${port}`);
      resolve([io, server]);
    });
  })
};
