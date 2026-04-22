import { MessagingConfigurationError, MessagingError } from "./errors.js";
import type { EmailMessage, SmsMessage } from "./types.js";

export function assertNonEmptyString(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new MessagingConfigurationError(`"${fieldName}" must be a non-empty string.`);
  }
}

export function assertLikelyEmail(value: string, fieldName: string): void {
  if (!value.includes("@") || value.startsWith("@") || value.endsWith("@")) {
    throw new MessagingError("INVALID_INPUT", `"${fieldName}" must be a valid email address.`);
  }
}

export function assertLikelyPhoneNumber(value: string, fieldName: string): void {
  if (!/^\+?[1-9]\d{6,14}$/.test(value)) {
    throw new MessagingError(
      "INVALID_INPUT",
      `"${fieldName}" must be a valid E.164-like phone number.`,
    );
  }
}

export function assertLikelyUrl(value: string, fieldName: string): void {
  try {
    const parsed = new URL(value);

    if (!parsed.protocol.startsWith("http")) {
      throw new Error("unsupported protocol");
    }
  } catch (error) {
    throw new MessagingError("INVALID_INPUT", `"${fieldName}" must be a valid HTTP(S) URL.`, error);
  }
}

export function assertEmailMessage(message: EmailMessage): void {
  assertNonEmptyString(message.to, "message.to");
  assertLikelyEmail(message.to, "message.to");
  assertNonEmptyString(message.subject, "message.subject");
  assertNonEmptyString(message.text, "message.text");

  if (message.from) {
    assertNonEmptyString(message.from, "message.from");
    assertLikelyEmail(message.from, "message.from");
  }

  if (message.html !== undefined) {
    assertNonEmptyString(message.html, "message.html");
  }
}

export function assertSmsMessage(message: SmsMessage): void {
  assertNonEmptyString(message.to, "message.to");
  assertLikelyPhoneNumber(message.to, "message.to");
  assertNonEmptyString(message.body, "message.body");

  if (message.from) {
    assertNonEmptyString(message.from, "message.from");
  }
}
