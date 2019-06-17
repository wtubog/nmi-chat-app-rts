import { OAuth2Client } from 'google-auth-library';
import {
  IAuthentication,
  IAuthenticationResult
} from '../interfaces/authentication';
import { ClientEvents } from '../interfaces/events';
import { IStrivSocket } from '../interfaces/striv-socket';

const fbTokens = ['fb-1234'];

const CLIENT_ID =
  '939512286312-m5cm7ir7sks312cudvv8ggne6rf7ah8r.apps.googleusercontent.com';


const fbLogin = async (token: string): Promise<IAuthenticationResult> => {
  if (fbTokens.indexOf(token) > -1) {
    return Promise.resolve({
      username: 'wilco',
      avatar: 'test-fb-pic'
    });
  }
  return Promise.resolve(null);
};

const googLogin = async (token: string): Promise<IAuthenticationResult> => {
  const googleOAuthClient = new OAuth2Client(CLIENT_ID);
  const ticket = await googleOAuthClient.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID
  });
  if (ticket) {
    const payload = ticket.getPayload();
    return {
      username: payload.name,
      avatar: payload.picture
    };
  }

  return null;
};

export const authenticateHandler = async (
  socket: IStrivSocket,
  message: IAuthentication
) => {
  let user = null;

  if (message.socialMedia === 'fb') {
    user = await fbLogin(message.token).catch(e => null);
  } else if (message.socialMedia === 'google') {
    user = await googLogin(message.token).catch(e => null);
  }

  if (user) {
    socket.username = user.username;
    socket.avatar = user.avatar;
    socket.authenticated = true;
    socket.emit(ClientEvents.AuthSuccess, { message: 'Auth success!' });
    return;
  }
  socket.emit(ClientEvents.AuthFailed, { message: 'Auth failed!' });
  socket.authenticated = false;
};
