import twilio from "twilio";
import type {
  DeliveryResult,
  MessagingChannel,
  SmsMessage,
  SmsTransport,
} from "@seamless-auth/messaging";
import {
  assertLikelyPhoneNumber,
  assertNonEmptyString,
  assertSmsMessage,
  MessagingProviderError,
} from "@seamless-auth/messaging";

export interface TwilioMessageCreateInput {
  to: string;
  from: string;
  body: string;
}

export interface TwilioMessageCreateResult {
  sid?: string;
  status?: string;
}

export interface TwilioClientLike {
  messages: {
    create(input: TwilioMessageCreateInput): Promise<TwilioMessageCreateResult>;
  };
}

export interface TwilioSmsProviderConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  client?: TwilioClientLike;
}

class TwilioSmsTransport implements SmsTransport {
  readonly name = "twilio";
  readonly config: TwilioSmsProviderConfig;
  readonly client: TwilioClientLike;

  constructor(config: TwilioSmsProviderConfig) {
    assertNonEmptyString(config.accountSid, "config.accountSid");
    assertNonEmptyString(config.authToken, "config.authToken");
    assertNonEmptyString(config.fromNumber, "config.fromNumber");
    assertLikelyPhoneNumber(config.fromNumber, "config.fromNumber");
    this.config = config;
    this.client = config.client ?? twilio(config.accountSid, config.authToken);
  }

  async send(message: SmsMessage): Promise<DeliveryResult> {
    assertSmsMessage(message);

    try {
      const result = await this.client.messages.create({
        to: message.to,
        from: message.from ?? this.config.fromNumber,
        body: message.body,
      });

      return {
        accepted: true,
        provider: this.name,
        channel: "sms",
        messageId: result.sid,
        raw: result,
      };
    } catch (error) {
      throw createProviderError(this.name, "sms", error);
    }
  }
}

function createProviderError(
  provider: string,
  channel: MessagingChannel,
  error: unknown,
): MessagingProviderError {
  const message =
    error instanceof Error ? error.message : `Unknown ${provider} ${channel} delivery failure`;

  return new MessagingProviderError(
    provider,
    channel,
    `Failed to send ${channel} message via ${provider}: ${message}`,
    error,
  );
}

export function createTwilioSmsTransport(config: TwilioSmsProviderConfig): SmsTransport {
  return new TwilioSmsTransport(config);
}

export const createTwilioSmsProvider = createTwilioSmsTransport;
