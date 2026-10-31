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
  /**
   * Extra headers to send with the message, such as `List-Unsubscribe`. Names
   * and values are passed through as given; a transport that cannot send
   * custom headers ignores them.
   */
  headers?: Record<string, string>;
}

export interface SmsMessage {
  to: string;
  from?: string;
  body: string;
}
