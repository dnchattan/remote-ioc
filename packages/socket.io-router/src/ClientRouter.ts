import type { Socket, Manager } from 'socket.io-client';
import { ApiDefinition, ApiProvider, Constructor, ISocket, RouterBase } from '@remote-ioc/runtime';
import { ClientSocket } from './ClientSocket';

export class SocketIOClientRouter extends RouterBase {
  private socket: Socket;
  constructor(private readonly manager: Manager) {
    super();
    // eslint-disable-next-line global-require
    this.socket = manager.socket('/$router/discover');
    this.socket.on('message', this.handleRouterMessage);
    setTimeout(() => {
      this.socket.send('request');
    }, 0);
  }

  handleRouterMessage = (channel: string, definitions?: string[]) => {
    switch (channel) {
      case 'request': {
        this.handleDiscoverRequest();
        return;
      }
      case 'response': {
        this.handleDiscoverResponse(definitions ?? []);
        break;
      }
      default:
    }
  };

  private handleDiscoverRequest() {
    const definitions: string[] = [];
    for (const provider of this.providers) {
      definitions.push(...ApiProvider.implementationsOf(provider).map((def) => ApiDefinition.nameOf(def)));
    }
    this.socket.send('response', definitions);
  }

  private handleDiscoverResponse(definitions: string[]) {
    this.emit('discover', definitions);
  }

  public getSocketCore(Definition: Constructor<unknown>): ISocket {
    const name = ApiDefinition.nameOf(Definition);
    return new ClientSocket(this.manager.socket(`/${name}`));
  }
}
