import { createSeamlessReviewAuthMessaging } from "./createSeamlessReviewAuthMessaging.js";
import { withAuthMessageAudit } from "./withAuthMessageAudit.js";

async function main() {
  const authMessaging = withAuthMessageAudit(
    createSeamlessReviewAuthMessaging(
      {
        appName: "Seamless Review Board",
        awsRegion: "us-east-1",
        authEmailFrom: "noreply@example.com",
        twilioAccountSid: "AC123",
        twilioAuthToken: "secret",
        twilioFromNumber: "+15557654321",
      },
      {
        sesClient: {
          async send(command) {
            console.log("SES payload", command.input);
            return { MessageId: "ses-local-1" };
          },
        },
        twilioClient: {
          messages: {
            async create(input) {
              console.log("Twilio payload", input);
              return { sid: "SM-local-1", status: "queued" };
            },
          },
        },
      },
    ),
    async (entry) => {
      console.log("Audit entry", entry);
    },
  );

  await authMessaging.sendOtpEmail({
    to: "reviewer@example.com",
    token: "ABCDEF",
  });

  await authMessaging.sendOtpSms({
    to: "+15551234567",
    token: 123456,
  });

  await authMessaging.sendMagicLinkEmail({
    to: "reviewer@example.com",
    magicLinkUrl: "https://review.example.com/verify-magic-link?token=xyz",
  });
}

void main();
