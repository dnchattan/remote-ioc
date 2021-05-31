export interface ISocket<TMessageIn = Record<string, any>, TMessageOut = Record<string, any>, TContext = unknown> {
  /**
   * Closes the socket
   */
  close(): void;

  /**
   * Sends a message to the specified channel
   * @param channel message channel name
   * @param args arguments for channel receiver
   */
  send<Channel extends keyof TMessageOut>(channel: Channel, message: TMessageOut[Channel], context?: TContext): this;

  /**
   * Subscribes to messages in the specified channel
   * @param channel message channel type
   * @param handler callback to be called when a message for this channel is received
   */
  on<Channel extends keyof TMessageIn>(
    channel: Channel,
    handler: (message: TMessageIn[Channel], context?: TContext) => void
  ): this;

  /**
   * Unsubscribes to messages in the specified channel
   * @param channel message channel type
   * @param handler callback to be removed from this channel
   */
  off<Channel extends keyof TMessageIn>(
    channel: Channel,
    handler: (message: TMessageIn[Channel], context?: TContext) => void
  ): this;
}
