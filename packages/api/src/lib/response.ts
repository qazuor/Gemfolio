import type { Context } from 'hono';

/**
 * Standard API response helpers
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Success response helper
 */
export function success<T>(c: Context, data: T, status: 200 | 201 = 200) {
  return c.json<ApiResponse<T>>(
    {
      success: true,
      data,
    },
    status
  );
}

/**
 * Paginated success response helper
 */
export function paginated<T>(
  c: Context,
  data: T[],
  meta: { page: number; limit: number; total: number }
) {
  return c.json<ApiResponse<T[]>>({
    success: true,
    data,
    meta: {
      ...meta,
      totalPages: Math.ceil(meta.total / meta.limit),
    },
  });
}

/**
 * Error response helper
 */
export function error(
  c: Context,
  code: string,
  message: string,
  status: 400 | 401 | 403 | 404 | 409 | 422 | 500 = 400,
  details?: unknown
) {
  return c.json<ApiResponse>(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
    },
    status
  );
}

/**
 * Common error responses
 */
export const errors = {
  badRequest: (c: Context, message = 'Solicitud inválida', details?: unknown) =>
    error(c, 'BAD_REQUEST', message, 400, details),

  unauthorized: (c: Context, message = 'No autorizado') => error(c, 'UNAUTHORIZED', message, 401),

  forbidden: (c: Context, message = 'Acceso denegado') => error(c, 'FORBIDDEN', message, 403),

  notFound: (c: Context, resource = 'Recurso') =>
    error(c, 'NOT_FOUND', `${resource} no encontrado`, 404),

  conflict: (c: Context, message = 'Conflicto con el estado actual') =>
    error(c, 'CONFLICT', message, 409),

  validationError: (c: Context, details: unknown) =>
    error(c, 'VALIDATION_ERROR', 'Error de validación', 422, details),

  serverError: (c: Context, message = 'Error interno del servidor') =>
    error(c, 'SERVER_ERROR', message, 500),
};
