import { describe, expect, it } from 'vitest';

import { mapPaymentStatus } from '../src/lib/mercadopago';

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
});
