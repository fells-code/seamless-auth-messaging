# @seamless-auth/messaging-aws

AWS transport adapters for SeamlessAuth messaging.

## Start here

New to Seamless Auth? The [self-hosted quickstart](https://docs.seamlessauth.com/start/quickstart/) runs the full stack locally with Docker. If Seamless hosts your auth instance, follow the [managed quickstart](https://docs.seamlessauth.com/start/managed-quickstart/) instead. The [compatibility matrix](https://docs.seamlessauth.com/build/ecosystem/#compatibility-matrix) lists which package versions work together.

Current scope:

- SES for email delivery
- SNS for SMS delivery

Public factories:

- `createAwsEmailTransport(...)`
- `createAwsSmsTransport(...)`

Backwards-compatible provider aliases are also exported.
