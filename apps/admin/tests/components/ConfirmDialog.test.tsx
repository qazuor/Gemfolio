import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from '../../src/components/shared/confirm-dialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
    onConfirm: vi.fn(),
  };

  describe('rendering', () => {
    it('should render when open', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      render(<ConfirmDialog {...defaultProps} open={false} />);
      expect(screen.queryByText('Confirm Action')).not.toBeInTheDocument();
    });

    it('should render title', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    });

    it('should render description', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Are you sure you want to proceed?')).toBeInTheDocument();
    });

    it('should render default button labels', () => {
      render(<ConfirmDialog {...defaultProps} />);
      expect(screen.getByText('Confirmar')).toBeInTheDocument();
      expect(screen.getByText('Cancelar')).toBeInTheDocument();
    });

    it('should render custom button labels', () => {
      render(<ConfirmDialog {...defaultProps} confirmLabel="Delete" cancelLabel="Keep" />);
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Keep')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onConfirm when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

      await user.click(screen.getByText('Confirmar'));
      expect(onConfirm).toHaveBeenCalled();
    });

    it('should call onOpenChange(false) when confirm button is clicked', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);

      await user.click(screen.getByText('Confirmar'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should call onOpenChange when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);

      await user.click(screen.getByText('Cancelar'));
      expect(onOpenChange).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show loading text when isLoading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />);
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('should disable buttons when isLoading', () => {
      render(<ConfirmDialog {...defaultProps} isLoading />);
      expect(screen.getByText('Cargando...')).toBeDisabled();
      expect(screen.getByText('Cancelar')).toBeDisabled();
    });
  });

  describe('variants', () => {
    it('should apply destructive variant styling', () => {
      render(<ConfirmDialog {...defaultProps} variant="destructive" />);
      const confirmButton = screen.getByText('Confirmar');
      expect(confirmButton).toHaveClass('bg-destructive');
    });

    it('should not apply destructive styling for default variant', () => {
      render(<ConfirmDialog {...defaultProps} variant="default" />);
      const confirmButton = screen.getByText('Confirmar');
      expect(confirmButton).not.toHaveClass('bg-destructive');
    });
  });

  describe('delete confirmation example', () => {
    it('should render delete confirmation dialog', () => {
      render(
        <ConfirmDialog
          open={true}
          onOpenChange={vi.fn()}
          title="Delete Product"
          description="This action cannot be undone. This will permanently delete the product."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          variant="destructive"
          onConfirm={vi.fn()}
        />
      );

      expect(screen.getByText('Delete Product')).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
      expect(screen.getByText('Delete')).toHaveClass('bg-destructive');
    });
  });
});
