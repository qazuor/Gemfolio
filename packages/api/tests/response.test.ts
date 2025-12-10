import type { Context } from 'hono';
import { describe, expect, it, vi } from 'vitest';
import { error, errors, paginated, success } from '../src/lib/response';

// Mock Context type for testing
type MockContext = {
  json: ReturnType<typeof vi.fn>;
  getResponses: () => { data: unknown; status: number }[];
};

const createMockContext = (): MockContext => {
  const responses: { data: unknown; status: number }[] = [];
  return {
    json: vi.fn((data: unknown, status?: number) => {
      responses.push({ data, status: status || 200 });
      return { data, status: status || 200 };
    }),
    getResponses: () => responses,
  };
};

describe('API Response Helpers', () => {
  describe('success', () => {
    it('should return success response with data', () => {
      const c = createMockContext();
      const data = { id: '1', name: 'Test' };

      success(c as unknown as Context, data);

      expect(c.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
        },
        200
      );
    });

    it('should return 201 for created resources', () => {
      const c = createMockContext();
      const data = { id: '1', name: 'Created' };

      success(c as unknown as Context, data, 201);

      expect(c.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
        },
        201
      );
    });

    it('should handle array data', () => {
      const c = createMockContext();
      const data = [{ id: '1' }, { id: '2' }];

      success(c as unknown as Context, data);

      expect(c.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
        },
        200
      );
    });

    it('should handle null data', () => {
      const c = createMockContext();

      success(c as unknown as Context, null);

      expect(c.json).toHaveBeenCalledWith(
        {
          success: true,
          data: null,
        },
        200
      );
    });
  });

  describe('paginated', () => {
    it('should return paginated response with meta', () => {
      const c = createMockContext();
      const data = [{ id: '1' }, { id: '2' }];
      const meta = { page: 1, limit: 10, total: 50 };

      paginated(c as unknown as Context, data, meta);

      expect(c.json).toHaveBeenCalledWith({
        success: true,
        data,
        meta: {
          page: 1,
          limit: 10,
          total: 50,
          totalPages: 5,
        },
      });
    });

    it('should calculate totalPages correctly', () => {
      const c = createMockContext();
      const data = [{ id: '1' }];
      const meta = { page: 1, limit: 10, total: 25 };

      paginated(c as unknown as Context, data, meta);

      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            totalPages: 3,
          }),
        })
      );
    });

    it('should handle empty data array', () => {
      const c = createMockContext();
      const data: unknown[] = [];
      const meta = { page: 1, limit: 10, total: 0 };

      paginated(c as unknown as Context, data, meta);

      expect(c.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });
    });
  });

  describe('error', () => {
    it('should return error response', () => {
      const c = createMockContext();

      error(c as unknown as Context, 'TEST_ERROR', 'Test error message');

      expect(c.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'TEST_ERROR',
            message: 'Test error message',
          },
        },
        400
      );
    });

    it('should include details when provided', () => {
      const c = createMockContext();
      const details = { field: 'email', issue: 'invalid format' };

      error(c as unknown as Context, 'VALIDATION_ERROR', 'Validation failed', 422, details);

      expect(c.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details,
          },
        },
        422
      );
    });

    it('should support different status codes', () => {
      const c = createMockContext();

      error(c as unknown as Context, 'SERVER_ERROR', 'Internal error', 500);

      expect(c.json).toHaveBeenCalledWith(expect.any(Object), 500);
    });
  });

  describe('errors helpers', () => {
    it('should return bad request error', () => {
      const c = createMockContext();

      errors.badRequest(c as unknown as Context);

      expect(c.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Solicitud inválida',
          },
        },
        400
      );
    });

    it('should return bad request with custom message', () => {
      const c = createMockContext();

      errors.badRequest(c as unknown as Context, 'Invalid input');

      expect(c.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Invalid input',
          },
        },
        400
      );
    });

    it('should return unauthorized error', () => {
      const c = createMockContext();

      errors.unauthorized(c as unknown as Context);

      expect(c.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'No autorizado',
          },
        },
        401
      );
    });

    it('should return forbidden error', () => {
      const c = createMockContext();

      errors.forbidden(c as unknown as Context);

      expect(c.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Acceso denegado',
          },
        },
        403
      );
    });

    it('should return not found error', () => {
      const c = createMockContext();

      errors.notFound(c as unknown as Context, 'Product');

      expect(c.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product no encontrado',
          },
        },
        404
      );
    });

    it('should return conflict error', () => {
      const c = createMockContext();

      errors.conflict(c as unknown as Context, 'Email already exists');

      expect(c.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'CONFLICT',
            message: 'Email already exists',
          },
        },
        409
      );
    });

    it('should return validation error with details', () => {
      const c = createMockContext();
      const details = [{ field: 'email', message: 'Required' }];

      errors.validationError(c as unknown as Context, details);

      expect(c.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Error de validación',
            details,
          },
        },
        422
      );
    });

    it('should return server error', () => {
      const c = createMockContext();

      errors.serverError(c as unknown as Context);

      expect(c.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Error interno del servidor',
          },
        },
        500
      );
    });
  });
});
