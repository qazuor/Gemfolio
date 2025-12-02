import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';

import type { Database } from '../client';
import { orders } from '../schema/orders';
import { type NewUser, type User, users } from '../schema/users';

// ============================================
// TYPES
// ============================================

export type UserRole = 'customer' | 'admin' | 'super_admin';

export type UserFilters = {
  search?: string;
  role?: UserRole;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
};

export type UserWithStats = User & {
  orderCount: number;
  totalSpent: number;
};

export type PaginatedUsers = {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ============================================
// QUERIES
// ============================================

/**
 * Get users with pagination and filters
 */
export async function getUsers(db: Database, filters: UserFilters = {}): Promise<PaginatedUsers> {
  const {
    search,
    role,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortDirection = 'desc',
  } = filters;

  const conditions = [];

  if (search) {
    conditions.push(or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`)));
  }

  if (role) {
    conditions.push(eq(users.role, role));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const totalResult = await db.select({ count: count() }).from(users).where(whereClause);
  const total = totalResult[0]?.count ?? 0;

  // Determine sort column
  const sortColumn = {
    name: users.name,
    email: users.email,
    createdAt: users.createdAt,
  }[sortBy];

  const orderFn = sortDirection === 'asc' ? asc : desc;

  // Get paginated results
  const data = await db
    .select()
    .from(users)
    .where(whereClause)
    .orderBy(orderFn(sortColumn))
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a user by ID
 */
export async function getUserById(db: Database, id: string): Promise<User | null> {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return result ?? null;
}

/**
 * Get a user by email
 */
export async function getUserByEmail(db: Database, email: string): Promise<User | null> {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return result ?? null;
}

/**
 * Get user with order statistics
 */
export async function getUserWithStats(db: Database, id: string): Promise<UserWithStats | null> {
  const user = await getUserById(db, id);
  if (!user) return null;

  const stats = await db
    .select({
      orderCount: count(),
      totalSpent: sql<number>`COALESCE(SUM(${orders.total}::numeric), 0)`,
    })
    .from(orders)
    .where(eq(orders.userId, id));

  return {
    ...user,
    orderCount: stats[0]?.orderCount ?? 0,
    totalSpent: Number(stats[0]?.totalSpent ?? 0),
  };
}

/**
 * Update user role
 */
export async function updateUserRole(
  db: Database,
  id: string,
  role: UserRole
): Promise<User | null> {
  const result = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0] ?? null;
}

/**
 * Update user profile
 */
export async function updateUser(
  db: Database,
  id: string,
  data: Partial<Pick<NewUser, 'name' | 'image'>>
): Promise<User | null> {
  const result = await db
    .update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0] ?? null;
}

/**
 * Delete a user (soft delete or hard delete)
 */
export async function deleteUser(db: Database, id: string): Promise<User | null> {
  const result = await db.delete(users).where(eq(users.id, id)).returning();
  return result[0] ?? null;
}

/**
 * Get all users with a specific role
 */
export async function getUsersByRole(db: Database, role: UserRole): Promise<User[]> {
  return db.select().from(users).where(eq(users.role, role)).orderBy(asc(users.name));
}

/**
 * Get all admin users
 */
export async function getAdminUsers(db: Database): Promise<User[]> {
  return db
    .select()
    .from(users)
    .where(or(eq(users.role, 'admin'), eq(users.role, 'super_admin')))
    .orderBy(asc(users.name));
}

/**
 * Get user order history
 */
export async function getUserOrderHistory(
  db: Database,
  userId: string,
  options: { page?: number; limit?: number } = {}
) {
  const { page = 1, limit = 10 } = options;

  const userOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const totalResult = await db
    .select({ count: count() })
    .from(orders)
    .where(eq(orders.userId, userId));
  const total = totalResult[0]?.count ?? 0;

  return {
    data: userOrders,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Check if email is already registered
 */
export async function isEmailRegistered(db: Database, email: string): Promise<boolean> {
  const user = await getUserByEmail(db, email);
  return user !== null;
}

/**
 * Count users by role
 */
export async function countUsersByRole(db: Database): Promise<Record<UserRole, number>> {
  const result = await db
    .select({
      role: users.role,
      count: count(),
    })
    .from(users)
    .groupBy(users.role);

  const counts: Record<UserRole, number> = {
    customer: 0,
    admin: 0,
    super_admin: 0,
  };

  for (const row of result) {
    counts[row.role] = row.count;
  }

  return counts;
}
