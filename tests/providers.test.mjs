import test from "node:test";
import assert from "node:assert/strict";

import { createAuthMessagingService, MessagingProviderError } from "../packages/core/dist/index.js";
import { createAwsEmailTransport, createAwsSmsTransport } from "../packages/aws/dist/index.js";
import { createTwilioSmsTransport } from "../packages/twilio/dist/index.js";

test("AWS SES provider sends normalized email payloads", async () => {
  let capturedCommand;

  const provider = createAwsEmailTransport({
    region: "us-east-1",
    fromEmail: "noreply@example.com",
    sesClient: {
      async send(command) {
        capturedCommand = command;
        return { MessageId: "ses-123" };
      },
    },
  });

  const result = await provider.send({
    to: "user@example.com",
    subject: "Verify your email",
    text: "Code: ABCDEF",
    html: "<p>Code: <strong>ABCDEF</strong></p>",
  });

  assert.equal(result.accepted, true);
  assert.equal(result.provider, "aws-ses");
  assert.equal(result.channel, "email");
  assert.equal(result.messageId, "ses-123");
  assert.equal(capturedCommand.input.Source, "noreply@example.com");
  assert.deepEqual(capturedCommand.input.Destination.ToAddresses, ["user@example.com"]);
  assert.equal(capturedCommand.input.Message.Subject.Data, "Verify your email");
  assert.equal(capturedCommand.input.Message.Body.Text.Data, "Code: ABCDEF");
});

test("AWS SNS provider sends SMS with sender ID when configured", async () => {
  let capturedCommand;

  const provider = createAwsSmsTransport({
    region: "us-east-1",
    senderId: "SEAMLESS",
    snsClient: {
      async send(command) {
        capturedCommand = command;
        return { MessageId: "sns-123" };
      },
    },
  });

  const result = await provider.send({
    to: "+15551234567",
    body: "Your code is 123456",
  });

  assert.equal(result.accepted, true);
  assert.equal(result.provider, "aws-sns");
  assert.equal(result.channel, "sms");
  assert.equal(result.messageId, "sns-123");
  assert.equal(capturedCommand.input.PhoneNumber, "+15551234567");
  assert.equal(capturedCommand.input.Message, "Your code is 123456");
  assert.equal(
    capturedCommand.input.MessageAttributes["AWS.SNS.SMS.SenderID"].StringValue,
    "SEAMLESS",
  );
});

test("Twilio provider sends SMS and returns normalized delivery results", async () => {
  let capturedInput;

  const provider = createTwilioSmsTransport({
    accountSid: "AC123",
    authToken: "secret",
    fromNumber: "+15557654321",
    client: {
      messages: {
        async create(input) {
          capturedInput = input;
          return { sid: "SM123", status: "queued" };
        },
      },
    },
  });

  const result = await provider.send({
    to: "+15551234567",
    body: "Your code is 654321",
  });

  assert.equal(result.accepted, true);
  assert.equal(result.provider, "twilio");
  assert.equal(result.channel, "sms");
  assert.equal(result.messageId, "SM123");
  assert.deepEqual(capturedInput, {
    to: "+15551234567",
    from: "+15557654321",
    body: "Your code is 654321",
  });
});

test("Mixed provider composition works for SES email plus Twilio SMS", async () => {
  const deliveries = [];

  const messaging = createAuthMessagingService({
    appName: "Seamless Demo",
    email: createAwsEmailTransport({
      region: "us-east-1",
      fromEmail: "noreply@example.com",
      sesClient: {
        async send(command) {
          deliveries.push({
            type: "email",
            input: command.input,
          });
          return { MessageId: "ses-mixed-1" };
        },
      },
    }),
    sms: createTwilioSmsTransport({
      accountSid: "AC123",
      authToken: "secret",
      fromNumber: "+15557654321",
      client: {
        messages: {
          async create(input) {
            deliveries.push({
              type: "sms",
              input,
            });
            return { sid: "SM456", status: "queued" };
          },
        },
      },
    }),
  });

  const emailResult = await messaging.sendMagicLinkEmail({
    to: "user@example.com",
    magicLinkUrl: "https://app.example.com/verify?token=abc",
  });
  const smsResult = await messaging.sendOtpSms({
    to: "+15551234567",
    token: 123456,
  });

  assert.equal(emailResult.provider, "aws-ses");
  assert.equal(smsResult.provider, "twilio");
  assert.equal(deliveries[0].type, "email");
  assert.equal(deliveries[1].type, "sms");
  assert.match(deliveries[0].input.Message.Subject.Data, /sign-in link/i);
  assert.match(deliveries[1].input.body, /123456/);
});

test("Twilio provider wraps delivery failures consistently", async () => {
  const provider = createTwilioSmsTransport({
    accountSid: "AC123",
    authToken: "secret",
    fromNumber: "+15557654321",
    client: {
      messages: {
        async create() {
          throw new Error("Twilio API rejected the request");
        },
      },
    },
  });

  await assert.rejects(
    provider.send({
      to: "+15551234567",
      body: "Your code is 654321",
    }),
    (error) => {
      assert.equal(error instanceof MessagingProviderError, true);
      assert.equal(error.provider, "twilio");
      assert.equal(error.channel, "sms");
      assert.match(error.message, /Twilio API rejected the request/);
      return true;
    },
  );
});

test("Custom handlers can override transport usage for individual flows", async () => {
  const delivered = [];

  const messaging = createAuthMessagingService({
    appName: "Seamless Demo",
    email: createAwsEmailTransport({
      region: "us-east-1",
      fromEmail: "noreply@example.com",
      sesClient: {
        async send(command) {
          delivered.push({ kind: "email", input: command.input });
          return { MessageId: "ses-handler-test" };
        },
      },
    }),
    handlers: {
      async sendOtpSms(input) {
        delivered.push({ kind: "custom-sms", input });
        return {
          accepted: true,
          provider: "custom-sms-handler",
          channel: "sms",
          messageId: "custom-1",
        };
      },
    },
  });

  const smsResult = await messaging.sendOtpSms({
    to: "+15551234567",
    token: 123456,
  });
  const emailResult = await messaging.sendOtpEmail({
    to: "user@example.com",
    token: "ABCDEF",
  });

  assert.equal(smsResult.provider, "custom-sms-handler");
  assert.equal(emailResult.provider, "aws-ses");
  assert.equal(delivered[0].kind, "custom-sms");
  assert.equal(delivered[1].kind, "email");
});

test("Message overrides can customize built-in templates without replacing transports", async () => {
  let capturedInput;

  const messaging = createAuthMessagingService({
    appName: "Seamless Demo",
    sms: createTwilioSmsTransport({
      accountSid: "AC123",
      authToken: "secret",
      fromNumber: "+15557654321",
      client: {
        messages: {
          async create(input) {
            capturedInput = input;
            return { sid: "SM999", status: "queued" };
          },
        },
      },
    }),
    overrides: {
      otpSms(input, defaults, context) {
        return {
          ...defaults,
          body: `[${context.appName}] code=${input.token}`,
        };
      },
    },
  });

  await messaging.sendOtpSms({
    to: "+15551234567",
    token: 444111,
  });

  assert.equal(capturedInput.body, "[Seamless Demo] code=444111");
});
