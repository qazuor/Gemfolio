import { toast as sonnerToast } from 'sonner';

type ToastOptions = {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function useToast() {
  const toast = {
    success: (message: string, options?: ToastOptions) => {
      return sonnerToast.success(message, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action
          ? {
              label: options.action.label,
              onClick: options.action.onClick,
            }
          : undefined,
      });
    },
    error: (message: string, options?: ToastOptions) => {
      return sonnerToast.error(message, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action
          ? {
              label: options.action.label,
              onClick: options.action.onClick,
            }
          : undefined,
      });
    },
    warning: (message: string, options?: ToastOptions) => {
      return sonnerToast.warning(message, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action
          ? {
              label: options.action.label,
              onClick: options.action.onClick,
            }
          : undefined,
      });
    },
    info: (message: string, options?: ToastOptions) => {
      return sonnerToast.info(message, {
        description: options?.description,
        duration: options?.duration,
        action: options?.action
          ? {
              label: options.action.label,
              onClick: options.action.onClick,
            }
          : undefined,
      });
    },
    loading: (message: string, options?: ToastOptions) => {
      return sonnerToast.loading(message, {
        description: options?.description,
        duration: options?.duration,
      });
    },
    dismiss: (toastId?: string | number) => {
      return sonnerToast.dismiss(toastId);
    },
    promise: <T>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ) => {
      return sonnerToast.promise(promise, options);
    },
  };

  return { toast };
}

export { useToast as toast };
