import { Session } from 'striv-rts-client';
import { authenticateHandler } from './../../src/handlers/authenticate';
import { ClientEvents } from '../../src/interfaces/events';

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

  it('Should authenticate if a valid username is provided', async () => {
    jest.spyOn(Session, 'findOne').mockResolvedValue({});
    socket['session'] = 'test-session';
    socket['authenticated'] = false;
    await authenticateHandler(socket, { username: 'wilco' });
    expect(socket['authenticated']).toBeTruthy();
    expect(socket['username']).toBe('wilco');
    expect(socket['avatar']).toBeDefined();
    expect(socketEmitfn).toHaveBeenCalledWith(ClientEvents.AuthSuccess, {
      message: 'Auth success!'
    });
  });

  it('Should not authenticate if an invalid username is provided', async () => {
    jest.spyOn(Session, 'findOne').mockResolvedValue({});
    socket['session'] = 'test-session';
    socket['authenticated'] = false;
    await authenticateHandler(socket, { username: '' });
    expect(socket['authenticated']).toBeFalsy();
    expect(socketEmitfn).toHaveBeenCalledWith(ClientEvents.AuthFailed, {
      message: 'Auth failed!'
    });
  });
});
