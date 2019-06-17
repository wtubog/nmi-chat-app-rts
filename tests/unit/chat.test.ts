import { chatInboundHandler } from './../../src/handlers/chat';
import { ClientEvents } from '../../src/interfaces/events';

describe('Chat outbound handler', () => {
  let mockNextfn;
  let socketEmitfn;
  let socket;
  let joinFn;
  let toFn;

  beforeEach(() => {
    mockNextfn = jest.fn();
    socketEmitfn = jest.fn();
    joinFn = jest.fn();
    toFn = jest.fn();
    socket = {
      handshake: {
        query: {}
      },
      emit: socketEmitfn,
      join: joinFn,
      to(room) {
        toFn(room);
        return {
          emit: socketEmitfn
        };
      }
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Should not allow sockets without StrivSocket data to broadcast a message', () => {
    const message = 'hello';
    chatInboundHandler(socket, message);
    expect(socketEmitfn).toHaveBeenCalledWith(ClientEvents.AuthRequired, {
      message: 'Please login either via FB or Google'
    });
  });

  it('Should not allow unauthenticated sockets to broadcast a message', () => {
    const message = 'hello';
    socket['authenticated'] = false;
    chatInboundHandler(socket, message);
    expect(socketEmitfn).toHaveBeenCalledWith(ClientEvents.AuthRequired, {
      message: 'Please login either via FB or Google'
    });
  });

  it('Should allow authenticated sockets to broadcast a message', () => {
    const message = 'hello';
    socket['username'] = 'wilco';
    socket['avatar'] = 'avatar';
    socket['authenticated'] = true;
    socket['session'] = 'test-session';
    chatInboundHandler(socket, message);
    expect(toFn).toHaveBeenCalledWith(socket['session']);
    expect(socketEmitfn).toHaveBeenCalledWith(ClientEvents.ChatOutbound, {
      message,
      username: socket['username'],
      avatar: socket['avatar']
    });
  });
});
