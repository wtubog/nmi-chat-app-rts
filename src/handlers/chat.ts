import { INMIChatSocket } from '../interfaces/nmi-chat-socket';
import { IChatMessage } from '../interfaces/chat.interface';
import { ClientEvents, ServerEvents } from '../interfaces/events';

export const chatInboundHandler = (socket: INMIChatSocket, message: string) => {
  if (
    !('authenticated' in socket) ||
    !socket['authenticated'] ||
    !('session' in socket) ||
    !('username' in socket) ||
    !('avatar' in socket)
  ) {
    socket.emit(ClientEvents.AuthRequired, {
      message: 'Please login either via FB or Google'
    });
    return false;
  }

  const messagePayload: IChatMessage = {
    username: socket.username,
    avatar: socket.avatar,
    message
  };
  socket.to(socket['session']).emit(ClientEvents.ChatOutbound, messagePayload);

  return true;
};
