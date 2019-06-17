export enum ClientEvents {
  SessionDoesntExist = 'session:not-found',
  AuthRequired = 'session:auth-required',
  AuthFailed = 'session:auth-failed',
  AuthSuccess = 'session:auth-success',
  SocketJoined = 'session:socket-joined',
  ChatOutbound = 'session:chat-outbound',
  SessionEnded = 'session:ended'
}

export enum ServerEvents {
  ChatInbound = 'session:chat-inbound',
  Disconnect = 'disconnect',
  Authenticate = 'authenticate'
}
