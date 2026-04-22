# Seamless Messaging

`seamless-messaging` is the public package system for adding email and SMS delivery to SeamlessAuth.

The goal is to let SeamlessAuth own auth-message rendering and flow behavior while still giving adopters an easy way to plug in their own delivery clients and providers.

For `0.1.0`, this repository is intentionally scoped to:

- TypeScript only
- official provider support for AWS and Twilio
- the messaging flows already present in SeamlessAuth
- a package layout that can grow into more providers and more languages later

## Why This Exists

The open-source `seamless-auth-api` already has clear messaging responsibilities, but its current public implementation is a stub.

Today, the auth server needs to send:

- email OTP messages
- SMS OTP messages
- magic link emails
- bootstrap invite emails

This repository exists to make those responsibilities portable, explicit, and reusable.

## Product Goal

SeamlessAuth should remain seamless for adopters:

- auth packages own authentication
- messaging packages own delivery
- provider setup should feel obvious and composable
- the API should not force adopters into one cloud vendor

## `0.1.0` Scope

The first release should stay narrow and achievable.

### In scope

- a TypeScript-first package system
- a provider-agnostic core package
- an AWS adapter for SES and SNS
- a Twilio adapter for SMS
- message types/templates for the four current SeamlessAuth auth flows
- docs and examples for wiring the package into a SeamlessAuth initializer or adopter API integration layer

### Not in scope

- non-TypeScript SDKs
- a generic marketing-email platform
- dashboard features or hosted delivery management
- dozens of providers at launch
- a fully generalized cross-language spec before the TypeScript package is proven

## Important Constraint

Twilio can cover SMS, but it does not cover the email flows needed by SeamlessAuth by itself.

That means `0.1.0` should support provider composition by channel:

- AWS for email and SMS
- AWS for email plus Twilio for SMS

Future providers such as SendGrid can fill the email side later without forcing a redesign.

## Proposed Package Direction

The repo should grow into a small package family, similar to how SeamlessAuth already separates core logic from framework adapters.

Planned package shape:

```text
packages/
  core/      provider-agnostic contracts, templates, types, errors
  aws/       AWS SES + SNS adapter
  twilio/    Twilio SMS adapter
```

This keeps the public API stable while letting provider packages evolve independently.

## Proposed Integration Model

The intended integration target is a SeamlessAuth initializer such as `createSeamlessAuthServer(...)`.

Adopters should be able to pass:

- official email and SMS transports
- or custom auth-message handlers
- plus optional message overrides when they need them

SeamlessAuth should then own the default auth-message behavior on top of those transports.

At a high level:

```ts
const messaging = createAuthMessagingService({
  appName: "My App",
  email: createAwsEmailTransport(...),
  sms: createTwilioSmsTransport(...),
  overrides: {
    otpSms: ({ appName, token }, defaults) => ({
      ...defaults,
      body: `Your ${appName} code is ${token}`,
    }),
  },
});

await messaging.sendOtpEmail({ ... });
await messaging.sendOtpSms({ ... });
await messaging.sendMagicLinkEmail({ ... });
await messaging.sendBootstrapInviteEmail({ ... });
```

The package should expose auth-focused operations and transport interfaces, not just raw provider wrappers.

## Documentation

- [Architecture](./docs/architecture.md)
- [Adopter User Story](./docs/adopter-user-story.md)
- [Provider Model](./docs/provider-model.md)
- [Roadmap](./docs/roadmap.md)
- [Agent Guidance](./AGENTS.md)

## Examples

- [Seamless Review API adopter example](./examples/seamless-review-api/README.md)

## Relationship To SeamlessAuth Repositories

This repo is being designed against:

- the internal historical implementation in `seamless-auth-api-internal`
- the current public `seamless-auth-api`
- the packaging style established in `seamless-auth-server`

That review suggests the right approach is:

- small public packages
- explicit contracts
- composable adapters
- narrow responsibilities per package

## Current Status

This repository now contains the first transport-based implementation for:

- AWS SES email
- AWS SNS SMS
- Twilio SMS

The next step is to let the SeamlessAuth server packages consume this transport model directly.

## Development

Use the workspace scripts at the repo root while iterating on the packages:

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
```

If you want to rewrite formatting or fix lint issues automatically:

```bash
npm run format
npm run lint:fix
```

## Publishing

The first release can be published manually from the workspace after verification:

```bash
npm run release:verify
npm run publish:core
npm run publish:aws
npm run publish:twilio
```

After that, the repo includes a GitHub Actions workflow that publishes all three packages whenever a GitHub release is published.

Required GitHub repository secret:

- `NPM_TOKEN`

The publish order is:

1. `@seamless-auth/messaging`
2. `@seamless-auth/messaging-aws`
3. `@seamless-auth/messaging-twilio`
