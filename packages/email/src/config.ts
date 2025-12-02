import { Resend } from 'resend';

// Initialize Resend client
const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const isConfigured = (): boolean => {
  return !!resendApiKey;
};

// Email configuration
export const EMAIL_CONFIG = {
  from: {
    default: process.env.EMAIL_FROM || 'Gemfolio <noreply@gemfolio.com>',
    support: process.env.EMAIL_FROM_SUPPORT || 'Gemfolio Support <support@gemfolio.com>',
    orders: process.env.EMAIL_FROM_ORDERS || 'Gemfolio Orders <orders@gemfolio.com>',
  },
  replyTo: process.env.EMAIL_REPLY_TO || 'support@gemfolio.com',
} as const;
