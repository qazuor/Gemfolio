import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['customer', 'admin', 'super_admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});

export type Login = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = z
  .object({
    name: z.string().min(1, 'Nombre es requerido').max(255),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(8, 'Contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Contraseña debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Contraseña debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Contraseña debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type Register = z.infer<typeof registerSchema>;

// Update profile schema
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(255).optional(),
  image: z.string().url('URL de imagen inválida').nullable().optional(),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

// Change password schema
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Contraseña actual es requerida'),
    newPassword: z
      .string()
      .min(8, 'Contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Contraseña debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Contraseña debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Contraseña debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ChangePassword = z.infer<typeof changePasswordSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export type ForgotPassword = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token es requerido'),
    password: z
      .string()
      .min(8, 'Contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Contraseña debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Contraseña debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Contraseña debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type ResetPassword = z.infer<typeof resetPasswordSchema>;

// Update user role schema (admin only)
export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});

export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;

// User filters for querying
export const userFiltersSchema = z.object({
  role: userRoleSchema.optional(),
  search: z.string().optional(),
  hasOrders: z.boolean().optional(),
});

export type UserFilters = z.infer<typeof userFiltersSchema>;

// User pagination
export const userPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type UserPagination = z.infer<typeof userPaginationSchema>;
