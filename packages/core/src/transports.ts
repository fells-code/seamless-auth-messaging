import type {
  SendBootstrapInviteEmailInput,
  SendMagicLinkEmailInput,
  SendOtpEmailInput,
  SendOtpSmsInput,
} from "./messages.js";
import type { DeliveryResult, EmailMessage, SmsMessage } from "./types.js";

export interface EmailTransport {
  readonly name: string;
  send(message: EmailMessage): Promise<DeliveryResult>;
}

export interface SmsTransport {
  readonly name: string;
  send(message: SmsMessage): Promise<DeliveryResult>;
}

export interface AuthMessagingHandlers {
  sendOtpEmail(input: SendOtpEmailInput): Promise<DeliveryResult>;
  sendOtpSms(input: SendOtpSmsInput): Promise<DeliveryResult>;
  sendMagicLinkEmail(input: SendMagicLinkEmailInput): Promise<DeliveryResult>;
  sendBootstrapInviteEmail(input: SendBootstrapInviteEmailInput): Promise<DeliveryResult>;
}

export interface AuthMessageOverrideContext {
  appName: string;
}

export interface AuthMessageOverrides {
  otpEmail?: (
    input: SendOtpEmailInput,
    defaults: EmailMessage,
    context: AuthMessageOverrideContext,
  ) => EmailMessage;
  otpSms?: (
    input: SendOtpSmsInput,
    defaults: SmsMessage,
    context: AuthMessageOverrideContext,
  ) => SmsMessage;
  magicLinkEmail?: (
    input: SendMagicLinkEmailInput,
    defaults: EmailMessage,
    context: AuthMessageOverrideContext,
  ) => EmailMessage;
  bootstrapInviteEmail?: (
    input: SendBootstrapInviteEmailInput,
    defaults: EmailMessage,
    context: AuthMessageOverrideContext,
  ) => EmailMessage;
}

export interface AuthMessagingService {
  sendOtpEmail(input: SendOtpEmailInput): Promise<DeliveryResult>;
  sendOtpSms(input: SendOtpSmsInput): Promise<DeliveryResult>;
  sendMagicLinkEmail(input: SendMagicLinkEmailInput): Promise<DeliveryResult>;
  sendBootstrapInviteEmail(input: SendBootstrapInviteEmailInput): Promise<DeliveryResult>;
}

export type EmailProvider = EmailTransport;
export type SmsProvider = SmsTransport;
