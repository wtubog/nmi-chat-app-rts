import socketIO from 'socket.io';
import { Session } from 'striv-rts-client';
import { kickClient } from '../utils';
import { ClientEvents } from '../interfaces/events';

export const sessionValidator = async (
  socket: socketIO.Socket,
  next: (err?: any) => void
) => {
  if (!('authenticated' in socket) && !('session' in socket)) {
    if ('chatSession' in socket.handshake.query) {
      const seshId = `session:${socket.handshake.query.chatSession}`;
      const sesh = await Session.findOne(seshId);
      console.log(sesh);
      if (sesh) {
        socket['session'] = seshId;
        socket['authenticated'] = false;
        socket.join(seshId);
        socket.emit(ClientEvents.SocketJoined, { message: "Joined!" });
        next();
        return true;
      } else {
        const s = new Session();
        s.sessionId = seshId;
        s.audienceCtr = 0;
        await s.save();
      }
    }
    socket.emit(ClientEvents.SessionDoesntExist, { message: "Session doesn't exist" });
    kickClient(socket);
  } else {
    next();
  }
};
