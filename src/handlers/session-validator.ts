import socketIO from 'socket.io';
import { ClientEvents } from '../interfaces/events';

export const sessionValidator = async (
  socket: socketIO.Socket,
  next: (err?: any) => void
) => {
  const seshId = 'nmi-chat';

  socket['session'] = seshId;
  socket['authenticated'] = false;
  socket.join(seshId);
  socket.emit(ClientEvents.SocketJoined, { message: "Joined!" });
  next();
};
