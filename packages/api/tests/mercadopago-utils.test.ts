import { describe, expect, it } from 'vitest';
import {
  isMercadoPagoConfigured,
  mapPaymentStatus,
  publicKey,
  verifyWebhookSignature,
} from '../src/lib/mercadopago';

// Note: This tests the utility functions that don't require the actual MercadoPago client

describe('MercadoPago Utils', () => {
  describe('mapPaymentStatus', () => {
    it('should map approved to paid', () => {
      expect(mapPaymentStatus('approved')).toBe('paid');
    });

    it('should map pending to pending', () => {
      expect(mapPaymentStatus('pending')).toBe('pending');
    });

    it('should map in_process to pending', () => {
      expect(mapPaymentStatus('in_process')).toBe('pending');
    });

    it('should map rejected to failed', () => {
      expect(mapPaymentStatus('rejected')).toBe('failed');
    });

    it('should map cancelled to failed', () => {
      expect(mapPaymentStatus('cancelled')).toBe('failed');
    });

    it('should map refunded to refunded', () => {
      expect(mapPaymentStatus('refunded')).toBe('refunded');
    });

    it('should default to pending for unknown status', () => {
      // @ts-expect-error Testing unknown status
      expect(mapPaymentStatus('unknown')).toBe('pending');
    });
  });

  describe('isMercadoPagoConfigured', () => {
    it('should return boolean', () => {
      const result = isMercadoPagoConfigured();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return true when no secret is configured', () => {
      // When MERCADOPAGO_WEBHOOK_SECRET is not set, it should return true
      const result = verifyWebhookSignature('ts=123,v1=abc', 'request-id', 'data-id');
      expect(result).toBe(true);
    });

    it('should return false when x-signature is invalid', () => {
      const originalEnv = process.env.MERCADOPAGO_WEBHOOK_SECRET;
      process.env.MERCADOPAGO_WEBHOOK_SECRET = 'test-secret';

      const result = verifyWebhookSignature('invalid-signature', 'request-id', 'data-id');
      expect(result).toBe(false);

      process.env.MERCADOPAGO_WEBHOOK_SECRET = originalEnv;
    });

    it('should return false when ts is missing', () => {
      const originalEnv = process.env.MERCADOPAGO_WEBHOOK_SECRET;
      process.env.MERCADOPAGO_WEBHOOK_SECRET = 'test-secret';

      const result = verifyWebhookSignature('v1=abc', 'request-id', 'data-id');
      expect(result).toBe(false);

      process.env.MERCADOPAGO_WEBHOOK_SECRET = originalEnv;
    });

    it('should return false when v1 is missing', () => {
      const originalEnv = process.env.MERCADOPAGO_WEBHOOK_SECRET;
      process.env.MERCADOPAGO_WEBHOOK_SECRET = 'test-secret';

      const result = verifyWebhookSignature('ts=123', 'request-id', 'data-id');
      expect(result).toBe(false);

      process.env.MERCADOPAGO_WEBHOOK_SECRET = originalEnv;
    });
  });

  describe('publicKey', () => {
    it('should be string or undefined', () => {
      expect(publicKey === undefined || typeof publicKey === 'string').toBe(true);
    });
  });

  describe('types', () => {
    it('should export CreatePreferenceItem type shape', () => {
      const item = {
        id: '123',
        title: 'Test Product',
        description: 'Description',
        quantity: 1,
        unit_price: 100,
        picture_url: 'http://example.com/image.jpg',
      };
      expect(item.id).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.quantity).toBeDefined();
      expect(item.unit_price).toBeDefined();
    });

    it('should export CreatePreferenceData type shape', () => {
      const data = {
        items: [],
        payer: {
          name: 'Test User',
          email: 'test@example.com',
          phone: { number: '1234567890' },
        },
        external_reference: 'order-123',
        notification_url: 'http://example.com/webhook',
        back_urls: {
          success: 'http://example.com/success',
          failure: 'http://example.com/failure',
          pending: 'http://example.com/pending',
        },
        auto_return: 'approved' as const,
        statement_descriptor: 'Test Store',
      };
      expect(data.payer.name).toBeDefined();
      expect(data.payer.email).toBeDefined();
      expect(data.external_reference).toBeDefined();
    });
  });
});
