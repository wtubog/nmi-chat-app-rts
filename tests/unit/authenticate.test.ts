import * as google from 'google-auth-library';
import { Session } from 'striv-rts-client';
import { authenticateHandler } from './../../src/handlers/authenticate';

// jest.genMockFromModule('google-auth-library');
jest.mock('google-auth-library');

describe('Authenticate Handler', () => {
  let mockNextfn;
  let socketEmitfn;
  let socket;
  let joinFn;

  beforeEach(() => {
    mockNextfn = jest.fn();
    socketEmitfn = jest.fn();
    joinFn = jest.fn();

    socket = {
      handshake: {
        query: {}
      },
      emit: socketEmitfn,
      join: joinFn
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // it('Should not authenticate a socket if session doesnt exist', async () => {
  //   jest.spyOn(Session, 'findOne').mockResolvedValue(null);
  //   socket['session'] = 'test-session';
  //   socket['authenticated'] = false;
  //   await authenticateHandler(socket, { token: 'djsadsa', socialMedia: 'fb' });
  //   expect(socket['authenticated']).toBeFalsy();
  // });

  it('Should authenticate a socket if provided FB Token is valid', async () => {
    jest.spyOn(Session, 'findOne').mockResolvedValue({});
    socket['session'] = 'test-session';
    socket['authenticated'] = false;
    await authenticateHandler(socket, { token: 'fb-1234', socialMedia: 'fb' });
    expect(socket['authenticated']).toBeTruthy();
    expect(socket['username']).toBe('wilco');
    expect(socket['avatar']).toBeDefined();
  });

  it('Should not authenticate a socket if provided FB Token is invalid', async () => {
    jest.spyOn(Session, 'findOne').mockResolvedValue({});
    socket['session'] = 'test-session';
    socket['authenticated'] = false;
    await authenticateHandler(socket, {
      token: 'fb-1234444',
      socialMedia: 'fb'
    });
    expect(socket['authenticated']).toBeFalsy();
    // expect(socket['username']).toBe('wilco');
    // expect(socket['avatar']).toBeDefined();
  });

  it('Should authenticate a socket if provided Google Token is valid', async () => {
    //@ts-ignore
    google.OAuth2Client.mockImplementation(() => {
      return {
        verifyIdToken: () => {
          return Promise.resolve({
            getPayload: () => {
              return { name: 'wilco', picture: 'test' };
            }
          });
        }
      };
    });
    socket['session'] = 'test-session';
    socket['authenticated'] = false;
    await authenticateHandler(socket, {
      token: 'goog-1234',
      socialMedia: 'google'
    });

    expect(google.OAuth2Client).toHaveBeenCalledWith(
      '939512286312-m5cm7ir7sks312cudvv8ggne6rf7ah8r.apps.googleusercontent.com'
    );
    // expect(OAuth2Client.)
    expect(socket['authenticated']).toBeTruthy();
    expect(socket['username']).toBe('wilco');
    expect(socket['avatar']).toBeDefined();
  });

  it('Should not authenticate a socket if provided Google Token is invalid', async () => {
    //@ts-ignore
    google.OAuth2Client.mockImplementation(() => {
      return {
        verifyIdToken: () => {
          return null;
        }
      };
    });
    socket['session'] = 'test-session';
    socket['authenticated'] = false;
    await authenticateHandler(socket, { token: 'goog-1234555', socialMedia: 'google' });
    expect(socket['authenticated']).toBeFalsy();
  });
});
