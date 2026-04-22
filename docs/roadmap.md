# Roadmap

## Release Goal

Ship a realistic `0.1.0` for TypeScript users integrating SeamlessAuth with auth-related messaging.

## Phase 1: Package Skeleton

- create the monorepo package layout
- add package manifests and TypeScript configs
- define core public types
- define provider interfaces
- choose package names and export boundaries

## Phase 2: Core Messaging API

- implement the provider-agnostic core package
- add auth-domain input types
- add message rendering helpers for default templates
- add normalized delivery result and error types
- add transport composition for `email` and `sms`
- add optional custom handlers and message overrides

## Phase 3: AWS Adapter

- implement SES email delivery
- implement SNS SMS delivery
- validate config up front
- add tests for each auth flow

## Phase 4: Twilio Adapter

- implement Twilio SMS delivery
- validate config up front
- add tests for SMS OTP delivery
- document mixed-provider setup with AWS email + Twilio SMS

## Phase 5: Integration Example

- add an example or reference integration for `seamless-auth-api`
- document how to replace the local messaging service implementation
- document provider selection and environment configuration

## `0.1.0` Definition Of Done

- TypeScript packages publishable to npm
- official support for AWS email/SMS and Twilio SMS
- support for the four current SeamlessAuth message flows
- documented integration path for `seamless-auth-api`
- tests for core logic and provider adapters
- README and package docs that make setup understandable without reading source

## Deliberate Post-`0.1.0` Work

- SendGrid or other email providers
- custom template override APIs
- retry helpers and queue integrations
- metrics hooks or event emitters
- Python SDK
- Rust SDK

The point of `0.1.0` is to prove the package boundary and developer experience first.
