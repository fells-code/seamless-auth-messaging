# Roadmap

## Release Goal

Ship and stabilize a realistic `0.1.0` for TypeScript users integrating SeamlessAuth with auth-related messaging.

## Delivered In `0.1.0`

- monorepo package layout
- published core package
- published AWS transport package
- published Twilio transport package
- explicit auth-domain types and service methods
- default template rendering
- optional per-flow handlers
- optional per-flow overrides
- AWS SES email support
- AWS SNS SMS support
- Twilio SMS support
- mixed-provider composition support
- workspace lint, format, typecheck, test, and release verification scripts
- GitHub Actions CI and publish automation

## Near-Term Stabilization

- improve the default SeamlessAuth-owned email templates
- add fuller examples that mirror real adopter apps
- tighten docs around local development and publish workflows
- expand automated coverage for override and disabled-transport scenarios
- keep the public contracts small and steady while the wider SeamlessAuth integrations settle

## Next Provider/Feature Work

- SendGrid or another email provider
- richer template customization hooks
- more framework-specific integration examples
- better release ergonomics for coordinated version bumps

## `0.1.0` Definition Of Done

- TypeScript packages publishable to npm
- official support for AWS email/SMS and Twilio SMS
- support for the three current SeamlessAuth message flows
- documented integration path for SeamlessAuth server-side adapters
- tests for core logic and provider adapters
- README and package docs that make setup understandable without reading source

## Deliberate Post-`0.1.0` Work

- SendGrid or other email providers
- custom template override APIs
- retry helpers and queue integrations
- metrics hooks or event emitters
- Python SDK
- Rust SDK

The point of `0.1.0` is to prove the package boundary and developer experience first, then expand carefully from a stable auth-focused core.
