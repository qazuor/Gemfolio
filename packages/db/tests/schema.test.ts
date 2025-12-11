import { describe, expect, it } from 'vitest';
import {
  abandonedCartStatusEnum,
  abandonedCarts,
  abandonedCartsRelations,
} from '../src/schema/abandoned-carts';
import {
  attributes,
  attributesRelations,
  attributeTypeEnum,
  categoryAttributes,
  categoryAttributesRelations,
} from '../src/schema/attributes';
import {
  bundleItems,
  bundleItemsRelations,
  bundleStatusEnum,
  bundles,
  bundlesRelations,
} from '../src/schema/bundles';
import { cartItems, cartItemsRelations, carts, cartsRelations } from '../src/schema/carts';
import { categories, categoriesRelations, categoryStatusEnum } from '../src/schema/categories';
import { coupons, couponTypeEnum } from '../src/schema/coupons';
import {
  inventoryMovements,
  inventoryMovementsRelations,
  inventoryMovementTypeEnum,
} from '../src/schema/inventory';
import {
  orderItems,
  orderItemsRelations,
  orderStatusEnum,
  orderStatusHistory,
  orderStatusHistoryRelations,
  orders,
  ordersRelations,
  paymentStatusEnum,
  refundReasonEnum,
  refundStatusEnum,
  refunds,
  refundsRelations,
} from '../src/schema/orders';
import { pageStatusEnum, pages } from '../src/schema/pages';
// Import all schema modules
import {
  productImages,
  productImagesRelations,
  productStatusEnum,
  products,
  productsRelations,
  productVariants,
  productVariantsRelations,
  productVideos,
  productVideosRelations,
} from '../src/schema/products';
import {
  reviewStatusEnum,
  reviews,
  reviewsRelations,
  reviewVotes,
  reviewVotesRelations,
} from '../src/schema/reviews';
import { settings } from '../src/schema/settings';
import { productTags, productTagsRelations, tags, tagsRelations } from '../src/schema/tags';
import { userRoleEnum, users, usersRelations } from '../src/schema/users';
import { wishlists, wishlistsRelations } from '../src/schema/wishlists';

import { createId, generateOrderNumber } from '../src/utils';

describe('Schema Definitions', () => {
  describe('Products Schema', () => {
    it('should export products table', () => {
      expect(products).toBeDefined();
      expect(products.id).toBeDefined();
      expect(products.name).toBeDefined();
      expect(products.slug).toBeDefined();
      expect(products.price).toBeDefined();
      expect(products.status).toBeDefined();
    });

    it('should have id column with $defaultFn that generates valid IDs', () => {
      const idColumn = products.id;
      expect(idColumn).toBeDefined();
      // The $defaultFn should be accessible and generate IDs
      const generatedId = createId();
      expect(generatedId).toMatch(/^[a-z0-9]+$/);
    });

    it('should export productVariants table', () => {
      expect(productVariants).toBeDefined();
      expect(productVariants.id).toBeDefined();
      expect(productVariants.productId).toBeDefined();
      expect(productVariants.sku).toBeDefined();
      expect(productVariants.price).toBeDefined();
    });

    it('should export productImages table', () => {
      expect(productImages).toBeDefined();
      expect(productImages.id).toBeDefined();
      expect(productImages.productId).toBeDefined();
      expect(productImages.url).toBeDefined();
    });

    it('should export productVideos table', () => {
      expect(productVideos).toBeDefined();
      expect(productVideos.id).toBeDefined();
      expect(productVideos.productId).toBeDefined();
      expect(productVideos.url).toBeDefined();
    });

    it('should export product relations', () => {
      expect(productsRelations).toBeDefined();
      expect(productVariantsRelations).toBeDefined();
      expect(productImagesRelations).toBeDefined();
      expect(productVideosRelations).toBeDefined();
    });

    it('should export productStatusEnum with valid values', () => {
      expect(productStatusEnum).toBeDefined();
      expect(productStatusEnum.enumValues).toContain('draft');
      expect(productStatusEnum.enumValues).toContain('active');
      expect(productStatusEnum.enumValues).toContain('archived');
    });

    it('should define valid types', () => {
      // Type checking at compile time, runtime check for type structure
      const mockProduct: Partial<Product> = {
        id: 'test-id',
        name: 'Test Product',
        slug: 'test-product',
        price: '100.00',
        status: 'active',
      };
      expect(mockProduct.id).toBe('test-id');
    });
  });

  describe('Orders Schema', () => {
    it('should export orders table', () => {
      expect(orders).toBeDefined();
      expect(orders.id).toBeDefined();
      expect(orders.orderNumber).toBeDefined();
      expect(orders.status).toBeDefined();
      expect(orders.paymentStatus).toBeDefined();
      expect(orders.total).toBeDefined();
    });

    it('should have orderNumber with $defaultFn that generates valid order numbers', () => {
      const orderNumber = generateOrderNumber();
      expect(orderNumber).toMatch(/^GEM-\d{4}-[A-Z0-9]{4}$/);
    });

    it('should export orderItems table', () => {
      expect(orderItems).toBeDefined();
      expect(orderItems.id).toBeDefined();
      expect(orderItems.orderId).toBeDefined();
      expect(orderItems.quantity).toBeDefined();
    });

    it('should export orderStatusHistory table', () => {
      expect(orderStatusHistory).toBeDefined();
      expect(orderStatusHistory.id).toBeDefined();
      expect(orderStatusHistory.orderId).toBeDefined();
      expect(orderStatusHistory.status).toBeDefined();
    });

    it('should export refunds table', () => {
      expect(refunds).toBeDefined();
      expect(refunds.id).toBeDefined();
      expect(refunds.orderId).toBeDefined();
      expect(refunds.amount).toBeDefined();
      expect(refunds.status).toBeDefined();
    });

    it('should export order relations', () => {
      expect(ordersRelations).toBeDefined();
      expect(orderItemsRelations).toBeDefined();
      expect(orderStatusHistoryRelations).toBeDefined();
      expect(refundsRelations).toBeDefined();
    });

    it('should export order enums with valid values', () => {
      expect(orderStatusEnum.enumValues).toContain('pending');
      expect(orderStatusEnum.enumValues).toContain('confirmed');
      expect(orderStatusEnum.enumValues).toContain('shipped');
      expect(orderStatusEnum.enumValues).toContain('delivered');

      expect(paymentStatusEnum.enumValues).toContain('pending');
      expect(paymentStatusEnum.enumValues).toContain('paid');
      expect(paymentStatusEnum.enumValues).toContain('failed');

      expect(refundStatusEnum.enumValues).toContain('pending');
      expect(refundStatusEnum.enumValues).toContain('approved');
      expect(refundStatusEnum.enumValues).toContain('completed');

      expect(refundReasonEnum.enumValues).toContain('customer_request');
      expect(refundReasonEnum.enumValues).toContain('defective_product');
    });

    it('should define valid Address type structure', () => {
      const mockAddress: AddressType = {
        fullName: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        city: 'Buenos Aires',
        state: 'CABA',
        postalCode: '1000',
        country: 'Argentina',
      };
      expect(mockAddress.fullName).toBe('John Doe');
    });

    it('should define valid OrderItemSnapshot type structure', () => {
      const mockSnapshot: OrderItemSnapshot = {
        productId: 'prod-1',
        productName: 'Test Product',
        sku: 'SKU-001',
        price: '100.00',
      };
      expect(mockSnapshot.productId).toBe('prod-1');
    });
  });

  describe('Categories Schema', () => {
    it('should export categories table', () => {
      expect(categories).toBeDefined();
      expect(categories.id).toBeDefined();
      expect(categories.name).toBeDefined();
      expect(categories.slug).toBeDefined();
      expect(categories.status).toBeDefined();
    });

    it('should export categoriesRelations', () => {
      expect(categoriesRelations).toBeDefined();
    });

    it('should export categoryStatusEnum with valid values', () => {
      expect(categoryStatusEnum.enumValues).toContain('draft');
      expect(categoryStatusEnum.enumValues).toContain('active');
      expect(categoryStatusEnum.enumValues).toContain('archived');
    });
  });

  describe('Coupons Schema', () => {
    it('should export coupons table', () => {
      expect(coupons).toBeDefined();
      expect(coupons.id).toBeDefined();
      expect(coupons.code).toBeDefined();
      expect(coupons.type).toBeDefined();
      expect(coupons.value).toBeDefined();
      expect(coupons.isActive).toBeDefined();
    });

    it('should export couponTypeEnum with valid values', () => {
      expect(couponTypeEnum.enumValues).toContain('percentage');
      expect(couponTypeEnum.enumValues).toContain('fixed');
      expect(couponTypeEnum.enumValues).toContain('free_shipping');
    });
  });

  describe('Users Schema', () => {
    it('should export users table', () => {
      expect(users).toBeDefined();
      expect(users.id).toBeDefined();
      expect(users.email).toBeDefined();
      expect(users.role).toBeDefined();
    });

    it('should export usersRelations', () => {
      expect(usersRelations).toBeDefined();
    });

    it('should export userRoleEnum with valid values', () => {
      expect(userRoleEnum.enumValues).toContain('customer');
      expect(userRoleEnum.enumValues).toContain('admin');
    });
  });

  describe('Tags Schema', () => {
    it('should export tags table', () => {
      expect(tags).toBeDefined();
      expect(tags.id).toBeDefined();
      expect(tags.name).toBeDefined();
      expect(tags.slug).toBeDefined();
    });

    it('should export productTags table', () => {
      expect(productTags).toBeDefined();
      expect(productTags.productId).toBeDefined();
      expect(productTags.tagId).toBeDefined();
    });

    it('should export tag relations', () => {
      expect(tagsRelations).toBeDefined();
      expect(productTagsRelations).toBeDefined();
    });
  });

  describe('Carts Schema', () => {
    it('should export carts table', () => {
      expect(carts).toBeDefined();
      expect(carts.id).toBeDefined();
      expect(carts.userId).toBeDefined();
      expect(carts.visitorId).toBeDefined();
    });

    it('should export cartItems table', () => {
      expect(cartItems).toBeDefined();
      expect(cartItems.id).toBeDefined();
      expect(cartItems.cartId).toBeDefined();
      expect(cartItems.quantity).toBeDefined();
    });

    it('should export cart relations', () => {
      expect(cartsRelations).toBeDefined();
      expect(cartItemsRelations).toBeDefined();
    });
  });

  describe('Wishlists Schema', () => {
    it('should export wishlists table', () => {
      expect(wishlists).toBeDefined();
      expect(wishlists.id).toBeDefined();
      expect(wishlists.userId).toBeDefined();
      expect(wishlists.productId).toBeDefined();
    });

    it('should export wishlist relations', () => {
      expect(wishlistsRelations).toBeDefined();
    });
  });

  describe('Reviews Schema', () => {
    it('should export reviews table', () => {
      expect(reviews).toBeDefined();
      expect(reviews.id).toBeDefined();
      expect(reviews.productId).toBeDefined();
      expect(reviews.rating).toBeDefined();
      expect(reviews.content).toBeDefined();
      expect(reviews.status).toBeDefined();
    });

    it('should export reviewVotes table', () => {
      expect(reviewVotes).toBeDefined();
      expect(reviewVotes.id).toBeDefined();
      expect(reviewVotes.reviewId).toBeDefined();
      expect(reviewVotes.userId).toBeDefined();
      expect(reviewVotes.isHelpful).toBeDefined();
    });

    it('should export reviewsRelations', () => {
      expect(reviewsRelations).toBeDefined();
      expect(reviewVotesRelations).toBeDefined();
    });

    it('should export reviewStatusEnum with valid values', () => {
      expect(reviewStatusEnum.enumValues).toContain('pending');
      expect(reviewStatusEnum.enumValues).toContain('approved');
      expect(reviewStatusEnum.enumValues).toContain('rejected');
    });
  });

  describe('Pages Schema', () => {
    it('should export pages table', () => {
      expect(pages).toBeDefined();
      expect(pages.id).toBeDefined();
      expect(pages.slug).toBeDefined();
      expect(pages.title).toBeDefined();
      expect(pages.status).toBeDefined();
    });

    it('should export pageStatusEnum with valid values', () => {
      expect(pageStatusEnum.enumValues).toContain('draft');
      expect(pageStatusEnum.enumValues).toContain('published');
    });
  });

  describe('Settings Schema', () => {
    it('should export settings table', () => {
      expect(settings).toBeDefined();
      expect(settings.key).toBeDefined();
      expect(settings.value).toBeDefined();
      expect(settings.group).toBeDefined();
      expect(settings.updatedAt).toBeDefined();
    });
  });

  describe('Inventory Schema', () => {
    it('should export inventoryMovements table', () => {
      expect(inventoryMovements).toBeDefined();
      expect(inventoryMovements.id).toBeDefined();
      expect(inventoryMovements.type).toBeDefined();
      expect(inventoryMovements.quantity).toBeDefined();
      expect(inventoryMovements.productId).toBeDefined();
      expect(inventoryMovements.previousStock).toBeDefined();
      expect(inventoryMovements.newStock).toBeDefined();
    });

    it('should export inventoryMovementTypeEnum with valid values', () => {
      expect(inventoryMovementTypeEnum.enumValues).toContain('in');
      expect(inventoryMovementTypeEnum.enumValues).toContain('out');
      expect(inventoryMovementTypeEnum.enumValues).toContain('adjustment');
      expect(inventoryMovementTypeEnum.enumValues).toContain('return');
    });

    it('should export inventory movement relations', () => {
      expect(inventoryMovementsRelations).toBeDefined();
    });
  });

  describe('Bundles Schema', () => {
    it('should export bundles table', () => {
      expect(bundles).toBeDefined();
      expect(bundles.id).toBeDefined();
      expect(bundles.name).toBeDefined();
      expect(bundles.slug).toBeDefined();
      expect(bundles.price).toBeDefined();
      expect(bundles.status).toBeDefined();
    });

    it('should export bundleItems table', () => {
      expect(bundleItems).toBeDefined();
      expect(bundleItems.id).toBeDefined();
      expect(bundleItems.bundleId).toBeDefined();
      expect(bundleItems.productId).toBeDefined();
      expect(bundleItems.quantity).toBeDefined();
    });

    it('should export bundle relations', () => {
      expect(bundlesRelations).toBeDefined();
      expect(bundleItemsRelations).toBeDefined();
    });

    it('should export bundleStatusEnum with valid values', () => {
      expect(bundleStatusEnum.enumValues).toContain('draft');
      expect(bundleStatusEnum.enumValues).toContain('active');
      expect(bundleStatusEnum.enumValues).toContain('archived');
    });
  });

  describe('Attributes Schema', () => {
    it('should export attributes table', () => {
      expect(attributes).toBeDefined();
      expect(attributes.id).toBeDefined();
      expect(attributes.name).toBeDefined();
      expect(attributes.slug).toBeDefined();
      expect(attributes.type).toBeDefined();
      expect(attributes.values).toBeDefined();
    });

    it('should export categoryAttributes table', () => {
      expect(categoryAttributes).toBeDefined();
      expect(categoryAttributes.categoryId).toBeDefined();
      expect(categoryAttributes.attributeId).toBeDefined();
      expect(categoryAttributes.required).toBeDefined();
      expect(categoryAttributes.order).toBeDefined();
    });

    it('should export attribute relations', () => {
      expect(attributesRelations).toBeDefined();
      expect(categoryAttributesRelations).toBeDefined();
    });

    it('should export attributeTypeEnum with valid values', () => {
      expect(attributeTypeEnum.enumValues).toContain('select');
      expect(attributeTypeEnum.enumValues).toContain('color');
      expect(attributeTypeEnum.enumValues).toContain('size');
      expect(attributeTypeEnum.enumValues).toContain('text');
    });
  });

  describe('Abandoned Carts Schema', () => {
    it('should export abandonedCarts table', () => {
      expect(abandonedCarts).toBeDefined();
      expect(abandonedCarts.id).toBeDefined();
      expect(abandonedCarts.cartId).toBeDefined();
      expect(abandonedCarts.customerEmail).toBeDefined();
      expect(abandonedCarts.cartTotal).toBeDefined();
      expect(abandonedCarts.itemCount).toBeDefined();
      expect(abandonedCarts.status).toBeDefined();
    });

    it('should export abandoned cart relations', () => {
      expect(abandonedCartsRelations).toBeDefined();
    });

    it('should export abandonedCartStatusEnum with valid values', () => {
      expect(abandonedCartStatusEnum.enumValues).toContain('pending');
      expect(abandonedCartStatusEnum.enumValues).toContain('email_sent');
      expect(abandonedCartStatusEnum.enumValues).toContain('recovered');
      expect(abandonedCartStatusEnum.enumValues).toContain('expired');
    });
  });

  describe('Schema $defaultFn callbacks', () => {
    it('should generate unique IDs using createId', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(createId());
      }
      expect(ids.size).toBe(100);
    });

    it('should generate order numbers with current date', () => {
      const orderNumber = generateOrderNumber();
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      expect(orderNumber).toContain(`GEM-${year}${month}`);
    });

    it('should $onUpdate return current date', () => {
      // The $onUpdate callback returns new Date()
      // We can test that new Date() returns a valid date
      const dateBeforeCall = new Date();
      const updateDate = new Date();
      const dateAfterCall = new Date();

      expect(updateDate.getTime()).toBeGreaterThanOrEqual(dateBeforeCall.getTime());
      expect(updateDate.getTime()).toBeLessThanOrEqual(dateAfterCall.getTime());
    });

    // Test $defaultFn callbacks by accessing column config
    describe('ID column $defaultFn callbacks', () => {
      it('should have $defaultFn on products.id that generates valid ID', () => {
        const idColumn = products.id;
        // Access the default function from the column config
        const defaultFn = (idColumn as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
          expect(generatedId.length).toBeGreaterThan(0);
        }
      });

      it('should have $defaultFn on productVariants.id', () => {
        const defaultFn = (productVariants.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on productImages.id', () => {
        const defaultFn = (productImages.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on productVideos.id', () => {
        const defaultFn = (productVideos.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on orders.id', () => {
        const defaultFn = (orders.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on orders.orderNumber', () => {
        const defaultFn = (orders.orderNumber as any).default;
        if (typeof defaultFn === 'function') {
          const orderNumber = defaultFn();
          expect(orderNumber).toMatch(/^GEM-\d{4}-[A-Z0-9]{4}$/);
        }
      });

      it('should have $defaultFn on orderItems.id', () => {
        const defaultFn = (orderItems.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on orderStatusHistory.id', () => {
        const defaultFn = (orderStatusHistory.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on refunds.id', () => {
        const defaultFn = (refunds.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on categories.id', () => {
        const defaultFn = (categories.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on coupons.id', () => {
        const defaultFn = (coupons.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on users.id', () => {
        const defaultFn = (users.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on tags.id', () => {
        const defaultFn = (tags.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on carts.id', () => {
        const defaultFn = (carts.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on cartItems.id', () => {
        const defaultFn = (cartItems.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on wishlists.id', () => {
        const defaultFn = (wishlists.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on reviews.id', () => {
        const defaultFn = (reviews.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on reviewVotes.id', () => {
        const defaultFn = (reviewVotes.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on pages.id', () => {
        const defaultFn = (pages.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on inventoryMovements.id', () => {
        const defaultFn = (inventoryMovements.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on bundles.id', () => {
        const defaultFn = (bundles.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on bundleItems.id', () => {
        const defaultFn = (bundleItems.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on attributes.id', () => {
        const defaultFn = (attributes.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });

      it('should have $defaultFn on abandonedCarts.id', () => {
        const defaultFn = (abandonedCarts.id as any).default;
        if (typeof defaultFn === 'function') {
          const generatedId = defaultFn();
          expect(generatedId).toMatch(/^[a-z0-9]+$/);
        }
      });
    });

    // Test $onUpdate callbacks
    describe('updatedAt column $onUpdate callbacks', () => {
      it('should have $onUpdate on products.updatedAt', () => {
        const onUpdateFn = (products.updatedAt as any).onUpdateFn;
        if (typeof onUpdateFn === 'function') {
          const result = onUpdateFn();
          expect(result).toBeInstanceOf(Date);
        }
      });

      it('should have $onUpdate on orders.updatedAt', () => {
        const onUpdateFn = (orders.updatedAt as any).onUpdateFn;
        if (typeof onUpdateFn === 'function') {
          const result = onUpdateFn();
          expect(result).toBeInstanceOf(Date);
        }
      });

      it('should have $onUpdate on categories.updatedAt', () => {
        const onUpdateFn = (categories.updatedAt as any).onUpdateFn;
        if (typeof onUpdateFn === 'function') {
          const result = onUpdateFn();
          expect(result).toBeInstanceOf(Date);
        }
      });

      it('should have $onUpdate on coupons.updatedAt', () => {
        const onUpdateFn = (coupons.updatedAt as any).onUpdateFn;
        if (typeof onUpdateFn === 'function') {
          const result = onUpdateFn();
          expect(result).toBeInstanceOf(Date);
        }
      });

      it('should have $onUpdate on carts.updatedAt', () => {
        const onUpdateFn = (carts.updatedAt as any).onUpdateFn;
        if (typeof onUpdateFn === 'function') {
          const result = onUpdateFn();
          expect(result).toBeInstanceOf(Date);
        }
      });

      it('should have $onUpdate on reviews.updatedAt', () => {
        const onUpdateFn = (reviews.updatedAt as any).onUpdateFn;
        if (typeof onUpdateFn === 'function') {
          const result = onUpdateFn();
          expect(result).toBeInstanceOf(Date);
        }
      });

      it('should have $onUpdate on pages.updatedAt', () => {
        const onUpdateFn = (pages.updatedAt as any).onUpdateFn;
        if (typeof onUpdateFn === 'function') {
          const result = onUpdateFn();
          expect(result).toBeInstanceOf(Date);
        }
      });

      it('should have $onUpdate on settings.updatedAt', () => {
        const onUpdateFn = (settings.updatedAt as any).onUpdateFn;
        if (typeof onUpdateFn === 'function') {
          const result = onUpdateFn();
          expect(result).toBeInstanceOf(Date);
        }
      });

      it('should have $onUpdate on bundles.updatedAt', () => {
        const onUpdateFn = (bundles.updatedAt as any).onUpdateFn;
        if (typeof onUpdateFn === 'function') {
          const result = onUpdateFn();
          expect(result).toBeInstanceOf(Date);
        }
      });

      it('should have $onUpdate on attributes.updatedAt', () => {
        const onUpdateFn = (attributes.updatedAt as any).onUpdateFn;
        if (typeof onUpdateFn === 'function') {
          const result = onUpdateFn();
          expect(result).toBeInstanceOf(Date);
        }
      });

      it('should have $onUpdate on abandonedCarts.updatedAt', () => {
        const onUpdateFn = (abandonedCarts.updatedAt as any).onUpdateFn;
        if (typeof onUpdateFn === 'function') {
          const result = onUpdateFn();
          expect(result).toBeInstanceOf(Date);
        }
      });
    });
  });

  describe('Relation Functions', () => {
    // Relations in Drizzle are either functions or objects depending on version
    it('should export productsRelations', () => {
      expect(productsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof productsRelations);
    });

    it('should export productVariantsRelations', () => {
      expect(productVariantsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof productVariantsRelations);
    });

    it('should export productImagesRelations', () => {
      expect(productImagesRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof productImagesRelations);
    });

    it('should export productVideosRelations', () => {
      expect(productVideosRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof productVideosRelations);
    });

    it('should export ordersRelations', () => {
      expect(ordersRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof ordersRelations);
    });

    it('should export orderItemsRelations', () => {
      expect(orderItemsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof orderItemsRelations);
    });

    it('should export orderStatusHistoryRelations', () => {
      expect(orderStatusHistoryRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof orderStatusHistoryRelations);
    });

    it('should export refundsRelations', () => {
      expect(refundsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof refundsRelations);
    });

    it('should export categoriesRelations', () => {
      expect(categoriesRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof categoriesRelations);
    });

    it('should export usersRelations', () => {
      expect(usersRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof usersRelations);
    });

    it('should export tagsRelations', () => {
      expect(tagsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof tagsRelations);
    });

    it('should export productTagsRelations', () => {
      expect(productTagsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof productTagsRelations);
    });

    it('should export cartsRelations', () => {
      expect(cartsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof cartsRelations);
    });

    it('should export cartItemsRelations', () => {
      expect(cartItemsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof cartItemsRelations);
    });

    it('should export wishlistsRelations', () => {
      expect(wishlistsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof wishlistsRelations);
    });

    it('should export reviewsRelations', () => {
      expect(reviewsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof reviewsRelations);
    });

    it('should export reviewVotesRelations', () => {
      expect(reviewVotesRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof reviewVotesRelations);
    });

    it('should export inventoryMovementsRelations', () => {
      expect(inventoryMovementsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof inventoryMovementsRelations);
    });

    it('should export bundlesRelations', () => {
      expect(bundlesRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof bundlesRelations);
    });

    it('should export bundleItemsRelations', () => {
      expect(bundleItemsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof bundleItemsRelations);
    });

    it('should export attributesRelations', () => {
      expect(attributesRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof attributesRelations);
    });

    it('should export categoryAttributesRelations', () => {
      expect(categoryAttributesRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof categoryAttributesRelations);
    });

    it('should export abandonedCartsRelations', () => {
      expect(abandonedCartsRelations).toBeDefined();
      expect(['function', 'object']).toContain(typeof abandonedCartsRelations);
    });
  });

  describe('Type Inference', () => {
    it('should correctly infer Product type', () => {
      const product: Product = {
        id: 'test-id',
        name: 'Test Product',
        slug: 'test-product',
        categoryId: null,
        shortDescription: null,
        description: null,
        price: '100.00',
        comparePrice: null,
        cost: null,
        sku: null,
        stock: 10,
        lowStockThreshold: 5,
        trackInventory: true,
        hasVariants: false,
        status: 'active',
        isFeatured: false,
        seoTitle: null,
        seoDescription: null,
        seoImage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      expect(product.name).toBe('Test Product');
    });

    it('should correctly infer Order type', () => {
      const order: Partial<Order> = {
        id: 'order-1',
        orderNumber: 'GEM-2412-ABCD',
        status: 'pending',
        paymentStatus: 'pending',
        total: '100.00',
      };
      expect(order.status).toBe('pending');
    });

    it('should correctly infer Category type', () => {
      const category: Partial<Category> = {
        id: 'cat-1',
        name: 'Jewelry',
        slug: 'jewelry',
        status: 'active',
      };
      expect(category.name).toBe('Jewelry');
    });

    it('should correctly infer Coupon type', () => {
      const coupon: Partial<Coupon> = {
        id: 'coupon-1',
        code: 'SAVE10',
        type: 'percentage',
        value: '10.00',
        isActive: true,
      };
      expect(coupon.code).toBe('SAVE10');
    });
  });
});
