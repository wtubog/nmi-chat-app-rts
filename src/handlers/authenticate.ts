import {
  IAuthentication,
  IAuthenticationResult
} from '../interfaces/authentication';
import { ClientEvents } from '../interfaces/events';
import { INMIChatSocket } from '../interfaces/nmi-chat-socket';

const AVATARS = [
  'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/smiling-face.png',
  'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/alien.png',
  'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/smiling-face-with-sunglasses.png',
  'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/pile-of-poo.png',
  'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/robot-face.png',
  'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/skull.png',
  'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/smiling-face-with-horns.png',
  'https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-12/256/face-with-rolling-eyes.png'
];

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
