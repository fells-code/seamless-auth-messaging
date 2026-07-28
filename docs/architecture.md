# Architecture

## Goal

Provide a public auth-messaging package system for SeamlessAuth that sits behind a SeamlessAuth server adapter and handles auth-specific delivery while still letting adopters choose transports or custom handlers.

## Product Boundary

SeamlessAuth currently needs messaging support for three auth workflows:

- OTP email
- OTP SMS
- magic link email

That is the right boundary for this repo. It should stay focused on auth delivery, not expand into a generic notification platform.

## Design Principles

- Keep auth concerns and messaging concerns separate
- Export explicit, stable contracts
- Support per-channel provider composition
- Support both official transports and custom per-flow handlers
- Support optional message overrides on top of default templates
- Keep provider packages thin
- Make future providers easy to add without changing core call sites
- Leave room for future non-TypeScript ports by keeping the domain model clean

## Repository Shape

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

The core package contains:

- message contracts
- delivery result and error types
- auth-focused message builders
- channel abstractions for `email` and `sms`
- transport interfaces
- optional custom handler interfaces
- auth messaging service composition helpers

It does not:

- talk to AWS directly
- talk to Twilio directly
- depend on framework code
- read environment variables by default

### `@seamless-auth/messaging-aws`

The AWS package provides:

- SES-backed email delivery
- SNS-backed SMS delivery
- AWS-specific config validation
- provider adapters implementing the shared core contracts

### `@seamless-auth/messaging-twilio`

The Twilio package provides:

- Twilio-backed SMS delivery
- Twilio-specific config validation
- a provider adapter implementing the shared SMS contract

For `0.1.0`, it intentionally only covers SMS.

## Capability Model

The core models capabilities by channel, not by vendor name.

Current shape:

- email transport
- sms transport
- optional custom auth-message handlers
- composed auth messaging service

That lets SeamlessAuth integrations compose providers cleanly:

- AWS email + AWS SMS
- AWS email + Twilio SMS
- custom email handler + Twilio SMS

Later additions should slot in naturally:

- SendGrid email
- Mailgun email
- Resend email
- other SMS vendors

## Message Domain

For `0.1.0`, the package exposes auth-domain operations instead of a loose `send(anything)` API.

Public operations:

- `sendOtpEmail`
- `sendOtpSms`
- `sendMagicLinkEmail`

This keeps the API aligned with current SeamlessAuth responsibilities.

## Template Ownership

This package family owns the default templates for auth flows.

Why:

- SeamlessAuth needs working auth messaging out of the box
- provider packages should not own auth business logic
- customization is easier to reason about when it starts from stable defaults

The current customization model is intentionally lightweight:

- app name
- optional default sender identity
- optional per-flow message overrides
- optional per-flow custom handlers

## How This Fits Into SeamlessAuth

The intended consumer is a SeamlessAuth initializer such as `createSeamlessAuthServer(...)` or a server-side adapter sitting beside it.

That integration can:

1. accept official transports per channel
2. optionally accept custom per-flow handlers
3. optionally accept message overrides for built-in auth templates
4. call the auth messaging service from auth flows without re-implementing message rendering

This keeps the roles clean:

- SeamlessAuth owns auth-flow behavior and default auth content
- adopters own provider choice and credentials
- provider packages only own transport delivery

## Future Language Ports

This repo only ships TypeScript in `0.1.0`, but the contract should still make later ports easier.

Good future-proofing here means:

- keep message input shapes small and explicit
- keep provider contracts deterministic
- avoid framework coupling
- keep defaults and error models documented

If Rust or Python packages are added later, they should follow the same domain contract, not necessarily the same internal file layout.
