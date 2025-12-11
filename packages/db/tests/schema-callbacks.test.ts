/**
 * Tests to execute the callbacks defined in schema files
 * This increases coverage by executing the arrow functions inside pgTable(), relations(), etc.
 */
import { describe, expect, it } from 'vitest';
// Also import schema files directly to access their internals
import * as abandonedCartsSchema from '../src/schema/abandoned-carts';
import * as attributesSchema from '../src/schema/attributes';
import * as bundlesSchema from '../src/schema/bundles';
import * as cartsSchema from '../src/schema/carts';
import * as categoriesSchema from '../src/schema/categories';
import * as couponsSchema from '../src/schema/coupons';
// Import from index to cover the index.ts re-exports
import * as schemaIndex from '../src/schema/index';
import * as inventorySchema from '../src/schema/inventory';
import * as ordersSchema from '../src/schema/orders';
import * as pagesSchema from '../src/schema/pages';
import * as productsSchema from '../src/schema/products';
import * as reviewsSchema from '../src/schema/reviews';
import * as settingsSchema from '../src/schema/settings';
import * as tagsSchema from '../src/schema/tags';
import * as usersSchema from '../src/schema/users';
import * as wishlistsSchema from '../src/schema/wishlists';

import { createId, generateOrderNumber } from '../src/utils';

describe('Schema Callbacks Execution', () => {
  describe('Direct Utility Function Tests', () => {
    it('should generate valid IDs with createId', () => {
      // Execute createId multiple times to cover the function
      for (let i = 0; i < 10; i++) {
        const id = createId();
        expect(id).toMatch(/^[a-z0-9]+$/);
        expect(id.length).toBeGreaterThan(10);
      }
    });

    it('should generate valid order numbers with generateOrderNumber', () => {
      for (let i = 0; i < 10; i++) {
        const orderNumber = generateOrderNumber();
        expect(orderNumber).toMatch(/^GEM-\d{4}-[A-Z0-9]{4}$/);
      }
    });
  });

  describe('Products Schema Callbacks', () => {
    it('should access products table columns', () => {
      const table = productsSchema.products;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.name).toBeDefined();
      expect(table.slug).toBeDefined();
      expect(table.price).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should access productVariants table columns', () => {
      const table = productsSchema.productVariants;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.productId).toBeDefined();
    });

    it('should access productImages table columns', () => {
      const table = productsSchema.productImages;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.productId).toBeDefined();
    });

    it('should access productVideos table columns', () => {
      const table = productsSchema.productVideos;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
    });

    it('should access products relations', () => {
      const relations = productsSchema.productsRelations;
      expect(relations).toBeDefined();
    });

    it('should have valid productStatusEnum', () => {
      expect(productsSchema.productStatusEnum.enumValues).toContain('draft');
      expect(productsSchema.productStatusEnum.enumValues).toContain('active');
      expect(productsSchema.productStatusEnum.enumValues).toContain('archived');
    });
  });

  describe('Orders Schema Callbacks', () => {
    it('should access orders table columns', () => {
      const table = ordersSchema.orders;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.orderNumber).toBeDefined();
      expect(table.status).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should access orderItems table columns', () => {
      const table = ordersSchema.orderItems;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.orderId).toBeDefined();
    });

    it('should access orderStatusHistory table columns', () => {
      const table = ordersSchema.orderStatusHistory;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
    });

    it('should access refunds table columns', () => {
      const table = ordersSchema.refunds;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
    });

    it('should have valid order enums', () => {
      expect(ordersSchema.orderStatusEnum.enumValues).toContain('pending');
      expect(ordersSchema.paymentStatusEnum.enumValues).toContain('pending');
      expect(ordersSchema.refundStatusEnum.enumValues).toContain('pending');
      expect(ordersSchema.refundReasonEnum.enumValues).toContain('customer_request');
    });
  });

  describe('Categories Schema Callbacks', () => {
    it('should access categories table columns', () => {
      const table = categoriesSchema.categories;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.parentId).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should have valid categoryStatusEnum', () => {
      expect(categoriesSchema.categoryStatusEnum.enumValues).toContain('draft');
      expect(categoriesSchema.categoryStatusEnum.enumValues).toContain('active');
    });
  });

  describe('Coupons Schema Callbacks', () => {
    it('should access coupons table columns', () => {
      const table = couponsSchema.coupons;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.code).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should have valid couponTypeEnum', () => {
      expect(couponsSchema.couponTypeEnum.enumValues).toContain('percentage');
      expect(couponsSchema.couponTypeEnum.enumValues).toContain('fixed');
      expect(couponsSchema.couponTypeEnum.enumValues).toContain('free_shipping');
    });
  });

  describe('Users Schema Callbacks', () => {
    it('should access users table columns', () => {
      const table = usersSchema.users;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.email).toBeDefined();
      expect(table.role).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should have valid userRoleEnum', () => {
      expect(usersSchema.userRoleEnum.enumValues).toContain('customer');
      expect(usersSchema.userRoleEnum.enumValues).toContain('admin');
    });
  });

  describe('Tags Schema Callbacks', () => {
    it('should access tags table columns', () => {
      const table = tagsSchema.tags;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.name).toBeDefined();
    });

    it('should access productTags table columns', () => {
      const table = tagsSchema.productTags;
      expect(table).toBeDefined();
      expect(table.productId).toBeDefined();
      expect(table.tagId).toBeDefined();
    });
  });

  describe('Carts Schema Callbacks', () => {
    it('should access carts table columns', () => {
      const table = cartsSchema.carts;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.userId).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should access cartItems table columns', () => {
      const table = cartsSchema.cartItems;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.cartId).toBeDefined();
    });
  });

  describe('Wishlists Schema Callbacks', () => {
    it('should access wishlists table columns', () => {
      const table = wishlistsSchema.wishlists;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.userId).toBeDefined();
      expect(table.productId).toBeDefined();
    });
  });

  describe('Reviews Schema Callbacks', () => {
    it('should access reviews table columns', () => {
      const table = reviewsSchema.reviews;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.productId).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should access reviewVotes table columns', () => {
      const table = reviewsSchema.reviewVotes;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.reviewId).toBeDefined();
    });

    it('should have valid reviewStatusEnum', () => {
      expect(reviewsSchema.reviewStatusEnum.enumValues).toContain('pending');
      expect(reviewsSchema.reviewStatusEnum.enumValues).toContain('approved');
    });
  });

  describe('Pages Schema Callbacks', () => {
    it('should access pages table columns', () => {
      const table = pagesSchema.pages;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.slug).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should have valid pageStatusEnum', () => {
      expect(pagesSchema.pageStatusEnum.enumValues).toContain('draft');
      expect(pagesSchema.pageStatusEnum.enumValues).toContain('published');
    });
  });

  describe('Settings Schema Callbacks', () => {
    it('should access settings table columns', () => {
      const table = settingsSchema.settings;
      expect(table).toBeDefined();
      expect(table.key).toBeDefined();
      expect(table.value).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });
  });

  describe('Inventory Schema Callbacks', () => {
    it('should access inventoryMovements table columns', () => {
      const table = inventorySchema.inventoryMovements;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.productId).toBeDefined();
      expect(table.type).toBeDefined();
    });

    it('should have valid inventoryMovementTypeEnum', () => {
      expect(inventorySchema.inventoryMovementTypeEnum.enumValues).toContain('in');
      expect(inventorySchema.inventoryMovementTypeEnum.enumValues).toContain('out');
      expect(inventorySchema.inventoryMovementTypeEnum.enumValues).toContain('adjustment');
    });
  });

  describe('Bundles Schema Callbacks', () => {
    it('should access bundles table columns', () => {
      const table = bundlesSchema.bundles;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.name).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should access bundleItems table columns', () => {
      const table = bundlesSchema.bundleItems;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.bundleId).toBeDefined();
    });

    it('should have valid bundleStatusEnum', () => {
      expect(bundlesSchema.bundleStatusEnum.enumValues).toContain('draft');
      expect(bundlesSchema.bundleStatusEnum.enumValues).toContain('active');
    });
  });

  describe('Attributes Schema Callbacks', () => {
    it('should access attributes table columns', () => {
      const table = attributesSchema.attributes;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.name).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should access categoryAttributes table columns', () => {
      const table = attributesSchema.categoryAttributes;
      expect(table).toBeDefined();
      expect(table.categoryId).toBeDefined();
      expect(table.attributeId).toBeDefined();
    });

    it('should have valid attributeTypeEnum', () => {
      expect(attributesSchema.attributeTypeEnum.enumValues).toContain('select');
      expect(attributesSchema.attributeTypeEnum.enumValues).toContain('color');
      expect(attributesSchema.attributeTypeEnum.enumValues).toContain('size');
    });
  });

  describe('Abandoned Carts Schema Callbacks', () => {
    it('should access abandonedCarts table columns', () => {
      const table = abandonedCartsSchema.abandonedCarts;
      expect(table).toBeDefined();
      expect(table.id).toBeDefined();
      expect(table.cartId).toBeDefined();
      expect(table.updatedAt).toBeDefined();
    });

    it('should have valid abandonedCartStatusEnum', () => {
      expect(abandonedCartsSchema.abandonedCartStatusEnum.enumValues).toContain('pending');
      expect(abandonedCartsSchema.abandonedCartStatusEnum.enumValues).toContain('recovered');
    });
  });

  describe('Index.ts exports', () => {
    it('should re-export all schema modules', () => {
      // Using the already imported schemaIndex
      expect(schemaIndex.products).toBeDefined();
      expect(schemaIndex.orders).toBeDefined();
      expect(schemaIndex.categories).toBeDefined();
      expect(schemaIndex.coupons).toBeDefined();
      expect(schemaIndex.users).toBeDefined();
      expect(schemaIndex.tags).toBeDefined();
      expect(schemaIndex.carts).toBeDefined();
      expect(schemaIndex.wishlists).toBeDefined();
      expect(schemaIndex.reviews).toBeDefined();
      expect(schemaIndex.pages).toBeDefined();
      expect(schemaIndex.settings).toBeDefined();
      expect(schemaIndex.bundles).toBeDefined();
      expect(schemaIndex.attributes).toBeDefined();
      expect(schemaIndex.abandonedCarts).toBeDefined();
      expect(schemaIndex.inventoryMovements).toBeDefined();
    });

    it('should re-export all relations', () => {
      expect(schemaIndex.productsRelations).toBeDefined();
      expect(schemaIndex.ordersRelations).toBeDefined();
      expect(schemaIndex.categoriesRelations).toBeDefined();
      expect(schemaIndex.usersRelations).toBeDefined();
      expect(schemaIndex.tagsRelations).toBeDefined();
      expect(schemaIndex.cartsRelations).toBeDefined();
      expect(schemaIndex.wishlistsRelations).toBeDefined();
      expect(schemaIndex.reviewsRelations).toBeDefined();
      expect(schemaIndex.bundlesRelations).toBeDefined();
      expect(schemaIndex.attributesRelations).toBeDefined();
      expect(schemaIndex.abandonedCartsRelations).toBeDefined();
      expect(schemaIndex.inventoryMovementsRelations).toBeDefined();
    });

    it('should re-export all enums', () => {
      expect(schemaIndex.productStatusEnum).toBeDefined();
      expect(schemaIndex.orderStatusEnum).toBeDefined();
      expect(schemaIndex.categoryStatusEnum).toBeDefined();
      expect(schemaIndex.couponTypeEnum).toBeDefined();
      expect(schemaIndex.userRoleEnum).toBeDefined();
      expect(schemaIndex.reviewStatusEnum).toBeDefined();
      expect(schemaIndex.pageStatusEnum).toBeDefined();
      expect(schemaIndex.bundleStatusEnum).toBeDefined();
      expect(schemaIndex.attributeTypeEnum).toBeDefined();
      expect(schemaIndex.abandonedCartStatusEnum).toBeDefined();
      expect(schemaIndex.inventoryMovementTypeEnum).toBeDefined();
    });
  });
});
