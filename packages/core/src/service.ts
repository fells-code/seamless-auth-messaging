import { UnsupportedChannelError } from "./errors.js";
import type {
  AuthMessageOverrideContext,
  AuthMessageOverrides,
  AuthMessagingHandlers,
  AuthMessagingService,
  EmailTransport,
  SmsTransport,
} from "./transports.js";
import type { EmailMessage, SmsMessage } from "./types.js";
import {
  assertLikelyEmail,
  assertLikelyPhoneNumber,
  assertLikelyUrl,
  assertNonEmptyString,
} from "./validation.js";

export interface CreateAuthMessagingServiceOptions {
  appName: string;
  email?: EmailTransport;
  sms?: SmsTransport;
  handlers?: Partial<AuthMessagingHandlers>;
  overrides?: AuthMessageOverrides;
  defaults?: {
    emailFrom?: string;
    smsFrom?: string;
  };
}

function buildOtpEmailText(appName: string, token: string): string {
  return [
    `Verify your account with ${appName}.`,
    "",
    `Your verification code is: ${token}`,
    "",
    "If you did not request this code, you can safely ignore this message.",
  ].join("\n");
}

function buildOtpEmailHtml(appName: string, token: string): string {
  return [
    "<div>",
    `  <h1>Verify your account with ${appName}</h1>`,
    "  <p>Please use the verification code below:</p>",
    `  <p><strong>${token}</strong></p>`,
    "  <p>If you did not request this code, you can safely ignore this message.</p>",
    "</div>",
  ].join("\n");
}

function buildMagicLinkText(appName: string, magicLinkUrl: string): string {
  return [
    `Use the link below to sign in to ${appName}:`,
    "",
    magicLinkUrl,
    "",
    "If you did not request this email, you can safely ignore it.",
  ].join("\n");
}

function buildMagicLinkHtml(appName: string, magicLinkUrl: string): string {
  return [
    "<div>",
    `  <h1>Sign in to ${appName}</h1>`,
    "  <p>Use the link below to complete sign-in:</p>",
    `  <p><a href="${magicLinkUrl}">${magicLinkUrl}</a></p>`,
    "  <p>If you did not request this email, you can safely ignore it.</p>",
    "</div>",
  ].join("\n");
}

function buildEnrollmentInviteText(appName: string, signInUrl: string): string {
  return [
    `${appName} is moving sign-in to passkeys.`,
    "",
    "Sign in at the link below and you will be asked to add a passkey, which lets you sign in",
    "with your device's screen lock or a security key instead of a password or code:",
    "",
    signInUrl,
    "",
    "This link only opens the sign-in page. If you were not expecting this, you can ignore it.",
  ].join("\n");
}

function buildEnrollmentInviteHtml(appName: string, signInUrl: string): string {
  return [
    "<div>",
    `  <h1>Add a passkey to your ${appName} account</h1>`,
    `  <p>${appName} is moving sign-in to passkeys. Sign in at the link below and you will be asked to add one, so you can sign in with your device's screen lock or a security key.</p>`,
    `  <p><a href="${signInUrl}">${signInUrl}</a></p>`,
    "  <p>This link only opens the sign-in page. If you were not expecting this, you can ignore it.</p>",
    "</div>",
  ].join("\n");
}

function buildOtpSmsText(appName: string, token: string | number): string {
  return `Your ${appName} verification code is: ${token}. No one will ever ask you for this code. Do not share it.`;
}

function createOverrideContext(appName: string): AuthMessageOverrideContext {
  return { appName };
}

function applyEmailOverride<TInput>(
  override:
    | ((input: TInput, defaults: EmailMessage, context: AuthMessageOverrideContext) => EmailMessage)
    | undefined,
  input: TInput,
  defaults: EmailMessage,
  context: AuthMessageOverrideContext,
): EmailMessage {
  return override ? override(input, defaults, context) : defaults;
}

function applySmsOverride<TInput>(
  override:
    | ((input: TInput, defaults: SmsMessage, context: AuthMessageOverrideContext) => SmsMessage)
    | undefined,
  input: TInput,
  defaults: SmsMessage,
  context: AuthMessageOverrideContext,
): SmsMessage {
  return override ? override(input, defaults, context) : defaults;
}

export function createAuthMessagingService(
  options: CreateAuthMessagingServiceOptions,
): AuthMessagingService {
  const { appName, email, sms, handlers, overrides, defaults } = options;
  assertNonEmptyString(appName, "options.appName");
  const context = createOverrideContext(appName);

  return {
    async sendOtpEmail(input) {
      if (handlers?.sendOtpEmail) {
        return handlers.sendOtpEmail(input);
      }

      if (!email) {
        throw new UnsupportedChannelError("email");
      }

      assertLikelyEmail(input.to, "input.to");
      assertNonEmptyString(input.token, "input.token");

      const message = applyEmailOverride(
        overrides?.otpEmail,
        input,
        {
          to: input.to,
          from: input.from ?? defaults?.emailFrom,
          subject: input.subject ?? `${appName} - Verify your email`,
          text: buildOtpEmailText(appName, input.token),
          html: buildOtpEmailHtml(appName, input.token),
        },
        context,
      );

      return email.send(message);
    },

    async sendOtpSms(input) {
      if (handlers?.sendOtpSms) {
        return handlers.sendOtpSms(input);
      }

      if (!sms) {
        throw new UnsupportedChannelError("sms");
      }

      assertLikelyPhoneNumber(input.to, "input.to");
      assertNonEmptyString(String(input.token), "input.token");

      const message = applySmsOverride(
        overrides?.otpSms,
        input,
        {
          to: input.to,
          from: input.from ?? defaults?.smsFrom,
          body: buildOtpSmsText(appName, input.token),
        },
        context,
      );

      return sms.send(message);
    },

    async sendMagicLinkEmail(input) {
      if (handlers?.sendMagicLinkEmail) {
        return handlers.sendMagicLinkEmail(input);
      }

      if (!email) {
        throw new UnsupportedChannelError("email");
      }

      assertLikelyEmail(input.to, "input.to");
      assertLikelyUrl(input.magicLinkUrl, "input.magicLinkUrl");

      const message = applyEmailOverride(
        overrides?.magicLinkEmail,
        input,
        {
          to: input.to,
          from: input.from ?? defaults?.emailFrom,
          subject: input.subject ?? `${appName} - Your sign-in link`,
          text: buildMagicLinkText(appName, input.magicLinkUrl),
          html: buildMagicLinkHtml(appName, input.magicLinkUrl),
        },
        context,
      );

      return email.send(message);
    },

    async sendEnrollmentInviteEmail(input) {
      if (handlers?.sendEnrollmentInviteEmail) {
        return handlers.sendEnrollmentInviteEmail(input);
      }

      if (!email) {
        throw new UnsupportedChannelError("email");
      }

      assertLikelyEmail(input.to, "input.to");
      assertLikelyUrl(input.signInUrl, "input.signInUrl");

      const message = applyEmailOverride(
        overrides?.enrollmentInviteEmail,
        input,
        {
          to: input.to,
          from: input.from ?? defaults?.emailFrom,
          subject: input.subject ?? `${appName} - Add a passkey to your account`,
          text: buildEnrollmentInviteText(appName, input.signInUrl),
          html: buildEnrollmentInviteHtml(appName, input.signInUrl),
        },
        context,
      );

      return email.send(message);
    },
  };
}

export type MessagingClient = AuthMessagingService;
export type CreateMessagingClientOptions = CreateAuthMessagingServiceOptions;

export function createMessagingClient(options: CreateMessagingClientOptions): MessagingClient {
  return createAuthMessagingService(options);
}
