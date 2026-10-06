export interface SendOtpEmailInput {
  to: string;
  token: string;
  from?: string;
  subject?: string;
}

export interface SendOtpSmsInput {
  to: string;
  token: string | number;
  from?: string;
}

export interface SendMagicLinkEmailInput {
  to: string;
  magicLinkUrl: string;
  token?: string;
  from?: string;
  subject?: string;
}

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
