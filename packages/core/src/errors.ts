import type { MessagingChannel } from "./types.js";

export class MessagingError extends Error {
  readonly code: string;
  override readonly cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.code = code;
    this.cause = cause;
    this.name = "MessagingError";
  }
}

export class MessagingConfigurationError extends MessagingError {
  constructor(message: string, cause?: unknown) {
    super("INVALID_CONFIGURATION", message, cause);
    this.name = "MessagingConfigurationError";
  }
}

export class UnsupportedChannelError extends MessagingError {
  readonly channel: MessagingChannel;

  constructor(channel: MessagingChannel) {
    super("UNSUPPORTED_CHANNEL", `No provider has been configured for the "${channel}" channel.`);
    this.channel = channel;
    this.name = "UnsupportedChannelError";
  }
}

export class MessagingProviderError extends MessagingError {
  readonly provider: string;
  readonly channel: MessagingChannel;

  constructor(provider: string, channel: MessagingChannel, message: string, cause?: unknown) {
    super("PROVIDER_ERROR", message, cause);
    this.provider = provider;
    this.channel = channel;
    this.name = "MessagingProviderError";
  }
}
