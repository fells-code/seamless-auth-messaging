# Provider Model

## Why A Provider Model Matters

SeamlessAuth needs message delivery, but adopters should not have to rewrite auth flows every time they change vendors or delivery stacks.

The provider model should separate:

- auth intent
- channel capability
- transport implementation

## `0.1.0` Provider Rules

- AWS is the full-coverage launch provider
- Twilio is an SMS launch provider
- email and SMS should be configurable independently
- the core package should not assume one provider owns every channel
- custom handlers should remain a supported escape hatch

## Launch Matrix

| Flow       | Channel | AWS | Twilio |
| ---------- | ------- | --- | ------ |
| Email OTP  | Email   | Yes | No     |
| SMS OTP    | SMS     | Yes | Yes    |
| Magic link | Email   | Yes | No     |

This is why a channel-based composition model is safer than a single `provider: "aws" | "twilio"` switch.

## Core Contracts

The package system is built around concepts like these:

```ts
export interface EmailTransport {
  send(message: EmailMessage): Promise<DeliveryResult>;
}

export interface SmsTransport {
  send(message: SmsMessage): Promise<DeliveryResult>;
}

export interface AuthMessagingHandlers {
  sendOtpEmail?: (input: SendOtpEmailInput) => Promise<DeliveryResult>;
  sendOtpSms?: (input: SendOtpSmsInput) => Promise<DeliveryResult>;
  sendMagicLinkEmail?: (input: SendMagicLinkEmailInput) => Promise<DeliveryResult>;
}

export interface AuthMessagingService {
  sendOtpEmail(input: SendOtpEmailInput): Promise<DeliveryResult>;
  sendOtpSms(input: SendOtpSmsInput): Promise<DeliveryResult>;
  sendMagicLinkEmail(input: SendMagicLinkEmailInput): Promise<DeliveryResult>;
}
```

The important parts are:

- auth-domain operations at the top
- channel transports underneath
- optional custom handlers as an escape hatch
- normalized results and errors throughout

## Configuration Direction

The package prefers explicit object configuration over hidden environment reads.

Recommended style:

```ts
const messaging = createAuthMessagingService({
  appName: "My App",
  email: createAwsEmailTransport({
    region: process.env.AWS_REGION!,
    fromEmail: process.env.SES_EMAIL!,
  }),
  sms: createTwilioSmsTransport({
    accountSid: process.env.TWILIO_ACCOUNT_SID!,
    authToken: process.env.TWILIO_AUTH_TOKEN!,
    fromNumber: process.env.TWILIO_FROM_NUMBER!,
  }),
});
```

This matches the broader SeamlessAuth preference for explicit integration over magic configuration.

## Template Strategy

Each auth-domain method ships with a sensible default message.

Today that means:

- OTP email subject/body
- OTP SMS body
- magic link email subject/body

Transports deliver rendered content. They do not own auth business logic.

Integrators can customize that behavior in two ways:

- override message rendering for a specific auth flow
- replace a specific auth flow with a custom handler

## Error Model

The package normalizes provider failures into a small set of useful categories:

- configuration error
- transport error
- provider rejection
- unsupported capability

That will make logs and future retries much easier to reason about across vendors.

## Future Providers

Likely future connectors:

- SendGrid
- Mailgun
- Resend
- Postmark

The current design leaves room for those by:

- keeping email transport APIs independent from SMS transport APIs
- avoiding provider enums baked into the core domain
- keeping the message model simple and portable
