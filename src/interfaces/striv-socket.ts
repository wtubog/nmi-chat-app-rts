import socketIO from 'socket.io';

export interface IStrivSocket extends socketIO.Socket {
  session?: string;
  authenticated?: boolean;
  username?: string;
  avatar?: string;
}