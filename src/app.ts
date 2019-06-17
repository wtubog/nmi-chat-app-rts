import * as http from 'http';
import socketIO from 'socket.io';
import redisAdapter from 'socket.io-redis';
import { authenticateHandler } from './handlers/authenticate';
import { chatInboundHandler } from './handlers/chat';
import { sessionValidator } from './handlers/session-validator';
import { ServerEvents } from './interfaces/events';
import { INMIChatSocket } from './interfaces/nmi-chat-socket';

export const initializeServer = (port: number): Promise<[socketIO.Server, http.Server]> => {
  return new Promise((resolve, reject) => {
    // AWS ALB will do an HTTP request to this server for periodical health check
    // if our app won't respond to ALB's HTTP, our app will be marked unhealthy and client requests
    // won't be able to reach the server. 
    const server = http.createServer((req,res) => {
      res.end('hello');
    });
    const io = socketIO(server, {
      pingTimeout: 5000,
      pingInterval: 5000
    });
    
    const adapter = redisAdapter({ host: process.env.REDIS_ENDPOINT });
    io.adapter(adapter);

    // Allow clients to connect if session id is valid
    io.use(sessionValidator);

    io.on('connection', (socket: INMIChatSocket) => {
      console.log('client connected!')
      socket.on(ServerEvents.Authenticate, message => authenticateHandler(socket, message));
      socket.on(ServerEvents.ChatInbound, message =>
        chatInboundHandler(socket, message)
      );
      socket.on(ServerEvents.Disconnect, () => {
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
