import { ApiDefinition } from './Decorators';
import { ApiProvider } from './Decorators/ApiProvider';
import { IRouter, ISocket } from './Interfaces';
import { Loopback } from './Loopback';
import { Constructor } from './Types';

export class LocalRouter implements IRouter {
  private loopback: Loopback = new Loopback();
  private providers = new Set<Constructor>();

  async queryDefinition(Definition: Constructor): Promise<boolean> {
    for (const provider of this.providers) {
      if (ApiProvider.implementationsOf(provider).includes(Definition)) {
        return true;
      }
    }
    return false;
  }

  registerProvider<P extends Constructor>(Provider: P): this {
    this.providers.add(Provider);
    return this;
  }

  getServer(Definition: Constructor): ISocket {
    const scope = ApiDefinition.nameOf(Definition);
    const socket = this.loopback.createSocket(scope);
    return socket;
  }

  getSocket(Definition: Constructor): ISocket {
    const scope = ApiDefinition.nameOf(Definition);
    const socket = this.loopback.createSocket(scope);
    return socket;
  }
}
