---
"@seamless-auth/messaging": patch
---

Depend on `@seamless-auth/types` ^0.34.0, the version the auth API and server adapters use, so an install no longer carries two copies. Types 0.34.0 adds the optional `headers` field to `EmailMessage`, so `EmailMessage` is now the shared type itself rather than a local extension of it. Its shape is unchanged.
