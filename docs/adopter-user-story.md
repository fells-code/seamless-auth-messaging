# Adopter User Story

## Target Adopter

The clearest first adopter story is an API like `seamless-review-api`.

That kind of app already:

- mounts `@seamless-auth/express` in its API server
- owns the application-level SeamlessAuth connection
- owns provider credentials and config parsing
- may already send operational or transactional email elsewhere in the app

That makes it the right proving ground for this package family.

## What The Adopter Wants

An adopter team should be able to say:

1. We use SeamlessAuth for passwordless auth.
2. We want auth-related delivery configured in our own API.
3. We want SES for email and Twilio for SMS.
4. We want to pass those delivery capabilities into SeamlessAuth instead of rebuilding auth flows ourselves.

That is the core user story this repo should serve.

## Desired Adopter Flow

The intended flow is:

1. The adopter parses auth messaging config from its environment.
2. The adopter creates official transports or custom handlers:
   - SES for email
   - Twilio for SMS
3. The adopter passes those capabilities into a SeamlessAuth initializer or adjacent server adapter.
4. SeamlessAuth-owned auth flows call the messaging service for:
   - OTP email
   - OTP SMS
   - magic link email
   - bootstrap invite email
5. SeamlessAuth delivers a good default experience without forcing the adopter to own message rendering.

## Why This Model Works

- Adopters keep control over credentials and providers
- SeamlessAuth keeps control over auth semantics and default templates
- Provider packages stay small and predictable
- Mixed-provider setups like AWS email plus Twilio SMS work naturally

## Expected Integrator Responsibilities

Integrators should usually own:

- environment/config loading
- provider client construction
- sender identity values like `fromEmail` or `fromNumber`
- any app-specific audit logging around auth delivery

SeamlessAuth should usually own:

- default auth templates
- auth-domain message methods
- per-flow override hooks
- the point where auth routes decide which message to send

## Why `seamless-review-api` Is Still The Right Example

It mirrors the real shape this repo is designed for:

- app-owned auth server setup
- app-owned config
- adopter-selected messaging vendors
- a real local development loop
- a realistic production deployment path

## Local Testing Story

The first local testing loop should stay simple.

A practical ladder is:

1. Build a real adopter-side messaging factory.
2. Smoke test those transports and handlers locally with fake clients.
3. Verify real SES and Twilio credentials in a controlled dev environment.
4. Add dev-only logging or disabled transports where helpful for local DX.
5. Wire the service into a SeamlessAuth server integration.

That keeps the package easy to adopt without forcing a large auth-server rewrite first.
