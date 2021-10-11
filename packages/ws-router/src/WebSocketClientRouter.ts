import { ApiDefinition, ApiProvider, Constructor, ISocket, RouterBase } from '@remote-ioc/runtime';
import { OPEN, WebSocket } from 'isomorphic-ws';
import { WebSocketWithScope } from './WebSocketWithScope';

export class WebSocketClientRouter extends RouterBase {
  private discoverSocket: WebSocketWithScope;
  private readonly socket: Promise<WebSocket>;
  constructor(socket: WebSocket) {
    super();
    if (socket.readyState !== OPEN) {
      this.socket = new Promise((resolve, reject) => {
        socket.on('error', reject);
        socket.on('open', () => resolve(socket));
      });
    } else {
      this.socket = Promise.resolve(socket);
    }
    // eslint-disable-next-line global-require
    this.discoverSocket = new WebSocketWithScope('$router/discover', this.socket);
    this.discoverSocket.on('request', this.handleDiscoverRequest);
    this.discoverSocket.on('response', this.handleDiscoverResponse);
    setTimeout(() => {
      this.discoverSocket.send('request', undefined);
    }, 0);
  }

  private handleDiscoverRequest = () => {
    const definitions: string[] = [];
    for (const provider of this.providers) {
      definitions.push(...ApiProvider.implementationsOf(provider).map((def) => ApiDefinition.nameOf(def)));
    }
    this.discoverSocket.send('response', definitions);
  };

  private handleDiscoverResponse = (definitions: string[]) => {
    this.emit('discover', definitions);
  };

  public getSocketCore(Definition: Constructor<unknown>): ISocket {
    const name = ApiDefinition.nameOf(Definition);
    return new WebSocketWithScope(name, this.socket);
  }
}
