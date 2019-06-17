import socketIO from 'socket.io';
import { ClientEvents } from '../interfaces/events';

export const sessionEndedHandler = (
  io: socketIO.Server,
  channel: string,
  message
) => {
  const payload = JSON.parse(message);
  const rooms = io.local.sockets.adapter.rooms[payload.hashKey];
  for (let client in rooms.sockets) {
    const clientSocket = io.local.sockets.connected[client];
    try {
      clientSocket.emit(ClientEvents.SessionEnded, {
        message: 'Session has ended!'
      });
      setTimeout(() => {
        clientSocket.disconnect();
      }, 100);
    } catch (e) {
      console.log(e);
      console.log(`Error upon trying to disconnect client: ${client}`);
    }
  }
};
