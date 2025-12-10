import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../src/components/checkbox';

describe('Checkbox', () => {
  describe('rendering', () => {
    it('should render checkbox', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render with aria-label', () => {
      render(<Checkbox aria-label="Accept terms" />);
      expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
    });
  });

  describe('states', () => {
    it('should be unchecked by default', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('should be checked when checked prop is true', () => {
      render(<Checkbox checked />);
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('should be unchecked when checked prop is false', () => {
      render(<Checkbox checked={false} />);
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('should toggle when clicked', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(<Checkbox onCheckedChange={onCheckedChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it('should call onCheckedChange with false when unchecking', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(<Checkbox checked onCheckedChange={onCheckedChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(onCheckedChange).toHaveBeenCalledWith(false);
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Checkbox disabled />);
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('should not call onCheckedChange when disabled', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(<Checkbox disabled onCheckedChange={onCheckedChange} />);

      await user.click(screen.getByRole('checkbox'));
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should have default classes', () => {
      render(<Checkbox data-testid="checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('peer');
      expect(checkbox).toHaveClass('h-4');
      expect(checkbox).toHaveClass('w-4');
      expect(checkbox).toHaveClass('shrink-0');
      expect(checkbox).toHaveClass('rounded-sm');
      expect(checkbox).toHaveClass('border');
    });

    it('should merge custom className', () => {
      render(<Checkbox data-testid="checkbox" className="custom-class" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveClass('custom-class');
      expect(checkbox).toHaveClass('peer');
    });

    it('should have checked state classes when checked', () => {
      render(<Checkbox data-testid="checkbox" checked />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'checked');
    });

    it('should have unchecked state classes when unchecked', () => {
      render(<Checkbox data-testid="checkbox" checked={false} />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'unchecked');
    });
  });

  describe('indeterminate state', () => {
    it('should support indeterminate state', () => {
      render(<Checkbox data-testid="checkbox" checked="indeterminate" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref', () => {
      const ref = vi.fn();
      render(<Checkbox ref={ref} />);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes', () => {
      render(<Checkbox data-testid="checkbox" id="my-checkbox" />);
      const checkbox = screen.getByTestId('checkbox');
      expect(checkbox).toHaveAttribute('id', 'my-checkbox');
    });

    it('should have required attribute when required', () => {
      render(<Checkbox data-testid="checkbox" required />);
      const checkbox = screen.getByTestId('checkbox');
      // Radix renders required on an internal input element
      expect(checkbox).toHaveAttribute('aria-required', 'true');
    });
  });

  describe('accessibility', () => {
    it('should have proper role', () => {
      render(<Checkbox />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should be focusable', async () => {
      const user = userEvent.setup();
      render(<Checkbox data-testid="checkbox" />);

      await user.tab();
      expect(screen.getByTestId('checkbox')).toHaveFocus();
    });

    it('should toggle on space key', async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(<Checkbox onCheckedChange={onCheckedChange} />);

      await user.tab();
      await user.keyboard(' ');
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });
  });
});
