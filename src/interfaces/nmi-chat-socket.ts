import socketIO from 'socket.io';

export interface INMIChatSocket extends socketIO.Socket {
  session?: string;
  authenticated?: boolean;
  username?: string;
  avatar?: string;
}