import { relations } from 'drizzle-orm';
import { index, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { createId } from '../utils';
import { orders } from './orders';
import { products, productVariants } from './products';
import { users } from './users';

// Inventory movement type enum
export const inventoryMovementTypeEnum = pgEnum('inventory_movement_type', [
  'in', // Stock entry
  'out', // Stock exit (sale)
  'adjustment', // Manual adjustment
  'return', // Return from customer
]);

// Inventory movements table
export const inventoryMovements = pgTable(
  'inventory_movements',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
    variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
    type: inventoryMovementTypeEnum('type').notNull(),
    quantity: integer('quantity').notNull(), // Positive for in, negative for out
    previousStock: integer('previous_stock').notNull(),
    newStock: integer('new_stock').notNull(),
    reason: text('reason'),
    orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),
    createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('inventory_movements_product_id_idx').on(table.productId),
    index('inventory_movements_variant_id_idx').on(table.variantId),
    index('inventory_movements_created_at_idx').on(table.createdAt),
  ]
);

// Relations
export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  product: one(products, {
    fields: [inventoryMovements.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [inventoryMovements.variantId],
    references: [productVariants.id],
  }),
  order: one(orders, {
    fields: [inventoryMovements.orderId],
    references: [orders.id],
  }),
  createdByUser: one(users, {
    fields: [inventoryMovements.createdBy],
    references: [users.id],
  }),
}));

// Types
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert;
