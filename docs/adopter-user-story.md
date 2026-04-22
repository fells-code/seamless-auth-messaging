# Adopter User Story

## Target Adopter

The most realistic near-term adopter story is `seamless-review-api`.

That app already:

- mounts `@seamless-auth/express` in its API server
- owns the application-level SeamlessAuth connection
- already sends transactional email through AWS SES
- has app-level environment/config parsing

That makes it a strong proving ground for this package family.

## What The Adopter Wants

An adopter team should be able to say:

1. We use SeamlessAuth for passwordless auth.
2. We want auth-related messaging to be configured in our own API.
3. We want SES for email and Twilio for SMS.
4. We want to pass those delivery capabilities into SeamlessAuth instead of rebuilding auth messaging ourselves.

That is the core user story this repo should serve.

## Current Reality In `seamless-review-api`

Today the review API already has two useful integration anchors:

- `src/app.ts` owns the `createSeamlessAuthServer(...)` setup
- `src/lib/email/sendEmail.ts` owns existing SES email delivery patterns

Those files suggest the right adopter-side shape:

- auth connection setup stays in the adopter API
- messaging provider selection stays in the adopter API
- this package supplies auth-focused messaging primitives

## Desired Adopter Flow

The intended flow is:

1. The adopter parses auth messaging config from its environment.
2. The adopter creates official transports or passes custom handlers:
   - SES for email
   - Twilio for SMS
3. The adopter passes those capabilities into a SeamlessAuth initializer.
4. SeamlessAuth-owned auth flows call the messaging service for:
   - OTP email
   - OTP SMS
   - magic link email
   - bootstrap invite email

## Honest Current Gap

Today, `@seamless-auth/express` does not yet accept a messaging service or transport config as part of `createSeamlessAuthServer(...)`.

So the package work in this repository should currently optimize for:

- a strong adopter-owned messaging client
- clean provider configuration
- realistic examples
- local smoke testing

The final end-to-end hook into the SeamlessAuth connection layer is a separate integration step.

## Why `seamless-review-api` Is The Right First Example

It is already close to the desired production shape:

- app-owned auth connection
- app-owned config
- existing AWS SES operational context
- real Express API
- real local development flow

Using it as the reference keeps the examples honest and keeps this package focused on what adopters actually need to do.

## Local Testing Story

For the first local testing loop, the adopter should not need a full auth-server rewrite.

A practical testing ladder is:

1. Build a real adopter-side messaging factory.
2. Smoke test those transports and handlers locally with fake clients.
3. Verify real SES and Twilio credentials in a controlled dev environment.
4. Only after that, wire the messaging service into the SeamlessAuth initializer.

This keeps the package verifiable now, while leaving room for the final SeamlessAuth integration point to evolve cleanly.
