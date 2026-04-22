# Provider Model

## Why A Provider Model Matters

SeamlessAuth needs message delivery, but adopters should not have to rewrite auth flows every time they change vendors or delivery stacks.

The provider model should separate:

- auth intent
- channel capability
- transport implementation

## `0.1.0` Provider Rules

- AWS is the full-coverage provider for launch
- Twilio is an SMS provider for launch
- email and SMS should be configurable independently
- the core package should not assume one provider owns every channel
- custom handlers should remain a supported escape hatch

## Launch Matrix

| Flow             | Channel | AWS | Twilio |
| ---------------- | ------- | --- | ------ |
| Email OTP        | Email   | Yes | No     |
| SMS OTP          | SMS     | Yes | Yes    |
| Magic link       | Email   | Yes | No     |
| Bootstrap invite | Email   | Yes | No     |

This is why a channel-based composition model is safer than a single `provider: "aws" | "twilio"` switch.

## Recommended Core Contracts

The implementation can vary, but the package system should end up with concepts close to these:

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
  sendBootstrapInviteEmail?: (input: SendBootstrapInviteEmailInput) => Promise<DeliveryResult>;
}

export interface AuthMessagingService {
  sendOtpEmail(input: SendOtpEmailInput): Promise<DeliveryResult>;
  sendOtpSms(input: SendOtpSmsInput): Promise<DeliveryResult>;
  sendMagicLinkEmail(input: SendMagicLinkEmailInput): Promise<DeliveryResult>;
  sendBootstrapInviteEmail(input: SendBootstrapInviteEmailInput): Promise<DeliveryResult>;
}
```

The important part is not the exact names. The important part is:

- auth-domain operations at the top
- channel transports underneath
- optional custom handlers as an escape hatch
- normalized results and errors throughout

## Configuration Direction

The package should prefer explicit object configuration over hidden environment reads.

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
    fromNumber: process.env.TWILIO_PHONE_NUMBER!,
  }),
});
```

This matches the broader SeamlessAuth preference for explicit integration over magic configuration.

## Template Strategy

For launch, each auth-domain method should render a sensible default message.

Examples:

- OTP email subject/body
- OTP SMS body
- magic link email subject/body
- bootstrap invite email subject/body

Transports should deliver rendered content, not own business logic for auth messaging.

## Error Model

The package should normalize provider failures into a small set of useful categories:

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

The package should be ready for those by:

- keeping email transport APIs independent from SMS transport APIs
- avoiding provider enums baked into the core domain
- keeping the message model simple and portable
