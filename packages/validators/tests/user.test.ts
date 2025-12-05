import { describe, expect, it } from 'vitest';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
  updateUserRoleSchema,
  userFiltersSchema,
  userPaginationSchema,
  userRoleSchema,
} from '../src/user';

describe('User Validators', () => {
  describe('userRoleSchema', () => {
    it('should accept valid roles', () => {
      expect(userRoleSchema.parse('customer')).toBe('customer');
      expect(userRoleSchema.parse('admin')).toBe('admin');
      expect(userRoleSchema.parse('super_admin')).toBe('super_admin');
    });

    it('should reject invalid roles', () => {
      expect(() => userRoleSchema.parse('invalid')).toThrow();
      expect(() => userRoleSchema.parse('')).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should accept valid login', () => {
      const result = loginSchema.parse({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result.email).toBe('test@example.com');
      expect(result.password).toBe('password123');
    });

    it('should reject invalid email', () => {
      expect(() => loginSchema.parse({ email: 'invalid', password: 'password' })).toThrow();
    });

    it('should reject empty password', () => {
      expect(() => loginSchema.parse({ email: 'test@example.com', password: '' })).toThrow();
    });
  });

  describe('registerSchema', () => {
    const validRegister = {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    };

    it('should accept valid registration', () => {
      const result = registerSchema.parse(validRegister);
      expect(result.name).toBe('Juan Pérez');
      expect(result.email).toBe('juan@example.com');
    });

    it('should reject empty name', () => {
      expect(() => registerSchema.parse({ ...validRegister, name: '' })).toThrow();
    });

    it('should reject name exceeding max length', () => {
      const longName = 'a'.repeat(256);
      expect(() => registerSchema.parse({ ...validRegister, name: longName })).toThrow();
    });

    it('should reject invalid email', () => {
      expect(() => registerSchema.parse({ ...validRegister, email: 'invalid' })).toThrow();
    });

    it('should reject password shorter than 8 characters', () => {
      expect(() =>
        registerSchema.parse({
          ...validRegister,
          password: 'Pass1',
          confirmPassword: 'Pass1',
        })
      ).toThrow();
    });

    it('should reject password without uppercase', () => {
      expect(() =>
        registerSchema.parse({
          ...validRegister,
          password: 'password123',
          confirmPassword: 'password123',
        })
      ).toThrow();
    });

    it('should reject password without lowercase', () => {
      expect(() =>
        registerSchema.parse({
          ...validRegister,
          password: 'PASSWORD123',
          confirmPassword: 'PASSWORD123',
        })
      ).toThrow();
    });

    it('should reject password without number', () => {
      expect(() =>
        registerSchema.parse({
          ...validRegister,
          password: 'Passwordabc',
          confirmPassword: 'Passwordabc',
        })
      ).toThrow();
    });

    it('should reject mismatched passwords', () => {
      expect(() =>
        registerSchema.parse({
          ...validRegister,
          confirmPassword: 'DifferentPass1',
        })
      ).toThrow();
    });
  });

  describe('updateProfileSchema', () => {
    it('should accept valid profile update', () => {
      const result = updateProfileSchema.parse({ name: 'New Name' });
      expect(result.name).toBe('New Name');
    });

    it('should accept profile update with image', () => {
      const result = updateProfileSchema.parse({
        name: 'New Name',
        image: 'https://example.com/avatar.jpg',
      });
      expect(result.image).toBe('https://example.com/avatar.jpg');
    });

    it('should accept null image', () => {
      const result = updateProfileSchema.parse({ image: null });
      expect(result.image).toBeNull();
    });

    it('should accept empty object', () => {
      const result = updateProfileSchema.parse({});
      expect(result).toEqual({});
    });

    it('should reject invalid image URL', () => {
      expect(() => updateProfileSchema.parse({ image: 'not-a-url' })).toThrow();
    });

    it('should reject empty name', () => {
      expect(() => updateProfileSchema.parse({ name: '' })).toThrow();
    });
  });

  describe('changePasswordSchema', () => {
    const validChange = {
      currentPassword: 'OldPassword1',
      newPassword: 'NewPassword1',
      confirmPassword: 'NewPassword1',
    };

    it('should accept valid password change', () => {
      const result = changePasswordSchema.parse(validChange);
      expect(result.currentPassword).toBe('OldPassword1');
      expect(result.newPassword).toBe('NewPassword1');
    });

    it('should reject empty current password', () => {
      expect(() => changePasswordSchema.parse({ ...validChange, currentPassword: '' })).toThrow();
    });

    it('should reject weak new password', () => {
      expect(() =>
        changePasswordSchema.parse({
          ...validChange,
          newPassword: 'weak',
          confirmPassword: 'weak',
        })
      ).toThrow();
    });

    it('should reject mismatched passwords', () => {
      expect(() =>
        changePasswordSchema.parse({
          ...validChange,
          confirmPassword: 'DifferentPass1',
        })
      ).toThrow();
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should accept valid email', () => {
      const result = forgotPasswordSchema.parse({ email: 'test@example.com' });
      expect(result.email).toBe('test@example.com');
    });

    it('should reject invalid email', () => {
      expect(() => forgotPasswordSchema.parse({ email: 'invalid' })).toThrow();
    });
  });

  describe('resetPasswordSchema', () => {
    const validReset = {
      token: 'reset-token-123',
      password: 'NewPassword1',
      confirmPassword: 'NewPassword1',
    };

    it('should accept valid password reset', () => {
      const result = resetPasswordSchema.parse(validReset);
      expect(result.token).toBe('reset-token-123');
      expect(result.password).toBe('NewPassword1');
    });

    it('should reject empty token', () => {
      expect(() => resetPasswordSchema.parse({ ...validReset, token: '' })).toThrow();
    });

    it('should reject weak password', () => {
      expect(() =>
        resetPasswordSchema.parse({
          ...validReset,
          password: 'weak',
          confirmPassword: 'weak',
        })
      ).toThrow();
    });

    it('should reject mismatched passwords', () => {
      expect(() =>
        resetPasswordSchema.parse({
          ...validReset,
          confirmPassword: 'DifferentPass1',
        })
      ).toThrow();
    });
  });

  describe('updateUserRoleSchema', () => {
    it('should accept valid role update', () => {
      const result = updateUserRoleSchema.parse({ role: 'admin' });
      expect(result.role).toBe('admin');
    });

    it('should reject invalid role', () => {
      expect(() => updateUserRoleSchema.parse({ role: 'invalid' })).toThrow();
    });
  });

  describe('userFiltersSchema', () => {
    it('should accept valid filters', () => {
      const filters = {
        role: 'admin',
        search: 'juan',
        hasOrders: true,
      };
      const result = userFiltersSchema.parse(filters);
      expect(result).toEqual(filters);
    });

    it('should accept empty filters', () => {
      const result = userFiltersSchema.parse({});
      expect(result).toEqual({});
    });

    it('should reject invalid role', () => {
      expect(() => userFiltersSchema.parse({ role: 'invalid' })).toThrow();
    });
  });

  describe('userPaginationSchema', () => {
    it('should apply defaults', () => {
      const result = userPaginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe('createdAt');
      expect(result.sortOrder).toBe('desc');
    });

    it('should accept valid pagination', () => {
      const pagination = {
        page: 2,
        limit: 50,
        sortBy: 'name',
        sortOrder: 'asc',
      };
      const result = userPaginationSchema.parse(pagination);
      expect(result).toEqual(pagination);
    });

    it('should reject page less than 1', () => {
      expect(() => userPaginationSchema.parse({ page: 0 })).toThrow();
    });

    it('should reject limit greater than 100', () => {
      expect(() => userPaginationSchema.parse({ limit: 101 })).toThrow();
    });

    it('should reject invalid sortBy', () => {
      expect(() => userPaginationSchema.parse({ sortBy: 'invalid' })).toThrow();
    });
  });
});
