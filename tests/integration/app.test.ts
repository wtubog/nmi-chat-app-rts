import * as http from 'http';
import socketClient from 'socket.io-client';
import { closeConnection, initializeClient, Session } from 'striv-rts-client';
import { ClientEvents, ServerEvents } from '../../src/interfaces/events';
import { initializeServer } from './../../src/app';
import { terminateAllConnection } from '../../src/utils';
import * as google from 'google-auth-library';
jest.mock('google-auth-library');
const connectClients = (): Promise<
  [
    SocketIOClient.Socket,
    SocketIOClient.Socket,
    SocketIOClient.Socket,
    SocketIOClient.Socket,
    SocketIOClient.Socket
  ]
> => {
  return new Promise((resolve, reject) => {
    let connectionCtr = 0;
    const client1 = socketClient.connect('http://localhost:8000', {
      query: `chatSession=wilco-1234`
    });
    const client2 = socketClient.connect('http://localhost:8000', {
      query: `chatSession=wilco-1234`
    });
    const client3 = socketClient.connect('http://localhost:8000', {
      query: `chatSession=wilco-1234-session2`
    });

    const client4 = socketClient.connect('http://localhost:8001', {
      query: `chatSession=wilco-1234-session2`
    });

    const client5 = socketClient.connect('http://localhost:8001', {
      query: `chatSession=wilco-1234`
    });

    const tryToResolve = () => {
      if (connectionCtr == 5) {
        resolve([client1, client2, client3, client4, client5]);
      }
    };

    client1.on('connect', () => {
      connectionCtr += 1;
      tryToResolve();
    });
    client2.on('connect', () => {
      connectionCtr += 1;
      tryToResolve();
    });
    client3.on('connect', () => {
      connectionCtr += 1;
      tryToResolve();
    });
    client4.on('connect', () => {
      connectionCtr += 1;
      tryToResolve();
    });
    client5.on('connect', () => {
      connectionCtr += 1;
      tryToResolve();
    });
  });
};

describe('Chat App Server', () => {
  let server1: http.Server;
  let wsServer1: SocketIO.Server;
  let server2: http.Server;
  let wsServer2: SocketIO.Server;
  let client1: SocketIOClient.Socket;
  let client2: SocketIOClient.Socket;
  let client3: SocketIOClient.Socket;
  let client4: SocketIOClient.Socket;
  let client5: SocketIOClient.Socket;
  let sesh1: Session;
  let sesh2: Session;

  beforeAll(async () => {
    initializeClient({ host: 'localhost' });
    // Dual Node oh yeah bitch!
    [wsServer1, server1] = await initializeServer(8000);
    [wsServer2, server2] = await initializeServer(8001);
    sesh1 = new Session();
    sesh1.sessionId = 'session:wilco-1234';
    sesh1.audienceCtr = 0;
    await sesh1.save();

    sesh2 = new Session();
    sesh2.sessionId = 'session:wilco-1234-session2';
    sesh2.audienceCtr = 0;
    await sesh2.save();
  });

  afterAll(done => {
    // make sure everything is god damn disconnected!
    wsServer1.close();
    server1.close();
    wsServer2.close();
    server2.close();
    closeConnection(true);
    //@ts-ignore
    wsServer1.sockets.adapter.pubClient.end(true);
    //@ts-ignore
    wsServer1.sockets.adapter.subClient.end(true);
    //@ts-ignore
    wsServer2.sockets.adapter.pubClient.end(true);
    //@ts-ignore
    wsServer2.sockets.adapter.subClient.end(true);
    done();
  });

  beforeEach(async () => {
    const [cl1, cl2, cl3, cl4, cl5] = await connectClients();
    client1 = cl1;
    client2 = cl2;
    client3 = cl3;
    client4 = cl4;
    client5 = cl5;
  });

  afterEach(done => {
    client1.disconnect();
    client2.disconnect();
    client3.disconnect();
    client4.disconnect();
    client5.disconnect();
    client1 = null;
    client2 = null;
    client3 = null;
    client4 = null;
    client5 = null;
    jest.restoreAllMocks();
    // let the clients disconnect before Jest terminates the process.
    // 3 seconds should be enough
    setTimeout(() => {
      done();
    }, 3000);
  });

  it('Should allow client to authenticate if valid username is provided', done => {
    client1.on(ClientEvents.AuthSuccess, e => {
      expect(e.message).toBe('Auth success!');
      done();
    });
    client1.emit(ServerEvents.Authenticate, { username: 'wilco' });
  });

  it('Should not allow unauthorized client to send a chat message', done => {
    client1.on(ClientEvents.AuthRequired, e => {
      expect(e.message).toBe('Please login either via FB or Google');
      done();
    });
    client1.emit(ServerEvents.ChatInbound, 'test message');
  });

  it("Should allow Client 1 to receive Client 2's message if they belong in the same room ", done => {
    client1.on(ClientEvents.ChatOutbound, e => {
      expect(e.username).toBe('wilco');
      expect(e.avatar).toBeDefined();
      expect(e.message).toBe('hello');
      done();
    });
    client2.emit(ServerEvents.Authenticate, { username: 'wilco' });
    client2.emit(ServerEvents.ChatInbound, 'hello');
  });

  it("Should allow Client 2 to receive Client 1's message if they belong in the same room ", done => {
    let outboundHandlerEv = jest.fn();
    client2.on(ClientEvents.ChatOutbound, e => {
      expect(e.username).toBe('wilco');
      expect(e.avatar).toBeDefined();
      expect(e.message).toBe('hello');
      outboundHandlerEv();
    });
    client1.emit(ServerEvents.Authenticate, { username: 'wilco' });
    client1.emit(ServerEvents.ChatInbound, 'hello');
    setTimeout(() => {
      expect(outboundHandlerEv).toHaveBeenCalled();
      done();
    }, 4000);
  });

  it('Should allow cross-node communication between Client 1 and Client 5', done => {
    let outboundHandlerEv = jest.fn();
    client5.on(ClientEvents.ChatOutbound, e => {
      expect(e.username).toBe('wilco');
      expect(e.avatar).toBeDefined();
      expect(e.message).toBe('hello from node 1');
      outboundHandlerEv();
    });
    client1.emit(ServerEvents.Authenticate, { username: 'wilco' });
    client1.emit(ServerEvents.ChatInbound, 'hello from node 1');
    setTimeout(() => {
      expect(outboundHandlerEv).toHaveBeenCalled();
      done();
    }, 4000);
  });

  it('Should allow cross-node communication between Client 5 and Client 1', done => {
    let outboundHandlerEv = jest.fn();
    client1.on(ClientEvents.ChatOutbound, e => {
      expect(e.username).toBe('wilco');
      expect(e.avatar).toBeDefined();
      expect(e.message).toBe('hello from node 2');
      outboundHandlerEv();
    });
    client5.emit(ServerEvents.Authenticate, { username: 'wilco' });
    client5.emit(ServerEvents.ChatInbound, 'hello from node 2');
    setTimeout(() => {
      expect(outboundHandlerEv).toHaveBeenCalled();
      done();
    }, 4000);
  });
});
