import { v4 } from 'uuid';
import { getApiDefinitionName } from './Decorators/getApiDefinitionName';
import { generateMetadata } from './GenerateMetadata';
import { IPCSocket, Metadata } from './Interfaces';
import { ConcreteConstructor, Constructor, InstanceOf } from './Types';

interface SocketDescriptor {
  id: string;
  socket: IPCSocket;
}

interface DefinitionDescriptor {
  name: string;
  definition: Constructor;
  metadata: Metadata;
}

interface ProviderDescriptor<T extends ConcreteConstructor = ConcreteConstructor<unknown>> {
  definitionDescriptor: DefinitionDescriptor;
  provider: T;
  instance?: InstanceOf<T>;
}

interface DiscoverMessage {
  id: string;
  provides: DefinitionName[];
}

type SocketId = string;
type DefinitionName = string;

export class Runtime {
  private id = v4();
  private socketMap = new Map<SocketId, SocketDescriptor>();
  private definitionNameToSocketId = new Map<DefinitionName, SocketId>();
  private definitionMap = new Map<DefinitionName, DefinitionDescriptor>();
  private providerMap = new Map<Constructor, ProviderDescriptor>();

  private getProviderNames(): string[] {
    return Array.from(this.providerMap.values()).map((provider) => provider.definitionDescriptor.name);
  }

  connect(socket: IPCSocket): void {
    socket.on('$runtime', 'discover', this.onDiscover.bind(this, socket));
    const message: DiscoverMessage = {
      id: this.id,
      provides: this.getProviderNames(),
    };
    socket.send('$runtime', 'discover', message);
  }

  private onDiscover(socket: IPCSocket, { id, provides }: DiscoverMessage) {
    this.socketMap.set(id, { id, socket });
    for (const name of provides) {
      this.definitionNameToSocketId.set(name, id);
    }
  }

  private broadcastDiscoverToAllConnections(definitions: string[]): void {
    const message: DiscoverMessage = { id: this.id, provides: definitions };
    for (const [, { socket }] of this.socketMap) {
      socket.send('$runtime', 'discover', message);
    }
  }

  public registerProvider(definition: Constructor, provider: ConcreteConstructor): void {
    const name = getApiDefinitionName(definition);
    if (!name) {
      throw new Error(`Type '${definition.name}' does not have an @ApiDefinition decorator`);
    }
    const definitionDescriptor = this.definitionMap.get(name);
    if (!definitionDescriptor) {
      throw new Error(`Definition '${name}' was not found`);
    }
    if (this.providerMap.has(definition)) {
      throw new Error(`Api provider already exists for the defintion '${name}'.`);
    }
    this.providerMap.set(definition, { definitionDescriptor, provider });
    this.broadcastDiscoverToAllConnections([name]);
  }

  public registerDefinition(name: string, definition: Constructor) {
    if (this.definitionMap.has(name)) {
      throw new Error(`Api definition already exists for the name '${name}'.`);
    }
    const metadata = generateMetadata(definition);
    this.definitionMap.set(name, { name, definition, metadata });
  }

  public getDefinition<T extends Constructor>(name: string): T | undefined {
    return this.definitionMap.get(name)?.definition as T | undefined;
  }

  // private onReceiveApi(socket: IPCSocket, name: string) {
  //   this.definitionNameToSocketId.set(name, socket);
  //   const resolution = this.apiResolutions.get(name);
  //   if (resolution) {
  //     importApi(name, socket).then((api) => this.promiseStore.resolve(resolution[0], api));
  //   }
  // }

  // registerApi<T extends ConcreteConstructor>(apiProvider: T): void {}

  // // eslint-disable-next-line class-methods-use-this
  // getApi<T extends Constructor>(apiDefinition: T): Promise<Promisify<InstanceOf<T>>> {
  //   const definitionName = getApiDefinitionName(apiDefinition);
  //   let resolution = this.apiResolutions.get(definitionName);
  //   if (!resolution) {
  //     resolution = this.promiseStore.create();
  //     const socket = this.definitionNameToSocketId.get(definitionName);
  //     if (socket) {
  //       this.onReceiveApi(socket, definitionName);
  //     }
  //   }
  //   return resolution[1];
  // }
}

const runtime = new Runtime();
export function getDefaultRuntime() {
  return runtime;
}
