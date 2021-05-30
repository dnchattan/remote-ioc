import { ApiDefinition, ApiProvider } from './Decorators';
import { ISocket } from './Interfaces';
import { Loopback } from './Loopback';
import { RouterBase } from './RouterBase';
import { getLoopback } from './RuntimeContext';
import { Constructor } from './Types';

export class LocalRouter extends RouterBase {
  private loopback: Loopback = getLoopback() || new Loopback();
  constructor(readonly name: string) {
    super();
    this.loopback.on('$local-router', 'discover/request', this.onDiscoverRequest);
    this.loopback.on('$local-router', 'discover/response', this.onDiscoverResponse);
    setTimeout(() => {
      this.loopback.send('$local-router', 'discover/request');
    }, 5);
  }

  private onDiscoverRequest = () => {
    const definitions: Constructor[] = [];
    for (const provider of this.providers) {
      definitions.push(...ApiProvider.implementationsOf(provider));
    }
    this.loopback.send('$local-router', 'discover/response', definitions);
  };

  private onDiscoverResponse = (definitions: Constructor[]) => {
    this.emit(
      'discover',
      definitions.map((def) => ApiDefinition.nameOf(def))
    );
  };

  getSocket(Definition: Constructor): ISocket {
    const scope = ApiDefinition.nameOf(Definition);
    const socket = this.loopback.createSocket(scope);
    return socket;
  }
}
