export interface ISocket {
  /**
   * Closes the socket
   */
  close(): void;

  /**
   * Sends a message to the specified channel
   * @param channel message channel name
   * @param args arguments for channel receiver
   */
  send(channel: string, ...args: any[]): this;

  /**
   * Subscribes to messages in the specified channel
   * @param channel message channel type
   * @param handler callback to be called when a message for this channel is received
   */
  on(channel: string, handler: (...args: any[]) => void): this;

  /**
   * Unsubscribes to messages in the specified channel
   * @param channel message channel type
   * @param handler callback to be removed from this channel
   */
  off(channel: string, handler: (...args: any[]) => void): this;
}
