/* eslint-disable max-classes-per-file */
import type { Namespace, Server } from 'socket.io';
import { ApiDefinition, ApiProvider, Constructor, ISocket, RouterBase } from '@remote-ioc/runtime';
import { ServerSocket } from './ServerSocket';

export class SocketIOServerRouter extends RouterBase {
  private discoveryNS: Namespace;
  constructor(private readonly server: Server) {
    super();
    this.discoveryNS = server.of('/$router/discover');
    this.discoveryNS.on('message', this.handleRouterMessage);

    this.discoveryNS.on('connection', (socket) => {
      this.discoveryNS.send('request');
      socket.on('message', this.handleRouterMessage);
    });
    setTimeout(() => {
      this.discoveryNS.send('request');
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
    this.discoveryNS.send('response', definitions);
  }

  private handleDiscoverResponse(definitions: string[]) {
    this.emit('discover', definitions);
  }

  public getSocketCore(Definition: Constructor<unknown>): ISocket {
    const name = ApiDefinition.nameOf(Definition);
    return new ServerSocket(this.server.of(`/${name}`));
  }
}
