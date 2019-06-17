import { INMIChatSocket } from './nmi-chat-socket';

export interface IChatMessage {
  username: INMIChatSocket['username'];
  avatar: INMIChatSocket['avatar'];
  message: string;
}