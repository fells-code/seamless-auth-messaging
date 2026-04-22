# Architecture

## Goal

Build a public messaging package system for SeamlessAuth that can sit behind a SeamlessAuth initializer and handle auth-specific message flows on the framework side while still using adopter-supplied transports or handlers.

## Existing Responsibilities In `seamless-auth-api`

The public API currently calls a local messaging service for four auth workflows:

- `sendOTPEmail(to, token)`
- `sendOTPSMS(to, token)`
- `sendMagicLinkEmail(to, token, safeRedirect)`
- `sendBootstrapEmail(to, url)`

Those calls appear in:

- OTP generation
- magic link login
- bootstrap admin invite flow

This is the correct product boundary to preserve. The new package should not try to become a generic notification platform.

## Design Principles

- Keep auth concerns and messaging concerns separate
- Export explicit, stable contracts
- Support per-channel provider composition
- Support both official transports and custom per-flow handlers
- Keep provider packages thin
- Make future providers easy to add without changing core call sites
- Leave room for future non-TypeScript ports by keeping the domain model clean

## Proposed Repository Shape

```text
.
├─ packages/
│  ├─ core/
│  ├─ aws/
│  └─ twilio/
├─ docs/
├─ examples/
└─ README.md
```

## Package Roles

### `@seamless-auth/messaging`

The core package should contain:

- message contracts
- delivery result and error types
- auth-focused message builders
- channel abstractions for `email` and `sms`
- transport interfaces
- optional custom handler interfaces
- auth messaging service composition helpers

It should not:

- talk to AWS directly
- talk to Twilio directly
- depend on framework code
- read environment variables by default

### `@seamless-auth/messaging-aws`

The AWS package should provide:

- SES-backed email delivery
- SNS-backed SMS delivery
- AWS-specific config validation
- provider adapters implementing the shared core contracts

### `@seamless-auth/messaging-twilio`

The Twilio package should provide:

- Twilio-backed SMS delivery
- Twilio-specific config validation
- a provider adapter implementing the shared SMS contract

For `0.1.0`, it should not try to solve email through a non-Twilio product.

## Capability Model

The core should model capabilities by channel, not by brand name.

Recommended shape:

- email transport
- SMS transport
- optional custom auth-message handlers
- composed auth messaging service

That lets adopters do this cleanly:

- AWS email + AWS SMS
- AWS email + Twilio SMS

Later additions should slot in naturally:

- SendGrid email
- Mailgun email
- Resend email
- other SMS vendors

## Message Domain

For `0.1.0`, the package should expose auth-domain operations instead of a loose `send(anything)` API.

Recommended public operations:

- `sendOtpEmail`
- `sendOtpSms`
- `sendMagicLinkEmail`
- `sendBootstrapInviteEmail`

This keeps the first release easy to integrate with the current SeamlessAuth API.

Internally, those operations can still normalize to a lower-level message model if helpful.

## Template Ownership

The package should own the default message templates for auth flows.

Why:

- the current internal implementation already treats these as product-level auth messages
- adopters need a working default immediately
- future customization can be layered on top of stable defaults

For `0.1.0`, customization should stay lightweight:

- app name
- from address / from number
- redirect base URL where relevant
- optional subject/body overrides if needed later

## How This Fits Into SeamlessAuth

The intended consumer is a SeamlessAuth initializer such as `createSeamlessAuthServer(...)`.

That integration should be able to:

1. accept official transports per channel
2. optionally accept custom per-flow handlers
3. optionally accept message overrides for the built-in auth templates
4. call the auth messaging service from the existing auth flows

`seamless-auth-api` is still a useful reference for the message responsibilities and wording, but the long-term product goal is for the SeamlessAuth integration layer to own the auth-message flow behavior while adopters mainly supply delivery capabilities.

## Future Language Ports

This repo only needs TypeScript in `0.1.0`, but the architecture should make later ports easier.

The easiest way to preserve that path is:

- keep message input shapes small and explicit
- keep provider contracts deterministic
- avoid framework coupling
- document behavior before over-optimizing implementation details

If Rust or Python packages are added later, they should follow the same domain contract, not necessarily the same internal file layout.
