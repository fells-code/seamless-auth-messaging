import type {
  MessagingClient,
  SendBootstrapInviteEmailInput,
  SendMagicLinkEmailInput,
  SendOtpEmailInput,
  SendOtpSmsInput,
} from "@seamless-auth/messaging";

export type AuthMessageAuditEntry =
  | {
      operation: "sendOtpEmail";
      status: "sent";
      to: string;
      provider: string;
      channel: "email" | "sms";
      messageId?: string;
    }
  | {
      operation: "sendOtpSms";
      status: "sent";
      to: string;
      provider: string;
      channel: "email" | "sms";
      messageId?: string;
    }
  | {
      operation: "sendMagicLinkEmail";
      status: "sent";
      to: string;
      provider: string;
      channel: "email" | "sms";
      messageId?: string;
    }
  | {
      operation: "sendBootstrapInviteEmail";
      status: "sent";
      to: string;
      provider: string;
      channel: "email" | "sms";
      messageId?: string;
    }
  | {
      operation: "sendOtpEmail" | "sendOtpSms" | "sendMagicLinkEmail" | "sendBootstrapInviteEmail";
      status: "failed";
      to: string;
      error: unknown;
    };

export type AuthMessageAuditSink = (entry: AuthMessageAuditEntry) => Promise<void> | void;

async function auditSuccess(
  audit: AuthMessageAuditSink,
  operation: AuthMessageAuditEntry["operation"],
  to: string,
  result: Awaited<ReturnType<MessagingClient["sendOtpEmail"]>>,
): Promise<void> {
  await audit({
    operation,
    status: "sent",
    to,
    provider: result.provider,
    channel: result.channel,
    messageId: result.messageId,
  });
}

async function auditFailure(
  audit: AuthMessageAuditSink,
  operation: AuthMessageAuditEntry["operation"],
  to: string,
  error: unknown,
): Promise<void> {
  await audit({
    operation,
    status: "failed",
    to,
    error,
  });
}

export function withAuthMessageAudit(
  messaging: MessagingClient,
  audit: AuthMessageAuditSink,
): MessagingClient {
  return {
    async sendOtpEmail(input: SendOtpEmailInput) {
      try {
        const result = await messaging.sendOtpEmail(input);
        await auditSuccess(audit, "sendOtpEmail", input.to, result);
        return result;
      } catch (error) {
        await auditFailure(audit, "sendOtpEmail", input.to, error);
        throw error;
      }
    },

    async sendOtpSms(input: SendOtpSmsInput) {
      try {
        const result = await messaging.sendOtpSms(input);
        await auditSuccess(audit, "sendOtpSms", input.to, result);
        return result;
      } catch (error) {
        await auditFailure(audit, "sendOtpSms", input.to, error);
        throw error;
      }
    },

    async sendMagicLinkEmail(input: SendMagicLinkEmailInput) {
      try {
        const result = await messaging.sendMagicLinkEmail(input);
        await auditSuccess(audit, "sendMagicLinkEmail", input.to, result);
        return result;
      } catch (error) {
        await auditFailure(audit, "sendMagicLinkEmail", input.to, error);
        throw error;
      }
    },

    async sendBootstrapInviteEmail(input: SendBootstrapInviteEmailInput) {
      try {
        const result = await messaging.sendBootstrapInviteEmail(input);
        await auditSuccess(audit, "sendBootstrapInviteEmail", input.to, result);
        return result;
      } catch (error) {
        await auditFailure(audit, "sendBootstrapInviteEmail", input.to, error);
        throw error;
      }
    },
  };
}
