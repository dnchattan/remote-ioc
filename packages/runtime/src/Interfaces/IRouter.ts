import { Constructor } from '../Types';
import { ISocket } from './ISocket';

/**
 * Responsible for routing an API definition to the appropriate `ISocket`
 */
export interface IRouter {
  /**
   * Gets a socket for the provided Definition
   */
  getSocket(Definition: Constructor): ISocket;
}
