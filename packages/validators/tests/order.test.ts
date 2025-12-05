import { describe, expect, it } from 'vitest';
import {
  addOrderNoteSchema,
  addressSchema,
  createOrderSchema,
  orderFiltersSchema,
  orderPaginationSchema,
  orderStatusSchema,
  paymentStatusSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from '../src/order';

describe('Order Validators', () => {
  describe('orderStatusSchema', () => {
    it('should accept valid statuses', () => {
      expect(orderStatusSchema.parse('pending')).toBe('pending');
      expect(orderStatusSchema.parse('confirmed')).toBe('confirmed');
      expect(orderStatusSchema.parse('processing')).toBe('processing');
      expect(orderStatusSchema.parse('shipped')).toBe('shipped');
      expect(orderStatusSchema.parse('delivered')).toBe('delivered');
      expect(orderStatusSchema.parse('cancelled')).toBe('cancelled');
      expect(orderStatusSchema.parse('refunded')).toBe('refunded');
    });

    it('should reject invalid statuses', () => {
      expect(() => orderStatusSchema.parse('invalid')).toThrow();
      expect(() => orderStatusSchema.parse('')).toThrow();
    });
  });

  describe('paymentStatusSchema', () => {
    it('should accept valid payment statuses', () => {
      expect(paymentStatusSchema.parse('pending')).toBe('pending');
      expect(paymentStatusSchema.parse('paid')).toBe('paid');
      expect(paymentStatusSchema.parse('failed')).toBe('failed');
      expect(paymentStatusSchema.parse('refunded')).toBe('refunded');
    });

    it('should reject invalid payment statuses', () => {
      expect(() => paymentStatusSchema.parse('invalid')).toThrow();
    });
  });

  describe('addressSchema', () => {
    const validAddress = {
      street: 'Av. Corrientes 1234',
      city: 'Buenos Aires',
      state: 'Buenos Aires',
      postalCode: '1043',
    };

    it('should accept valid address', () => {
      const result = addressSchema.parse(validAddress);
      expect(result.street).toBe('Av. Corrientes 1234');
      expect(result.city).toBe('Buenos Aires');
      expect(result.country).toBe('Argentina');
    });

    it('should accept address with custom country', () => {
      const result = addressSchema.parse({ ...validAddress, country: 'Uruguay' });
      expect(result.country).toBe('Uruguay');
    });

    it('should reject empty street', () => {
      expect(() => addressSchema.parse({ ...validAddress, street: '' })).toThrow();
    });

    it('should reject empty city', () => {
      expect(() => addressSchema.parse({ ...validAddress, city: '' })).toThrow();
    });

    it('should reject empty state', () => {
      expect(() => addressSchema.parse({ ...validAddress, state: '' })).toThrow();
    });

    it('should reject empty postalCode', () => {
      expect(() => addressSchema.parse({ ...validAddress, postalCode: '' })).toThrow();
    });
  });

  describe('createOrderSchema', () => {
    const validOrder = {
      customerName: 'Juan Pérez',
      customerEmail: 'juan@example.com',
      customerPhone: '+54 11 1234-5678',
      shippingAddress: {
        street: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        postalCode: '1043',
      },
    };

    it('should accept valid order', () => {
      const result = createOrderSchema.parse(validOrder);
      expect(result.customerName).toBe('Juan Pérez');
      expect(result.customerEmail).toBe('juan@example.com');
      expect(result.sameAsBilling).toBe(true);
    });

    it('should accept order with all fields', () => {
      const fullOrder = {
        ...validOrder,
        billingAddress: {
          street: 'Av. Santa Fe 5678',
          city: 'Buenos Aires',
          state: 'Buenos Aires',
          postalCode: '1414',
        },
        sameAsBilling: false,
        notes: 'Entregar después de las 18hs',
        couponCode: 'DESCUENTO10',
        cartId: 'cart-123',
      };
      const result = createOrderSchema.parse(fullOrder);
      expect(result.billingAddress).toBeDefined();
      expect(result.sameAsBilling).toBe(false);
      expect(result.notes).toBe('Entregar después de las 18hs');
      expect(result.couponCode).toBe('DESCUENTO10');
    });

    it('should reject empty customerName', () => {
      expect(() => createOrderSchema.parse({ ...validOrder, customerName: '' })).toThrow();
    });

    it('should reject invalid email', () => {
      expect(() =>
        createOrderSchema.parse({ ...validOrder, customerEmail: 'invalid-email' })
      ).toThrow();
    });

    it('should reject empty phone', () => {
      expect(() => createOrderSchema.parse({ ...validOrder, customerPhone: '' })).toThrow();
    });

    it('should reject notes exceeding max length', () => {
      const longNotes = 'a'.repeat(1001);
      expect(() => createOrderSchema.parse({ ...validOrder, notes: longNotes })).toThrow();
    });
  });

  describe('updateOrderStatusSchema', () => {
    it('should accept valid status update', () => {
      const result = updateOrderStatusSchema.parse({ status: 'shipped' });
      expect(result.status).toBe('shipped');
    });

    it('should accept status with note', () => {
      const result = updateOrderStatusSchema.parse({
        status: 'shipped',
        note: 'Enviado por OCA',
      });
      expect(result.note).toBe('Enviado por OCA');
    });

    it('should reject invalid status', () => {
      expect(() => updateOrderStatusSchema.parse({ status: 'invalid' })).toThrow();
    });

    it('should reject note exceeding max length', () => {
      const longNote = 'a'.repeat(501);
      expect(() => updateOrderStatusSchema.parse({ status: 'shipped', note: longNote })).toThrow();
    });
  });

  describe('updatePaymentStatusSchema', () => {
    it('should accept valid payment status update', () => {
      const result = updatePaymentStatusSchema.parse({ paymentStatus: 'paid' });
      expect(result.paymentStatus).toBe('paid');
    });

    it('should accept payment status with reference', () => {
      const result = updatePaymentStatusSchema.parse({
        paymentStatus: 'paid',
        paymentReference: 'MP-123456',
      });
      expect(result.paymentReference).toBe('MP-123456');
    });

    it('should reject invalid payment status', () => {
      expect(() => updatePaymentStatusSchema.parse({ paymentStatus: 'invalid' })).toThrow();
    });
  });

  describe('addOrderNoteSchema', () => {
    it('should accept valid note', () => {
      const result = addOrderNoteSchema.parse({ note: 'Nota importante' });
      expect(result.note).toBe('Nota importante');
      expect(result.isInternal).toBe(true);
    });

    it('should accept external note', () => {
      const result = addOrderNoteSchema.parse({
        note: 'Nota para cliente',
        isInternal: false,
      });
      expect(result.isInternal).toBe(false);
    });

    it('should reject empty note', () => {
      expect(() => addOrderNoteSchema.parse({ note: '' })).toThrow();
    });

    it('should reject note exceeding max length', () => {
      const longNote = 'a'.repeat(1001);
      expect(() => addOrderNoteSchema.parse({ note: longNote })).toThrow();
    });
  });

  describe('orderFiltersSchema', () => {
    it('should accept valid filters', () => {
      const filters = {
        status: 'pending',
        paymentStatus: 'paid',
        customerEmail: 'test@example.com',
        orderNumber: 'ORD-001',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-12-31T23:59:59.999Z',
        search: 'juan',
      };
      const result = orderFiltersSchema.parse(filters);
      expect(result).toEqual(filters);
    });

    it('should accept empty filters', () => {
      const result = orderFiltersSchema.parse({});
      expect(result).toEqual({});
    });

    it('should reject invalid status', () => {
      expect(() => orderFiltersSchema.parse({ status: 'invalid' })).toThrow();
    });

    it('should reject invalid email', () => {
      expect(() => orderFiltersSchema.parse({ customerEmail: 'invalid-email' })).toThrow();
    });

    it('should reject invalid datetime format', () => {
      expect(() => orderFiltersSchema.parse({ startDate: '2024-01-01' })).toThrow();
    });
  });

  describe('orderPaginationSchema', () => {
    it('should apply defaults', () => {
      const result = orderPaginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe('createdAt');
      expect(result.sortOrder).toBe('desc');
    });

    it('should accept valid pagination', () => {
      const pagination = {
        page: 3,
        limit: 50,
        sortBy: 'total',
        sortOrder: 'asc',
      };
      const result = orderPaginationSchema.parse(pagination);
      expect(result).toEqual(pagination);
    });

    it('should reject page less than 1', () => {
      expect(() => orderPaginationSchema.parse({ page: 0 })).toThrow();
    });

    it('should reject limit greater than 100', () => {
      expect(() => orderPaginationSchema.parse({ limit: 101 })).toThrow();
    });

    it('should reject invalid sortBy', () => {
      expect(() => orderPaginationSchema.parse({ sortBy: 'invalid' })).toThrow();
    });
  });
});
