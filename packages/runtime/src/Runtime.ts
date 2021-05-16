import { v4 } from 'uuid';
import { getApiDefinitionName } from './Decorators/getApiDefinitionName';
import { exportApi } from './ExportApi';
import { generateMetadata } from './GenerateMetadata';
import { importApi } from './ImportApi';
import { IPCSocket, Metadata } from './Interfaces';
import { ConcreteConstructor, Constructor, InstanceOf, Promisify } from './Types';

type SocketId = string;
type DefinitionName = string;

interface SocketDescriptor {
  id: SocketId;
  socket: IPCSocket;
  provides: string[];
}

interface DefinitionDescriptor {
  name: DefinitionName;
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

export class Runtime {
  private id = v4();
  private socketMap = new Map<SocketId, SocketDescriptor>();
  private definitionMap = new Map<DefinitionName, DefinitionDescriptor>();
  private providerMap = new Map<Constructor, ProviderDescriptor>();

  private getProviderNames(): string[] {
    return Array.from(this.providerMap.values()).map((provider) => provider.definitionDescriptor.name);
  }

  public async getProvider<T extends {}>(definition: Constructor<T>): Promise<Promisify<T>> {
    const { name, metadata } = this.getDefinitionDescriptor(definition);
    for (const [, { socket, provides }] of this.socketMap) {
      if (provides.includes(name)) {
        socket.send('$runtime', 'create', name);
        // eslint-disable-next-line no-await-in-loop
        return importApi<T>(definition.name, socket, metadata);
      }
    }
    throw new Error(`Not found`);
  }

  public connect(socket: IPCSocket): void {
    socket.on('$runtime', 'discover', this.onDiscover.bind(this, socket));
    socket.on('$runtime', 'create', this.onCreate.bind(this, socket));
    const message: DiscoverMessage = {
      id: this.id,
      provides: this.getProviderNames(),
    };
    socket.send('$runtime', 'discover', message);
  }

  private onDiscover(socket: IPCSocket, { id, provides }: DiscoverMessage) {
    this.socketMap.set(id, { id, socket, provides });
  }

  private onCreate(socket: IPCSocket, name: DefinitionName) {
    const definition = this.getDefinition(name);
    if (!definition) {
      // should not be possible!
      return;
    }
    const provider = this.providerMap.get(definition);
    if (!provider) {
      // should not be possible!
      return;
    }
    // eslint-disable-next-line new-cap
    provider.instance = new provider.provider();
    exportApi(provider.instance as any, name, socket);
  }

  private getDefinitionDescriptor(definition: Constructor): DefinitionDescriptor {
    const name = getApiDefinitionName(definition);
    if (!name) {
      throw new Error(`Type '${definition.name}' does not have an @ApiDefinition decorator`);
    }
    const definitionDescriptor = this.definitionMap.get(name);
    if (!definitionDescriptor) {
      throw new Error(`Definition '${name}' was not found`);
    }
    return definitionDescriptor;
  }

  private broadcastDiscoverToAllConnections(definitions: string[]): void {
    const message: DiscoverMessage = { id: this.id, provides: definitions };
    for (const [, { socket }] of this.socketMap) {
      socket.send('$runtime', 'discover', message);
    }
  }

  public registerProvider(definition: Constructor, provider: ConcreteConstructor): void {
    const definitionDescriptor = this.getDefinitionDescriptor(definition);
    if (this.providerMap.has(definition)) {
      throw new Error(`Api provider already exists for the defintion '${definitionDescriptor.name}'.`);
    }
    this.providerMap.set(definition, { definitionDescriptor, provider });
    this.broadcastDiscoverToAllConnections([definitionDescriptor.name]);
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
}

const runtime = new Runtime();
export function getDefaultRuntime() {
  return runtime;
}
