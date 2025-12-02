import { render } from '@react-email/components';
import type { ReactElement } from 'react';
import { EMAIL_CONFIG, isConfigured, resend } from './config';
import { NewOrderAdmin } from './templates/NewOrderAdmin';
import { OrderConfirmation } from './templates/OrderConfirmation';
import { OrderStatusUpdate } from './templates/OrderStatusUpdate';
import { PasswordReset } from './templates/PasswordReset';
import { WelcomeEmail } from './templates/WelcomeEmail';

type SendEmailResult = {
  success: boolean;
  id?: string;
  error?: string;
};

/**
 * Generic send email function
 */
async function sendEmail({
  to,
  subject,
  template,
  from = EMAIL_CONFIG.from.default,
  replyTo = EMAIL_CONFIG.replyTo,
}: {
  to: string | string[];
  subject: string;
  template: ReactElement;
  from?: string;
  replyTo?: string;
}): Promise<SendEmailResult> {
  if (!isConfigured() || !resend) {
    console.warn('Resend is not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const html = await render(template);

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to send email:', message);
    return { success: false, error: message };
  }
}

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmation(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  orderUrl: string;
  storeName?: string;
  logoUrl?: string;
}): Promise<SendEmailResult> {
  const { to, ...templateProps } = params;

  return sendEmail({
    to,
    subject: `Order Confirmation - ${params.orderNumber}`,
    template: OrderConfirmation(templateProps),
    from: EMAIL_CONFIG.from.orders,
  });
}

/**
 * Send new order notification to admin
 */
export async function sendNewOrderAdmin(params: {
  to: string | string[];
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    sku?: string;
  }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  adminOrderUrl: string;
  storeName?: string;
  logoUrl?: string;
}): Promise<SendEmailResult> {
  const { to, ...templateProps } = params;

  return sendEmail({
    to,
    subject: `New Order Received - ${params.orderNumber}`,
    template: NewOrderAdmin(templateProps),
    from: EMAIL_CONFIG.from.orders,
  });
}

/**
 * Send order status update to customer
 */
export async function sendOrderStatusUpdate(params: {
  to: string;
  customerName: string;
  orderNumber: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  trackingUrl?: string;
  orderUrl: string;
  message?: string;
  storeName?: string;
  logoUrl?: string;
}): Promise<SendEmailResult> {
  const { to, ...templateProps } = params;

  const statusSubjects = {
    processing: 'Your order is being processed',
    shipped: 'Your order has been shipped!',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled',
  };

  return sendEmail({
    to,
    subject: `${statusSubjects[params.status]} - ${params.orderNumber}`,
    template: OrderStatusUpdate(templateProps),
    from: EMAIL_CONFIG.from.orders,
  });
}

/**
 * Send welcome email to new customer
 */
export async function sendWelcomeEmail(params: {
  to: string;
  customerName: string;
  shopUrl: string;
  storeName?: string;
  logoUrl?: string;
}): Promise<SendEmailResult> {
  const { to, ...templateProps } = params;

  return sendEmail({
    to,
    subject: `Welcome to ${params.storeName || 'Gemfolio'}!`,
    template: WelcomeEmail(templateProps),
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(params: {
  to: string;
  customerName: string;
  resetUrl: string;
  expiresIn?: string;
  storeName?: string;
  logoUrl?: string;
}): Promise<SendEmailResult> {
  const { to, ...templateProps } = params;

  return sendEmail({
    to,
    subject: 'Reset Your Password',
    template: PasswordReset(templateProps),
    from: EMAIL_CONFIG.from.support,
  });
}
