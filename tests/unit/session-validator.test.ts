import { sessionValidator } from './../../src/handlers/session-validator';
import socketIO from 'socket.io';
import * as utils from '../../src/utils';
import { Session } from 'striv-rts-client';
import { ClientEvents } from '../../src/interfaces/events';

describe('Session Validator', () => {
  let mockNextfn;
  let kickClient;
  let socketEmitfn;
  let socket;
  let joinFn;

  beforeEach(() => {
    mockNextfn = jest.fn();
    socketEmitfn = jest.fn();
    joinFn = jest.fn();
    kickClient = jest.spyOn(utils, 'kickClient').mockImplementation(() => {
      return true;
    });

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

  it('Should not allow a socket to join if handshake param is not present', async () => {
    //@ts-ignore
    sessionValidator(socket, mockNextfn);
    expect(mockNextfn).not.toHaveBeenCalled();
    expect(socketEmitfn).toHaveBeenCalledWith(ClientEvents.SessionDoesntExist, {
      message: "Session doesn't exist"
    });
    expect(kickClient).toHaveBeenCalled();
  });

  it('Should not allow a socket to join if session is non-existent', async () => {
    socket.handshake.query['chatSession'] = 'notexistingsession';
    jest.spyOn(Session, 'findOne').mockResolvedValue(null);
    //@ts-ignore
    await sessionValidator(socket, mockNextfn);

    expect(mockNextfn).not.toHaveBeenCalled();
    expect(socketEmitfn).toHaveBeenCalledWith(ClientEvents.SessionDoesntExist, {
      message: "Session doesn't exist"
    });
    expect(kickClient).toHaveBeenCalled();
  });

  it('Should allow a socket to join if session does exist', async () => {
    socket.handshake.query['chatSession'] = 'notexistingsession';
    jest.spyOn(Session, 'findOne').mockResolvedValue({});
    //@ts-ignore
    await sessionValidator(socket, mockNextfn);

    expect(socket['session']).toBe(
      `session:${socket.handshake.query['chatSession']}`
    );
    expect(socket['authenticated']).toBeFalsy();
    expect(joinFn).toHaveBeenCalledWith(
      `session:${socket.handshake.query['chatSession']}`
    );
    expect(mockNextfn).toHaveBeenCalled();
    expect(socketEmitfn).toHaveBeenCalledWith(
      ClientEvents.SocketJoined,
      {
        message: "Joined!"
      }
    );
    expect(socketEmitfn).not.toHaveBeenCalledWith(
      ClientEvents.SessionDoesntExist,
      {
        message: "Session doesn't exist"
      }
    );
    expect(kickClient).not.toHaveBeenCalled();
  });

  it('Should skip validation if StrivSocket data is defined', async () => {
    socket['authenticated'] = false;
    socket['session'] = 'session:test-session';
    //@ts-ignore
    await sessionValidator(socket, mockNextfn);

    expect(mockNextfn).toHaveBeenCalled();
    expect(joinFn).not.toHaveBeenCalled();
    expect(socketEmitfn).not.toHaveBeenCalledWith(ClientEvents.SessionDoesntExist, {
      message: "Session doesn't exist"
    });
    expect(kickClient).not.toHaveBeenCalled();
  });
});
