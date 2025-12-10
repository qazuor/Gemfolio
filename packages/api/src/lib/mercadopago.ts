import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// Initialize Mercado Pago client
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
export const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY;

if (!accessToken) {
  console.warn('MERCADOPAGO_ACCESS_TOKEN not configured. Payment processing will fail.');
}

const client = accessToken
  ? new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 },
    })
  : null;

const preference = client ? new Preference(client) : null;
const payment = client ? new Payment(client) : null;

// Types
export type CreatePreferenceItem = {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  picture_url?: string;
};

export type CreatePreferenceData = {
  items: CreatePreferenceItem[];
  payer: {
    name: string;
    email: string;
    phone?: {
      number: string;
    };
  };
  external_reference: string;
  notification_url?: string;
  back_urls?: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return?: 'approved' | 'all';
  statement_descriptor?: string;
};

export type PreferenceResponse = {
  id: string;
  init_point: string;
  sandbox_init_point: string;
};

export type PaymentInfo = {
  id: number;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled' | 'refunded' | 'in_process';
  status_detail: string;
  external_reference: string;
  transaction_amount: number;
  currency_id: string;
  payment_method_id: string;
  payment_type_id: string;
  date_approved: string | null;
  payer: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
};

/**
 * Check if Mercado Pago is configured
 */
export function isMercadoPagoConfigured(): boolean {
  return !!client && !!preference && !!payment;
}

/**
 * Create a payment preference for checkout
 */
export async function createPreference(data: CreatePreferenceData): Promise<PreferenceResponse> {
  if (!preference) {
    throw new Error('Mercado Pago not configured');
  }

  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3001';
  const webUrl = process.env.WEB_URL || 'http://localhost:4321';

  const response = await preference.create({
    body: {
      items: data.items.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'ARS',
        picture_url: item.picture_url,
      })),
      payer: {
        name: data.payer.name,
        email: data.payer.email,
        phone: data.payer.phone,
      },
      external_reference: data.external_reference,
      notification_url: data.notification_url || `${baseUrl}/api/webhooks/mercadopago`,
      back_urls: data.back_urls || {
        success: `${webUrl}/checkout/success`,
        failure: `${webUrl}/checkout/failure`,
        pending: `${webUrl}/checkout/pending`,
      },
      auto_return: data.auto_return || 'approved',
      statement_descriptor: data.statement_descriptor || 'GEMFOLIO',
    },
  });

  return {
    id: response.id!,
    init_point: response.init_point!,
    sandbox_init_point: response.sandbox_init_point!,
  };
}

/**
 * Get payment information by ID
 */
export async function getPayment(paymentId: number): Promise<PaymentInfo | null> {
  if (!payment) {
    throw new Error('Mercado Pago not configured');
  }

  try {
    const response = await payment.get({ id: paymentId });

    if (!response) {
      return null;
    }

    return {
      id: response.id!,
      status: response.status as PaymentInfo['status'],
      status_detail: response.status_detail!,
      external_reference: response.external_reference!,
      transaction_amount: response.transaction_amount!,
      currency_id: response.currency_id!,
      payment_method_id: response.payment_method_id!,
      payment_type_id: response.payment_type_id!,
      date_approved: response.date_approved ? response.date_approved.toString() : null,
      payer: {
        email: response.payer?.email || '',
        identification: response.payer?.identification
          ? {
              type: response.payer.identification.type || '',
              number: response.payer.identification.number || '',
            }
          : undefined,
      },
    };
  } catch (error) {
    console.error('Error fetching payment:', error);
    return null;
  }
}

/**
 * Map Mercado Pago status to our payment status
 */
export function mapPaymentStatus(
  mpStatus: PaymentInfo['status']
): 'pending' | 'paid' | 'failed' | 'refunded' {
  switch (mpStatus) {
    case 'approved':
      return 'paid';
    case 'pending':
    case 'in_process':
      return 'pending';
    case 'rejected':
    case 'cancelled':
      return 'failed';
    case 'refunded':
      return 'refunded';
    default:
      return 'pending';
  }
}

/**
 * Verify webhook signature (optional but recommended for production)
 */
export function verifyWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    // If no secret configured, skip verification (not recommended for production)
    console.warn('MERCADOPAGO_WEBHOOK_SECRET not configured. Skipping signature verification.');
    return true;
  }

  // Parse x-signature header
  const parts = xSignature.split(',');
  let ts: string | undefined;
  let v1: string | undefined;

  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key === 'ts') ts = value;
    if (key === 'v1') v1 = value;
  }

  if (!ts || !v1) {
    return false;
  }

  // Build manifest string
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // Calculate HMAC
  const crypto = require('node:crypto');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(manifest);
  const calculatedSignature = hmac.digest('hex');

  return calculatedSignature === v1;
}
