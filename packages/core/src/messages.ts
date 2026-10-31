export type {
  AuthDeliveryInstruction,
  SendMagicLinkEmailInput,
  SendOtpEmailInput,
  SendOtpSmsInput,
} from "@seamless-auth/types";

/**
 * Asks a user to sign in and add a passkey, for example after their account was
 * imported from another identity system. The link is to the application's normal
 * sign-in page; it carries no credential, so it signs nobody in on its own.
 */
export interface SendEnrollmentInviteEmailInput {
  to: string;
  signInUrl: string;
  from?: string;
  subject?: string;
}
