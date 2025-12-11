import { toast as sonnerToast } from 'sonner';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useToast } from '../src/hooks/use-toast';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(() => 'success-id'),
    error: vi.fn(() => 'error-id'),
    warning: vi.fn(() => 'warning-id'),
    info: vi.fn(() => 'info-id'),
    loading: vi.fn(() => 'loading-id'),
    dismiss: vi.fn(),
    promise: vi.fn(() => 'promise-id'),
  },
}));

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('toast.success', () => {
    it('should call sonnerToast.success with message only', () => {
      const { toast } = useToast();
      const result = toast.success('Success message');

      expect(sonnerToast.success).toHaveBeenCalledWith('Success message', {
        description: undefined,
        duration: undefined,
        action: undefined,
      });
      expect(result).toBe('success-id');
    });

    it('should call sonnerToast.success with all options', () => {
      const { toast } = useToast();
      const onClick = vi.fn();
      const result = toast.success('Success message', {
        description: 'Description',
        duration: 5000,
        action: {
          label: 'Undo',
          onClick,
        },
      });

      expect(sonnerToast.success).toHaveBeenCalledWith('Success message', {
        description: 'Description',
        duration: 5000,
        action: {
          label: 'Undo',
          onClick,
        },
      });
      expect(result).toBe('success-id');
    });
  });

  describe('toast.error', () => {
    it('should call sonnerToast.error with message only', () => {
      const { toast } = useToast();
      const result = toast.error('Error message');

      expect(sonnerToast.error).toHaveBeenCalledWith('Error message', {
        description: undefined,
        duration: undefined,
        action: undefined,
      });
      expect(result).toBe('error-id');
    });

    it('should call sonnerToast.error with all options', () => {
      const { toast } = useToast();
      const onClick = vi.fn();
      const result = toast.error('Error message', {
        description: 'Error description',
        duration: 3000,
        action: {
          label: 'Retry',
          onClick,
        },
      });

      expect(sonnerToast.error).toHaveBeenCalledWith('Error message', {
        description: 'Error description',
        duration: 3000,
        action: {
          label: 'Retry',
          onClick,
        },
      });
      expect(result).toBe('error-id');
    });
  });

  describe('toast.warning', () => {
    it('should call sonnerToast.warning with message only', () => {
      const { toast } = useToast();
      const result = toast.warning('Warning message');

      expect(sonnerToast.warning).toHaveBeenCalledWith('Warning message', {
        description: undefined,
        duration: undefined,
        action: undefined,
      });
      expect(result).toBe('warning-id');
    });

    it('should call sonnerToast.warning with all options', () => {
      const { toast } = useToast();
      const onClick = vi.fn();
      const result = toast.warning('Warning message', {
        description: 'Warning description',
        duration: 4000,
        action: {
          label: 'Dismiss',
          onClick,
        },
      });

      expect(sonnerToast.warning).toHaveBeenCalledWith('Warning message', {
        description: 'Warning description',
        duration: 4000,
        action: {
          label: 'Dismiss',
          onClick,
        },
      });
      expect(result).toBe('warning-id');
    });
  });

  describe('toast.info', () => {
    it('should call sonnerToast.info with message only', () => {
      const { toast } = useToast();
      const result = toast.info('Info message');

      expect(sonnerToast.info).toHaveBeenCalledWith('Info message', {
        description: undefined,
        duration: undefined,
        action: undefined,
      });
      expect(result).toBe('info-id');
    });

    it('should call sonnerToast.info with all options', () => {
      const { toast } = useToast();
      const onClick = vi.fn();
      const result = toast.info('Info message', {
        description: 'Info description',
        duration: 2000,
        action: {
          label: 'Learn more',
          onClick,
        },
      });

      expect(sonnerToast.info).toHaveBeenCalledWith('Info message', {
        description: 'Info description',
        duration: 2000,
        action: {
          label: 'Learn more',
          onClick,
        },
      });
      expect(result).toBe('info-id');
    });
  });

  describe('toast.loading', () => {
    it('should call sonnerToast.loading with message only', () => {
      const { toast } = useToast();
      const result = toast.loading('Loading...');

      expect(sonnerToast.loading).toHaveBeenCalledWith('Loading...', {
        description: undefined,
        duration: undefined,
      });
      expect(result).toBe('loading-id');
    });

    it('should call sonnerToast.loading with options', () => {
      const { toast } = useToast();
      const result = toast.loading('Loading...', {
        description: 'Please wait',
        duration: 10000,
      });

      expect(sonnerToast.loading).toHaveBeenCalledWith('Loading...', {
        description: 'Please wait',
        duration: 10000,
      });
      expect(result).toBe('loading-id');
    });
  });

  describe('toast.dismiss', () => {
    it('should call sonnerToast.dismiss without id', () => {
      const { toast } = useToast();
      toast.dismiss();

      expect(sonnerToast.dismiss).toHaveBeenCalledWith(undefined);
    });

    it('should call sonnerToast.dismiss with string id', () => {
      const { toast } = useToast();
      toast.dismiss('toast-id');

      expect(sonnerToast.dismiss).toHaveBeenCalledWith('toast-id');
    });

    it('should call sonnerToast.dismiss with number id', () => {
      const { toast } = useToast();
      toast.dismiss(123);

      expect(sonnerToast.dismiss).toHaveBeenCalledWith(123);
    });
  });

  describe('toast.promise', () => {
    it('should call sonnerToast.promise with promise and options', async () => {
      const { toast } = useToast();
      const promise = Promise.resolve('data');
      const result = toast.promise(promise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      });

      expect(sonnerToast.promise).toHaveBeenCalledWith(promise, {
        loading: 'Loading...',
        success: 'Success!',
        error: 'Error!',
      });
      expect(result).toBe('promise-id');
    });

    it('should call sonnerToast.promise with function handlers', () => {
      const { toast } = useToast();
      const promise = Promise.resolve({ name: 'Test' });
      const successFn = (data: { name: string }) => `Success: ${data.name}`;
      const errorFn = (err: unknown) => `Error: ${String(err)}`;

      toast.promise(promise, {
        loading: 'Loading...',
        success: successFn,
        error: errorFn,
      });

      expect(sonnerToast.promise).toHaveBeenCalledWith(promise, {
        loading: 'Loading...',
        success: successFn,
        error: errorFn,
      });
    });
  });
});
