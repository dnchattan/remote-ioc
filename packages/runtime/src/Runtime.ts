import { v4 } from 'uuid';
import { getApiDefinitionName } from './Decorators/getApiDefinitionName';
import { exportApi } from './ExportApi';
import { generateMetadata } from './GenerateMetadata';
import { DeferredValue, Mutex } from './Helpers';
import { importApi } from './ImportApi';
import { IPCSocket, Metadata } from './Interfaces';
import { InProcSocket } from './InProcSocket';
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
  private socketSet = new Set<IPCSocket>();
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
    const tryResolveSocket = () => {
      for (const [, { socket, provides }] of this.socketMap) {
        if (provides.includes(name)) {
          return socket;
        }
      }
      return undefined;
    };
    const resolveSocket = () => {
      const socket = tryResolveSocket();
      if (socket) {
        deferredSocket.resolve(socket);
      } else {
        deferredSocket.reject(new Error(`Provider not found for '${name}'`));
      }
    };

    const existingSocket = tryResolveSocket();
    if (existingSocket) {
      deferredSocket.resolve(existingSocket);
    } else if (this.connectionMutex) {
      this.connectionMutex
        .wait()
        .then(resolveSocket)
        .catch((err) => {
          deferredSocket.reject(err);
        });
    } else {
      resolveSocket();
    }
    return importApi<T>(name, deferredSocket, metadata);
  }

  public connect(socket: IPCSocket): void {
    // socket is already wired
    if (this.socketSet.has(socket)) {
      this.sendDiscoverToSocket(socket);
      return;
    }

    this.socketSet.add(socket);
    this.outstandingSockets.add(socket);
    if (!this.connectionMutex) {
      this.connectionMutex = new Mutex();
    }
    socket.on('$runtime', 'discover', this.onDiscover.bind(this, socket));
    socket.on('$runtime', 'connected', this.onConnected.bind(this, socket));
    this.sendDiscoverToSocket(socket);
  }

  private sendDiscoverToSocket(socket: IPCSocket) {
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

  public close(): void {
    for (const socket of this.socketSet) {
      socket.close();
    }
    this.socketMap.clear();
    this.socketSet.clear();
    this.outstandingSockets.clear();
    this.connectionMutex?.signal();
  }

  private onConnected(parent: IPCSocket, child?: IPCSocket) {
    if (child) {
      this.connect(child);
    } else {
      // delay since connection may be synchronous
      setTimeout(() => {
        // child is tunnelling through parent, rebroadcast
        this.sendDiscoverToSocket(parent);
      }, 100);
    }
  }

  private onDiscover(socket: IPCSocket, { id, provides }: DiscoverMessage) {
    this.outstandingSockets.delete(socket);
    this.socketMap.set(id, { id, socket, provides });
    if (this.outstandingSockets.size === 0) {
      this.connectionMutex?.signal();
      delete this.connectionMutex;
    }
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

let runtime: Runtime;
export function getDefaultRuntime() {
  if (!runtime) {
    runtime = new Runtime();
  }
  return runtime;
}
