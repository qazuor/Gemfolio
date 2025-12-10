import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from '../src/components/switch';

describe('Switch', () => {
  describe('rendering', () => {
    it('should render switch', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should render with aria-label', () => {
      render(<Switch aria-label="Toggle notifications" />);
      expect(screen.getByLabelText('Toggle notifications')).toBeInTheDocument();
    });
  });

  describe('states', () => {
    it('should be unchecked by default', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).not.toBeChecked();
    });

    it('should be checked when checked prop is true', () => {
      render(<Switch checked />);
      expect(screen.getByRole('switch')).toBeChecked();
    });

    it('should be unchecked when checked prop is false', () => {
      render(<Switch checked={false} />);
      expect(screen.getByRole('switch')).not.toBeChecked();
    });

    it('should toggle when clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(<Switch onCheckedChange={onCheckedChange} />);

      await user.click(screen.getByRole('switch'));
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should call onCheckedChange with false when unchecking', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(<Switch checked onCheckedChange={onCheckedChange} />);

      await user.click(screen.getByRole('switch'));
      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Switch disabled />);
      expect(screen.getByRole('switch')).toBeDisabled();
    });

    it('should not call onCheckedChange when disabled', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(<Switch disabled onCheckedChange={onCheckedChange} />);

      await user.click(screen.getByRole('switch'));
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should have default classes', () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('peer');
      expect(switchEl).toHaveClass('inline-flex');
      expect(switchEl).toHaveClass('h-5');
      expect(switchEl).toHaveClass('w-9');
      expect(switchEl).toHaveClass('shrink-0');
      expect(switchEl).toHaveClass('cursor-pointer');
      expect(switchEl).toHaveClass('rounded-full');
    });

    it('should merge custom className', () => {
      render(<Switch data-testid="switch" className="custom-class" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveClass('custom-class');
      expect(switchEl).toHaveClass('peer');
    });

    it('should have checked state classes when checked', () => {
      render(<Switch data-testid="switch" checked />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveAttribute('data-state', 'checked');
    });

    it('should have unchecked state classes when unchecked', () => {
      render(<Switch data-testid="switch" checked={false} />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    });

    it('should contain thumb element', () => {
      render(<Switch data-testid="switch" />);
      const switchEl = screen.getByTestId('switch');
      const thumb = switchEl.querySelector('span');
      expect(thumb).toBeInTheDocument();
      expect(thumb).toHaveClass('rounded-full');
      expect(thumb).toHaveClass('bg-background');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref', () => {
      const ref = vi.fn();
      render(<Switch ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes', () => {
      render(<Switch data-testid="switch" id="my-switch" />);
      const switchEl = screen.getByTestId('switch');
      expect(switchEl).toHaveAttribute('id', 'my-switch');
    });

    it('should support required attribute', () => {
      render(<Switch data-testid="switch" required />);
      // Radix renders required on an internal input element
      expect(screen.getByTestId('switch')).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('accessibility', () => {
    it('should have proper role', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<Switch data-testid="switch" />);

      await user.tab();
      expect(screen.getByTestId('switch')).toHaveFocus();
    });

    it('should toggle on space key', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(<Switch onCheckedChange={onCheckedChange} />);

      await user.tab();
      await user.keyboard(' ');
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should have aria-checked attribute', () => {
      const { rerender } = render(<Switch data-testid="switch" checked={false} />);
      expect(screen.getByTestId('switch')).toHaveAttribute('aria-checked', 'false');

      rerender(<Switch data-testid="switch" checked />);
      expect(screen.getByTestId('switch')).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('with label', () => {
    it('should work with associated label', () => {
      render(
        <>
          <label htmlFor="switch-id">Enable feature</label>
          <Switch id="switch-id" />
        </>
      );
      expect(screen.getByLabelText('Enable feature')).toBeInTheDocument();
    });
  });
});
