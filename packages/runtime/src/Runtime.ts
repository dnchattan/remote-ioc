import { v4 } from 'uuid';
import { getApiDefinitionName } from './Decorators/getApiDefinitionName';
import { exportApi } from './ExportApi';
import { generateMetadata } from './GenerateMetadata';
import { DeferredValue, Mutex } from './Helpers';
import { importApi } from './ImportApi';
import { IPCSocket, Metadata } from './Interfaces';
import { InProcSocket } from './Tests/InProcSocket';
import { Constructor, InstanceOf, Promisify } from './Types';

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

interface ProviderDescriptor<T extends Constructor = Constructor<unknown>> {
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
  private outstandingSockets = new Set<IPCSocket>();
  private connectionMutex?: Mutex;

  constructor() {
    // pipe local providers through a pseudo-socket for consistency
    this.connect(new InProcSocket());
  }

  public getInstance<T>(definition: Constructor<T>): T {
    const localProvider = this.providerMap.get(definition);
    if (!localProvider) {
      throw new Error(`Provider not found for '${getApiDefinitionName(definition)}'`);
    }
    if (!localProvider.instance) {
      // eslint-disable-next-line new-cap
      localProvider.instance = new localProvider.provider();
    }
    return localProvider.instance as T;
  }

  public getProvider<T>(definition: Constructor<T>): Promisify<T> {
    const { name, metadata } = this.getDefinitionDescriptor(definition);
    const deferredSocket = new DeferredValue<IPCSocket>();
    const resolveSocket = () => {
      for (const [, { socket, provides }] of this.socketMap) {
        if (provides.includes(name)) {
          // eslint-disable-next-line no-await-in-loop
          deferredSocket.resolve(socket);
          return;
        }
      }
      deferredSocket.reject(new Error(`Provider not found for '${name}'`));
    };

    if (this.connectionMutex) {
      this.connectionMutex.wait().then(resolveSocket);
    } else {
      resolveSocket();
    }
    return importApi<T>(name, deferredSocket, metadata);
  }

  public connect(socket: IPCSocket): void {
    this.outstandingSockets.add(socket);
    if (!this.connectionMutex) {
      const mutex = new Mutex();
      mutex.wait()?.then(() => {
        if (this.connectionMutex === mutex) {
          delete this.connectionMutex;
        }
      });
      this.connectionMutex = mutex;
    }
    socket.on('$runtime', 'discover', this.onDiscover.bind(this, socket));
    const provides: string[] = [];
    for (const {
      definitionDescriptor: { name, definition },
    } of this.providerMap.values()) {
      provides.push(name);
      exportApi(this, definition, name, socket);
    }
    const message: DiscoverMessage = {
      id: this.id,
      provides,
    };
    socket.send('$runtime', 'discover', message);
  }

  private onDiscover(socket: IPCSocket, { id, provides }: DiscoverMessage) {
    this.outstandingSockets.delete(socket);
    if (this.outstandingSockets.size === 0) {
      this.connectionMutex?.signal();
    }
    this.socketMap.set(id, { id, socket, provides });
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

  private broadcastDiscoverToAllConnections(definitions: DefinitionDescriptor[]): void {
    const providers: ProviderDescriptor[] = [];
    const provides: string[] = [];
    for (const definition of definitions) {
      const provider = this.providerMap.get(definition.definition);
      if (!provider) {
        continue;
      }
      provides.push(definition.name);
      providers.push(provider);
    }
    const message: DiscoverMessage = { id: this.id, provides };
    for (const [, { socket }] of this.socketMap) {
      for (const {
        definitionDescriptor: { definition, name },
      } of providers) {
        exportApi(this, definition, name, socket);
      }
      socket.send('$runtime', 'discover', message);
    }
  }

  public registerProvider(definition: Constructor, provider: Constructor): void {
    const definitionDescriptor = this.getDefinitionDescriptor(definition);
    if (this.providerMap.has(definition)) {
      throw new Error(`Api provider already exists for the defintion '${definitionDescriptor.name}'.`);
    }
    this.providerMap.set(definition, { definitionDescriptor, provider });
    this.broadcastDiscoverToAllConnections([definitionDescriptor]);
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
