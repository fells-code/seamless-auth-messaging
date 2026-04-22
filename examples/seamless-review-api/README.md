# Seamless Review API Example

This example shows how an adopter API like `seamless-review-api` can own auth messaging configuration using:

- AWS SES for email
- Twilio for SMS

It is modeled on the current `seamless-review-api` structure, especially:

- `src/app.ts`
- `src/lib/config.ts`
- `src/lib/email/sendEmail.ts`

## What This Example Covers

- an adopter-owned auth messaging factory
- a small audit wrapper for auth messages
- a local smoke script using fake SES and Twilio clients
- an environment shape that matches the real use case you care about

## Where This Fits

This example is intentionally focused on the adopter-side messaging module. In the wider SeamlessAuth stack, this pattern is meant to sit behind a server-side integration such as `@seamless-auth/express`.

## Suggested File Placement In `seamless-review-api`

If you were applying this example to the actual review API, a natural home would be:

```text
src/lib/authMessaging/createSeamlessReviewAuthMessaging.ts
src/lib/authMessaging/withAuthMessageAudit.ts
src/lib/authMessaging/localSmoke.ts
```

## Environment

See [.env.example](./.env.example).

The minimum auth messaging setup for the SES + Twilio path is:

- `APP_NAME`
- `AWS_REGION`
- `AUTH_EMAIL_FROM`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

## Example Flow

The core adopter setup is:

```ts
import { createSeamlessReviewAuthMessaging } from "./src/createSeamlessReviewAuthMessaging.js";
import { withAuthMessageAudit } from "./src/withAuthMessageAudit.js";

const authMessaging = withAuthMessageAudit(
  createSeamlessReviewAuthMessaging({
    appName: process.env.APP_NAME!,
    awsRegion: process.env.AWS_REGION!,
    authEmailFrom: process.env.AUTH_EMAIL_FROM!,
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID!,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN!,
    twilioFromNumber: process.env.TWILIO_FROM_NUMBER!,
  }),
  async (entry) => {
    console.log("auth message audit", entry);
  },
);
```

Under the hood, that example uses:

- `createAuthMessagingService(...)` from `@seamless-auth/messaging`
- `createAwsEmailTransport(...)` from `@seamless-auth/messaging-aws`
- `createTwilioSmsTransport(...)` from `@seamless-auth/messaging-twilio`

From there the adopter can call:

```ts
await authMessaging.sendOtpEmail({
  to: "user@example.com",
  token: "ABCDEF",
});

await authMessaging.sendOtpSms({
  to: "+15551234567",
  token: 123456,
});
```

## Local Smoke Testing

The included [`localSmoke.ts`](./src/localSmoke.ts) demonstrates the exact SES + Twilio shape using fake clients.

That gives you a safe first step before pointing the example at real AWS and Twilio credentials.

## Why This Matters

This example is the intended product story:

- SeamlessAuth stays focused on auth
- the adopter API chooses providers
- auth-related delivery is explicit and testable
- SES email and Twilio SMS work together without forcing one vendor for every channel
