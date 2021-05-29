import { ApiDefinition } from './Decorators';
import { IRouter, ISocket } from './Interfaces';
import { Loopback } from './Loopback';
import { Constructor } from './Types';

export class LocalRouter implements IRouter {
  private loopback: Loopback = new Loopback();
  private providers = new Set<Constructor>();

  registerProvider<P extends Constructor>(Provider: P): this {
    this.providers.add(Provider);
    return this;
  }

  getServer(Definition: Constructor): ISocket {
    const scope = ApiDefinition.nameOf(Definition);
    const socket = this.loopback.createSocket(scope);
    return socket;
  }
}
