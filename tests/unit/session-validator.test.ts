import { ClientEvents } from '../../src/interfaces/events';
import { sessionValidator } from './../../src/handlers/session-validator';

describe('Session Validator', () => {
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
    jest.resetAllMocks();
  });

  it('Should set custom variables to Socket', async () => {
    //@ts-ignore
    sessionValidator(socket, mockNextfn);
    expect(socket.authenticated).toBeFalsy();
    expect(mockNextfn).toHaveBeenCalled();
    expect(socketEmitfn).toHaveBeenCalledWith(ClientEvents.SocketJoined, {
      message: 'Joined!'
    });
  });
});
