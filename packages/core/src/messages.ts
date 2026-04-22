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

export interface SendBootstrapInviteEmailInput {
  to: string;
  inviteUrl: string;
  from?: string;
  subject?: string;
}
