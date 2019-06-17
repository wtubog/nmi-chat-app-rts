import socketIO from 'socket.io';
import { INMIChatSocket } from '../interfaces/nmi-chat-socket';
import { Session } from 'striv-rts-client';

export const updateClientCount = async (
  socket: INMIChatSocket,
  op: 'incr' | 'decr'
) => {
  const sesh = await Session.findOne(socket.session);

  if (op !== 'incr' && op !== 'decr') {
    throw new Error('Invalid audience ctr operation');
  }

  if (sesh) {
    if (op === 'incr') {
      await sesh.incrAudienceCount();
    } else {
      await sesh.decrAudienceCount();
    }
  }
};

export const terminateAllConnection = async (io: socketIO.Server) => { 
  console.log('Terminating sessions...');
  const connectedClients = io.local.sockets.connected
  for (const client in connectedClients) {
    connectedClients[client].disconnect(true);
  }

  if(process.env.NODE_ENV !== 'test') {
    // after 3 seconds, close the process
    setTimeout(() => {
      process.exit();
    }, 3000);
  }
}
