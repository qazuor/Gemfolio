import { Hono } from 'hono';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ordersRoutes } from '../src/routes/orders';

// Mock the database and queries
vi.mock('@gemfolio/db', () => ({
  db: {},
}));

// Mock cart data
const mockCartWithItems = {
  id: 'cart-123',
  items: [
    {
      id: 'cart-item-1',
      quantity: 2,
      product: {
        id: 'prod-1',
        name: 'Anillo de Oro',
        slug: 'anillo-oro',
        price: '5000.00',
        image: 'https://example.com/anillo.jpg',
      },
      variant: null,
    },
    {
      id: 'cart-item-2',
      quantity: 1,
      product: {
        id: 'prod-2',
        name: 'Collar de Plata',
        slug: 'collar-plata',
        price: '3000.00',
        image: 'https://example.com/collar.jpg',
      },
      variant: {
        id: 'var-1',
        name: 'Grande',
        price: '3500.00',
        sku: 'COLLAR-G',
      },
    },
  ],
  couponCode: null,
};

const mockEmptyCart = {
  id: 'cart-empty',
  items: [],
  couponCode: null,
};

const mockCreatedOrder = {
  id: 'order-123',
  orderNumber: 'GEM-20240115-001',
  customerName: 'Juan Pérez',
  customerEmail: 'juan@example.com',
  customerPhone: '+54 11 1234-5678',
  status: 'pending',
  paymentStatus: 'pending',
  subtotal: '13500.00',
  shippingCost: '500.00',
  discount: '0.00',
  total: '14000.00',
  items: [],
};

const mockValidCoupon = {
  id: 'coupon-1',
  code: 'DESCUENTO10',
  type: 'percentage',
  value: 10,
  usageCount: 5,
  usageLimit: 100,
};

// Mock all queries
vi.mock('@gemfolio/db/queries', () => ({
  getCartById: vi.fn(),
  createOrder: vi.fn(),
  clearCart: vi.fn(),
  adjustStock: vi.fn(),
  validateCoupon: vi.fn(),
  calculateDiscount: vi.fn(),
  incrementCouponUsage: vi.fn(),
  getSettingsByGroup: vi.fn(),
  getOrderByNumber: vi.fn(),
}));

// Mock MercadoPago
vi.mock('../src/lib/mercadopago', () => ({
  isMercadoPagoConfigured: vi.fn(() => false),
  createPreference: vi.fn(),
}));

// Import mocked functions
import {
  adjustStock,
  calculateDiscount,
  clearCart,
  createOrder,
  getCartById,
  getOrderByNumber,
  getSettingsByGroup,
  incrementCouponUsage,
  validateCoupon,
} from '@gemfolio/db/queries';
import { createPreference, isMercadoPagoConfigured } from '../src/lib/mercadopago';

describe('Orders API', () => {
  let app: Hono;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    vi.mocked(getSettingsByGroup).mockResolvedValue([]);
    vi.mocked(validateCoupon).mockResolvedValue({ valid: false });
    vi.mocked(createOrder).mockResolvedValue(mockCreatedOrder);
    vi.mocked(clearCart).mockResolvedValue(undefined);
    vi.mocked(adjustStock).mockResolvedValue(undefined);

    // Create app with routes
    app = new Hono();
    app.route('/orders', ordersRoutes);
  });

  describe('POST /orders - Create Order', () => {
    const validOrderData = {
      cartId: 'cart-123',
      customerName: 'Juan Pérez',
      customerEmail: 'juan@example.com',
      customerPhone: '+54 11 1234-5678',
      shippingAddress: {
        fullName: 'Juan Pérez',
        phone: '+54 11 1234-5678',
        address: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        postalCode: '1043',
        country: 'Argentina',
      },
    };

    it('should create an order successfully', async () => {
      vi.mocked(getCartById).mockResolvedValue(mockCartWithItems);

      const res = await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.orderNumber).toBe('GEM-20240115-001');
    });

    it('should return 404 when cart not found', async () => {
      vi.mocked(getCartById).mockResolvedValue(null);

      const res = await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when cart is empty', async () => {
      vi.mocked(getCartById).mockResolvedValue(mockEmptyCart);

      const res = await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.error.message).toBe('Cart is empty');
    });

    it('should calculate subtotal correctly', async () => {
      vi.mocked(getCartById).mockResolvedValue(mockCartWithItems);

      await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      // Verify createOrder was called with correct subtotal
      // 2 * 5000 + 1 * 3500 = 13500
      expect(createOrder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          subtotal: '13500.00',
        }),
        expect.any(Array)
      );
    });

    it('should adjust stock for each item', async () => {
      vi.mocked(getCartById).mockResolvedValue(mockCartWithItems);

      await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      // Should be called for each item
      expect(adjustStock).toHaveBeenCalledTimes(2);
    });

    it('should clear cart after order creation', async () => {
      vi.mocked(getCartById).mockResolvedValue(mockCartWithItems);

      await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      expect(clearCart).toHaveBeenCalledWith(expect.anything(), 'cart-123');
    });

    it('should apply coupon discount when valid', async () => {
      vi.mocked(getCartById).mockResolvedValue({
        ...mockCartWithItems,
        couponCode: 'DESCUENTO10',
      });
      vi.mocked(validateCoupon).mockResolvedValue({
        valid: true,
        coupon: mockValidCoupon,
      });
      vi.mocked(calculateDiscount).mockReturnValue(1350); // 10% of 13500

      await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      expect(validateCoupon).toHaveBeenCalledWith(expect.anything(), 'DESCUENTO10', 13500);
      expect(incrementCouponUsage).toHaveBeenCalled();
      expect(createOrder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          discount: '1350.00',
          couponCode: 'DESCUENTO10',
        }),
        expect.any(Array)
      );
    });

    it('should apply free shipping coupon', async () => {
      vi.mocked(getCartById).mockResolvedValue({
        ...mockCartWithItems,
        couponCode: 'ENVIOGRATIS',
      });
      vi.mocked(validateCoupon).mockResolvedValue({
        valid: true,
        coupon: { ...mockValidCoupon, code: 'ENVIOGRATIS', type: 'free_shipping' },
      });
      vi.mocked(getSettingsByGroup).mockResolvedValue([
        { key: 'shipping', value: { flatRate: 500 } },
      ]);

      await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      expect(createOrder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          shippingCost: '0.00',
        }),
        expect.any(Array)
      );
    });

    it('should validate required fields', async () => {
      const invalidData = {
        cartId: 'cart-123',
        // Missing required fields
      };

      const res = await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(res.status).toBe(400);
    });

    it('should validate email format', async () => {
      const invalidData = {
        ...validOrderData,
        customerEmail: 'not-an-email',
      };

      const res = await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      expect(res.status).toBe(400);
    });

    it('should create MercadoPago preference when configured', async () => {
      vi.mocked(getCartById).mockResolvedValue(mockCartWithItems);
      vi.mocked(isMercadoPagoConfigured).mockReturnValue(true);
      vi.mocked(createPreference).mockResolvedValue({
        id: 'pref-123',
        init_point: 'https://mercadopago.com/checkout/123',
        sandbox_init_point: 'https://sandbox.mercadopago.com/checkout/123',
      });

      const res = await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      const json = await res.json();

      expect(createPreference).toHaveBeenCalledWith(
        expect.objectContaining({
          external_reference: 'GEM-20240115-001',
          payer: expect.objectContaining({
            email: 'juan@example.com',
          }),
        })
      );
      expect(json.data.preferenceId).toBe('pref-123');
    });
  });

  describe('GET /orders/:orderNumber - Get Order', () => {
    const mockOrder = {
      id: 'order-123',
      orderNumber: 'GEM-20240115-001',
      status: 'pending',
      paymentStatus: 'pending',
      customerName: 'Juan Pérez',
      customerEmail: 'juan@example.com',
      items: [],
      subtotal: '13500.00',
      shippingCost: '500.00',
      discount: '0.00',
      total: '14000.00',
      createdAt: new Date(),
    };

    it('should return order by order number', async () => {
      vi.mocked(getOrderByNumber).mockResolvedValue(mockOrder);

      const res = await app.request('/orders/GEM-20240115-001');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.orderNumber).toBe('GEM-20240115-001');
    });

    it('should return 404 when order not found', async () => {
      vi.mocked(getOrderByNumber).mockResolvedValue(null);

      const res = await app.request('/orders/GEM-INVALID');
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
    });

    it('should verify email when provided', async () => {
      vi.mocked(getOrderByNumber).mockResolvedValue(mockOrder);

      const res = await app.request('/orders/GEM-20240115-001?email=juan@example.com');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });

    it('should return 401 when email does not match', async () => {
      vi.mocked(getOrderByNumber).mockResolvedValue(mockOrder);

      const res = await app.request('/orders/GEM-20240115-001?email=wrong@example.com');
      const json = await res.json();

      expect(res.status).toBe(401);
      expect(json.success).toBe(false);
    });

    it('should be case insensitive for email verification', async () => {
      vi.mocked(getOrderByNumber).mockResolvedValue(mockOrder);

      const res = await app.request('/orders/GEM-20240115-001?email=JUAN@EXAMPLE.COM');
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
    });
  });

  describe('POST /orders/:orderNumber/retry-payment', () => {
    const mockPendingOrder = {
      id: 'order-123',
      orderNumber: 'GEM-20240115-001',
      paymentStatus: 'pending',
      customerName: 'Juan Pérez',
      customerEmail: 'juan@example.com',
      customerPhone: '+54 11 1234-5678',
      items: [
        {
          snapshot: {
            productId: 'prod-1',
            productName: 'Anillo de Oro',
            variantName: null,
          },
          quantity: 1,
          unitPrice: '5000.00',
        },
      ],
    };

    it('should create new payment preference for pending order', async () => {
      vi.mocked(getOrderByNumber).mockResolvedValue(mockPendingOrder);
      vi.mocked(isMercadoPagoConfigured).mockReturnValue(true);
      vi.mocked(createPreference).mockResolvedValue({
        id: 'pref-456',
        init_point: 'https://mercadopago.com/checkout/456',
        sandbox_init_point: 'https://sandbox.mercadopago.com/checkout/456',
      });

      const res = await app.request('/orders/GEM-20240115-001/retry-payment', {
        method: 'POST',
      });

      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.preferenceId).toBe('pref-456');
    });

    it('should return 404 when order not found', async () => {
      vi.mocked(getOrderByNumber).mockResolvedValue(null);

      const res = await app.request('/orders/GEM-INVALID/retry-payment', {
        method: 'POST',
      });

      await res.json();

      expect(res.status).toBe(404);
    });

    it('should return 400 when payment is not pending', async () => {
      vi.mocked(getOrderByNumber).mockResolvedValue({
        ...mockPendingOrder,
        paymentStatus: 'paid',
      });

      const res = await app.request('/orders/GEM-20240115-001/retry-payment', {
        method: 'POST',
      });

      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error.message).toBe('Order payment is not pending');
    });

    it('should return 400 when MercadoPago is not configured', async () => {
      vi.mocked(getOrderByNumber).mockResolvedValue(mockPendingOrder);
      vi.mocked(isMercadoPagoConfigured).mockReturnValue(false);

      const res = await app.request('/orders/GEM-20240115-001/retry-payment', {
        method: 'POST',
      });

      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.error.message).toBe('Payment system not configured');
    });
  });

  describe('Order calculation edge cases', () => {
    const validOrderData = {
      cartId: 'cart-123',
      customerName: 'Juan Pérez',
      customerEmail: 'juan@example.com',
      customerPhone: '+54 11 1234-5678',
      shippingAddress: {
        fullName: 'Juan Pérez',
        phone: '+54 11 1234-5678',
        address: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        postalCode: '1043',
        country: 'Argentina',
      },
    };

    it('should apply free shipping when threshold is reached', async () => {
      vi.mocked(getCartById).mockResolvedValue(mockCartWithItems);
      vi.mocked(getSettingsByGroup).mockResolvedValue([
        {
          key: 'shipping',
          value: {
            flatRate: 1000,
            freeShippingThreshold: 10000, // 13500 > 10000, should be free
          },
        },
      ]);

      await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      expect(createOrder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          shippingCost: '0.00',
        }),
        expect.any(Array)
      );
    });

    it('should charge shipping when below threshold', async () => {
      const lowValueCart = {
        id: 'cart-123',
        items: [
          {
            id: 'cart-item-1',
            quantity: 1,
            product: {
              id: 'prod-1',
              name: 'Item Barato',
              slug: 'item-barato',
              price: '500.00',
              image: null,
            },
            variant: null,
          },
        ],
        couponCode: null,
      };

      vi.mocked(getCartById).mockResolvedValue(lowValueCart);
      vi.mocked(getSettingsByGroup).mockResolvedValue([
        {
          key: 'shipping',
          value: {
            flatRate: 1000,
            freeShippingThreshold: 10000,
          },
        },
      ]);

      await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      expect(createOrder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          shippingCost: '1000.00',
        }),
        expect.any(Array)
      );
    });

    it('should use variant price when available', async () => {
      const cartWithVariant = {
        id: 'cart-123',
        items: [
          {
            id: 'cart-item-1',
            quantity: 1,
            product: {
              id: 'prod-1',
              name: 'Producto con Variante',
              slug: 'prod-variante',
              price: '1000.00', // Base price
              image: null,
            },
            variant: {
              id: 'var-1',
              name: 'Premium',
              price: '1500.00', // Variant price should be used
              sku: 'PROD-PREM',
            },
          },
        ],
        couponCode: null,
      };

      vi.mocked(getCartById).mockResolvedValue(cartWithVariant);

      await app.request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validOrderData),
      });

      expect(createOrder).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          subtotal: '1500.00', // Uses variant price
        }),
        expect.any(Array)
      );
    });
  });
});
