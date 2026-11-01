# @seamless-auth/messaging-aws

## 0.3.0

### Minor Changes

- 12fff84: Email messages can carry custom headers, such as `List-Unsubscribe` and `List-Unsubscribe-Post` for one-click unsubscribe. Header names and values are validated so a caller cannot inject further headers, and the headers the transport sets from the message itself (From, To, Subject) are refused.

  The AWS email transport now sends through SES v2 (`@aws-sdk/client-sesv2`), since the v1 SendEmail call cannot carry custom headers. The IAM action is still `ses:SendEmail`. A `sesClient` passed in config must now be an SES v2 client, or anything that accepts the v2 `SendEmailCommand`.

### Patch Changes

- Updated dependencies [12fff84]
- Updated dependencies [68daa76]
  - @seamless-auth/messaging@0.3.0
