import { notReached } from './Helpers';
import { IRouter } from './Interfaces';
import { Constructor } from './Types';

export class ProviderProxy<D extends Constructor> {
  constructor(private readonly Definition: D, private readonly deferredRouter: Promise<IRouter>) {}

  get api(): InstanceType<D> {
    return notReached('not implemented', this);
  }
}
