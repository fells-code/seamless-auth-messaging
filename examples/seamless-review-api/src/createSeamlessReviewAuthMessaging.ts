import { createAuthMessagingService, type AuthMessagingService } from "@seamless-auth/messaging";
import { createAwsEmailTransport, type AwsSesClientLike } from "@seamless-auth/messaging-aws";
import { createTwilioSmsTransport, type TwilioClientLike } from "@seamless-auth/messaging-twilio";

export interface SeamlessReviewAuthMessagingConfig {
  appName: string;
  awsRegion: string;
  authEmailFrom: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioFromNumber: string;
}

export interface SeamlessReviewAuthMessagingDeps {
  sesClient?: AwsSesClientLike;
  twilioClient?: TwilioClientLike;
}

export function createSeamlessReviewAuthMessaging(
  config: SeamlessReviewAuthMessagingConfig,
  deps: SeamlessReviewAuthMessagingDeps = {},
): AuthMessagingService {
  return createAuthMessagingService({
    appName: config.appName,
    email: createAwsEmailTransport({
      region: config.awsRegion,
      fromEmail: config.authEmailFrom,
      sesClient: deps.sesClient,
    }),
    sms: createTwilioSmsTransport({
      accountSid: config.twilioAccountSid,
      authToken: config.twilioAuthToken,
      fromNumber: config.twilioFromNumber,
      client: deps.twilioClient,
    }),
  });
}
