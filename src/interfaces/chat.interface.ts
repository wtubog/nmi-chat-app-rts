import { IStrivSocket } from './striv-socket';

export interface IChatMessage {
  username: IStrivSocket['username'];
  avatar: IStrivSocket['avatar'];
  message: string;
}