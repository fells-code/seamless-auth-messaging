# @seamless-auth/messaging

Provider-agnostic auth messaging core for SeamlessAuth.

## Start here

New to Seamless Auth? The [self-hosted quickstart](https://docs.seamlessauth.com/start/quickstart/) runs the full stack locally with Docker. If Seamless hosts your auth instance, follow the [managed quickstart](https://docs.seamlessauth.com/start/managed-quickstart/) instead. The [compatibility matrix](https://docs.seamlessauth.com/build/ecosystem/#compatibility-matrix) lists which package versions work together.

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
