import type { IPC, server } from 'node-ipc';

export type IPCServer = typeof server;

export type IPCType = typeof IPC;
export type IPCInstance = InstanceType<IPCType>;
