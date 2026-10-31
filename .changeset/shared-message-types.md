---
"@seamless-auth/messaging": minor
---

The message data shapes (`MessagingChannel`, `DeliveryResult`, `EmailMessage`, `SmsMessage`, `SendOtpEmailInput`, `SendOtpSmsInput` and `SendMagicLinkEmailInput`) now come from `@seamless-auth/types`, the same definitions the auth API and server adapters use. `AuthDeliveryInstruction`, the delivery payload the API returns when the adopter owns delivery, is now exported too. The shapes are unchanged, and `@seamless-auth/types` is only referenced by the type declarations, so nothing new loads at runtime.
