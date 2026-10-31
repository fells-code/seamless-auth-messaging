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

  if (message.headers !== undefined) {
    assertEmailHeaders(message.headers);
  }
}

// RFC 5322 field names are printable ASCII without a colon. A line break in
// either part would let a caller inject further headers, or a body.
const HEADER_NAME = /^[!-9;-~]+$/;
const LINE_BREAK = /[\r\n]/;

// Set by the transport from the message's own fields, so a header naming one
// would be a second, conflicting copy.
const RESERVED_HEADERS = new Set(["from", "to", "cc", "bcc", "subject", "content-type"]);

export function assertEmailHeaders(headers: Record<string, string>): void {
  if (typeof headers !== "object" || headers === null || Array.isArray(headers)) {
    throw new MessagingError("INVALID_INPUT", `"message.headers" must be an object.`);
  }

  for (const [name, value] of Object.entries(headers)) {
    if (!HEADER_NAME.test(name)) {
      throw new MessagingError("INVALID_INPUT", `"${name}" is not a valid header name.`);
    }

    if (RESERVED_HEADERS.has(name.toLowerCase())) {
      throw new MessagingError(
        "INVALID_INPUT",
        `"${name}" is set from the message itself and cannot be passed as a header.`,
      );
    }

    if (typeof value !== "string" || value.trim().length === 0 || LINE_BREAK.test(value)) {
      throw new MessagingError(
        "INVALID_INPUT",
        `The "${name}" header must be a non-empty string on a single line.`,
      );
    }
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
