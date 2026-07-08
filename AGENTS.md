# AGENTS.md

This file is for coding agents working in the `seamless-messaging` repository.

The repo is currently in an early, docs-first stage. Use this file to keep implementation work aligned with the product boundary that emerged from reviewing:

- `seamless-auth-api-internal`
- `seamless-auth-api`
- `seamless-auth-server`

## Working Standards (fells-code baseline)

These rules apply to every repository in the fells-code org. Repo-specific
guidance may extend them but must not contradict them.

### Attribution
- Commit and open PRs solely under the repository owner's identity. Never
  commit under an agent or assistant identity.
- Never attribute work to an AI assistant: no `Co-Authored-By: Claude` (or any
  assistant) trailers, no "Generated with" / "Created with Claude" notes, and no
  assistant branding or emoji anywhere in commit messages, PR or issue titles
  and descriptions, changesets, code comments, or docs.

### Comments
- Comment only when the code genuinely needs explaining: a non-obvious reason, a
  gotcha, or an invariant. Never narrate what the code plainly does.

### TODOs
- Every `TODO`/`FIXME` must reference a ticket, e.g. `// TODO(#123): ...`.
  Do not leave a bare TODO. If no ticket exists, create one first.

### Commits & branches
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `ci:`, `test:`).
- Descriptive branch names (`feat/...`, `fix/...`); never a `claude/` or other
  tool-generated prefix.

### Public-facing text
- No em dashes in commit messages, code comments, PR or issue text, changesets,
  or docs. Use a comma, parentheses, or a separate sentence.

### Before declaring work done
- Run the repo's checks (typecheck, lint, format, tests) and report real output.
  Never claim a change works without running them.
- Match the surrounding code's style, naming, and comment density.

## Purpose

This repository is the public messaging package system for SeamlessAuth.

Its job is to provide a clean integration layer for auth-related email and SMS delivery without expanding into a generic notification platform.

## Current Product Boundary

The auth server currently needs messaging support for exactly these flows:

- email OTP
- SMS OTP
- magic link email
- bootstrap invite email

Treat those as the primary domain API for `0.1.0`.

Do not start by designing a giant universal notifications framework.

## Repository Direction

The best fit for this repo is a small package family, mirroring the way SeamlessAuth already separates core responsibilities from adapters.

Preferred target structure:

```text
packages/
  core/
  aws/
  twilio/
docs/
examples/
```

## Architecture Rules

- keep auth logic out of provider packages
- keep provider SDKs out of the core package
- keep environment loading out of the core package
- keep public contracts explicit and typed
- support email and SMS as separate channels
- support composing transports by channel
- support optional custom per-flow handlers
- support optional auth-message overrides without requiring them

This last point matters because Twilio does not cover the email flows needed for launch.

## `0.1.0` Scope

Keep the first release intentionally narrow.

### In scope

- TypeScript packages only
- a provider-agnostic core package
- AWS email and SMS support
- Twilio SMS support
- the four auth flows already used by SeamlessAuth
- docs and examples that show how an adopter API should consume the package

### Out of scope

- non-TypeScript SDKs
- queueing systems
- retry orchestration platforms
- analytics dashboards
- a generic transactional messaging system for arbitrary product emails
- five different provider families at launch

## Integration Goal

The intended consumer is a SeamlessAuth initializer such as `createSeamlessAuthServer(...)`.

Adopters should ideally be able to pass:

- official transports like SES, SNS, and Twilio
- or custom handlers if they already have delivery infrastructure
- and optional message overrides when needed

Bias toward APIs that would let the auth server keep call sites similar to:

- `sendOtpEmail(...)`
- `sendOtpSms(...)`
- `sendMagicLinkEmail(...)`
- `sendBootstrapInviteEmail(...)`

## Style Guidance

Match the strongest package patterns already visible in the SeamlessAuth ecosystem:

- small public packages
- explicit contracts
- focused responsibilities
- readable README-driven onboarding
- framework-agnostic core modules
- thin adapters over stable shared logic

## Implementation Priorities

When code work begins, prefer this order:

1. define the core public types
2. define the channel transport interfaces
3. define the auth-domain operations
4. implement default message rendering
5. add optional handler and override support
6. add AWS adapter
7. add Twilio SMS adapter
8. add integration examples and tests

## Template Guidance

For `0.1.0`, default templates should live in this repo.

Customization should stay modest unless the user explicitly asks for more:

- app name
- sender identity
- link targets
- subject/body overrides only when needed

Avoid over-engineering a full templating DSL in the first release.

## Future-Proofing

Design for future providers such as SendGrid without coding them yet.

Design for future Python and Rust ports without trying to ship a language-neutral standard before the TypeScript API is proven.

Good future-proofing:

- small message input shapes
- channel-based transport contracts
- normalized error/result models

Bad future-proofing:

- speculative abstractions that make the TypeScript package harder to use today
- provider enums that assume one vendor owns every channel

## Safe Change Workflow

When making substantive changes:

1. re-check the docs in `README.md` and `docs/`
2. preserve the `0.1.0` scope unless explicitly asked to expand it
3. keep core and provider responsibilities separate
4. prefer adding examples and tests alongside new code
5. document any change that affects the public package contract

## North Star

This package system should feel like a natural extension of SeamlessAuth:

- easy to understand
- explicit to configure
- small enough to trust
- flexible enough to choose providers or custom handlers without rewriting auth flows
