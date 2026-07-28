# @seamless-auth/messaging

Provider-agnostic auth messaging core for SeamlessAuth.

This package owns the shared messaging contracts and the auth-focused service surface for:

- OTP email
- OTP SMS
- magic link email

It exposes:

- email and SMS transport interfaces
- auth-domain message operations
- optional per-flow custom handlers
- optional per-flow message overrides

Provider adapters live in separate packages.
