import {
  PublishCommand,
  SNSClient,
  type PublishCommandOutput,
  type PublishCommandInput,
} from "@aws-sdk/client-sns";
import {
  SendEmailCommand,
  SESClient,
  type SendEmailCommandOutput,
  type SendEmailCommandInput,
} from "@aws-sdk/client-ses";
import type {
  DeliveryResult,
  EmailMessage,
  EmailTransport,
  MessagingChannel,
  SmsMessage,
  SmsTransport,
} from "@seamless-auth/messaging";
import {
  assertEmailMessage,
  assertLikelyEmail,
  assertNonEmptyString,
  assertSmsMessage,
  MessagingProviderError,
} from "@seamless-auth/messaging";

export interface AwsSesClientLike {
  send(command: SendEmailCommand): Promise<SendEmailCommandOutput>;
}

export interface AwsSnsClientLike {
  send(command: PublishCommand): Promise<PublishCommandOutput>;
}

export interface AwsEmailProviderConfig {
  region: string;
  fromEmail: string;
  sesClient?: AwsSesClientLike;
}

export interface AwsSmsProviderConfig {
  region: string;
  senderId?: string;
  snsClient?: AwsSnsClientLike;
}

class AwsSesEmailTransport implements EmailTransport {
  readonly name = "aws-ses";
  readonly config: AwsEmailProviderConfig;
  readonly client: AwsSesClientLike;

  constructor(config: AwsEmailProviderConfig) {
    assertNonEmptyString(config.region, "config.region");
    assertNonEmptyString(config.fromEmail, "config.fromEmail");
    assertLikelyEmail(config.fromEmail, "config.fromEmail");
    this.config = config;
    this.client = config.sesClient ?? new SESClient({ region: config.region });
  }

  async send(message: EmailMessage): Promise<DeliveryResult> {
    assertEmailMessage(message);

    const input: SendEmailCommandInput = {
      Source: message.from ?? this.config.fromEmail,
      Destination: {
        ToAddresses: [message.to],
      },
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: message.subject,
        },
        Body: {
          ...(message.html
            ? {
                Html: {
                  Charset: "UTF-8",
                  Data: message.html,
                },
              }
            : {}),
          Text: {
            Charset: "UTF-8",
            Data: message.text,
          },
        },
      },
    };

    try {
      const result = await this.client.send(new SendEmailCommand(input));
      return {
        accepted: true,
        provider: this.name,
        channel: "email",
        messageId: result.MessageId,
        raw: result,
      };
    } catch (error) {
      throw createProviderError(this.name, "email", error);
    }
  }
}

class AwsSnsSmsTransport implements SmsTransport {
  readonly name = "aws-sns";
  readonly config: AwsSmsProviderConfig;
  readonly client: AwsSnsClientLike;

  constructor(config: AwsSmsProviderConfig) {
    assertNonEmptyString(config.region, "config.region");
    this.config = config;
    this.client = config.snsClient ?? new SNSClient({ region: config.region });
  }

  async send(message: SmsMessage): Promise<DeliveryResult> {
    assertSmsMessage(message);

    const input: PublishCommandInput = {
      PhoneNumber: message.to,
      Message: message.body,
      ...((message.from ?? this.config.senderId)
        ? {
            MessageAttributes: {
              "AWS.SNS.SMS.SenderID": {
                DataType: "String",
                StringValue: message.from ?? this.config.senderId,
              },
            },
          }
        : {}),
    };

    try {
      const result = await this.client.send(new PublishCommand(input));
      return {
        accepted: true,
        provider: this.name,
        channel: "sms",
        messageId: result.MessageId,
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

export function createAwsEmailTransport(config: AwsEmailProviderConfig): EmailTransport {
  return new AwsSesEmailTransport(config);
}

export function createAwsSmsTransport(config: AwsSmsProviderConfig): SmsTransport {
  return new AwsSnsSmsTransport(config);
}

export const createAwsEmailProvider = createAwsEmailTransport;
export const createAwsSmsProvider = createAwsSmsTransport;
