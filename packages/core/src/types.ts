import type { EmailMessage as SharedEmailMessage } from "@seamless-auth/types";

export type { DeliveryResult, MessagingChannel, SmsMessage } from "@seamless-auth/types";

export type EmailMessage = SharedEmailMessage & {
  /**
   * Extra headers to send with the message, such as `List-Unsubscribe`. Names
   * and values are passed through as given; a transport that cannot send
   * custom headers ignores them.
   */
  headers?: Record<string, string>;
};
