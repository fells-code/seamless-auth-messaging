export type MessagingChannel = "email" | "sms";

export interface DeliveryResult {
  accepted: boolean;
  provider: string;
  channel: MessagingChannel;
  messageId?: string;
  raw?: unknown;
}

export interface EmailMessage {
  to: string;
  from?: string;
  subject: string;
  text: string;
  html?: string;
}

export interface SmsMessage {
  to: string;
  from?: string;
  body: string;
}
