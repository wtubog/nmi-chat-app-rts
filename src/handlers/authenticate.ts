import {
  IAuthentication,
  IAuthenticationResult
} from '../interfaces/authentication';
import { ClientEvents } from '../interfaces/events';
import { INMIChatSocket } from '../interfaces/nmi-chat-socket';

const AVATARS = ['😀', '👽', '😎', '💩', '🤖', '💀', '😈', '🙄'];

export const authenticateHandler = async (
  socket: INMIChatSocket,
  message: IAuthentication
) => {
  if ('username' in message && message.username != '') {
    socket.username = message.username;
    socket.avatar = AVATARS[Math.floor(Math.random() * 8)];
    socket.authenticated = true;
    socket.emit(ClientEvents.AuthSuccess, { message: 'Auth success!' });
    return;
  }
  socket.emit(ClientEvents.AuthFailed, { message: 'Auth failed!' });
  socket.authenticated = false;
};
