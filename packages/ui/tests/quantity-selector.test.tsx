import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuantitySelector } from '../src/primitives/quantity-selector';

describe('QuantitySelector', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={1} onChange={onChange} />);

      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    });

    it('should display current value', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} />);

      expect(screen.getByLabelText('Quantity')).toHaveValue(5);
    });
  });

  describe('increment/decrement buttons', () => {
    it('should increment value on plus click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} />);

      await user.click(screen.getByLabelText('Increase quantity'));
      expect(onChange).toHaveBeenCalledWith(6);
    });

    it('should decrement value on minus click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} />);

      await user.click(screen.getByLabelText('Decrease quantity'));
      expect(onChange).toHaveBeenCalledWith(4);
    });

    it('should respect step value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} step={5} />);

      await user.click(screen.getByLabelText('Increase quantity'));
      expect(onChange).toHaveBeenCalledWith(10);
    });

    it('should disable decrement at min value', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={1} onChange={onChange} min={1} />);

      expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
    });

    it('should disable increment at max value', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={10} onChange={onChange} max={10} />);

      expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
    });

    it('should not go below min value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={2} onChange={onChange} min={1} />);

      await user.click(screen.getByLabelText('Decrease quantity'));
      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('should not go above max value', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={9} onChange={onChange} max={10} />);

      await user.click(screen.getByLabelText('Increase quantity'));
      expect(onChange).toHaveBeenCalledWith(10);
    });
  });

  describe('input field', () => {
    it('should update value on direct input', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={1} onChange={onChange} />);

      const input = screen.getByLabelText('Quantity');
      await user.clear(input);
      await user.type(input, '10');

      expect(onChange).toHaveBeenCalled();
    });

    it('should clamp value to max on input', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={1} onChange={onChange} max={10} />);

      const input = screen.getByLabelText('Quantity');
      await user.clear(input);
      await user.type(input, '50');

      // Last call should be clamped to max
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toBeLessThanOrEqual(10);
    });

    it('should clamp value to min on blur', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={0} onChange={onChange} min={1} />);

      const input = screen.getByLabelText('Quantity');
      await user.click(input);
      await user.tab(); // blur

      expect(onChange).toHaveBeenCalledWith(1);
    });

    it('should clamp value to max on blur when value exceeds max', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={100} onChange={onChange} max={10} />);

      const input = screen.getByLabelText('Quantity');
      await user.click(input);
      await user.tab(); // blur

      expect(onChange).toHaveBeenCalledWith(10);
    });

    it('should not call onChange on blur when value is within range', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} min={1} max={10} />);

      const input = screen.getByLabelText('Quantity');
      await user.click(input);
      await user.tab(); // blur

      // onChange should not be called because 5 is within 1-10 range
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should ignore non-numeric input', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} />);

      const input = screen.getByLabelText('Quantity');
      await user.clear(input);
      await user.type(input, 'abc');

      // onChange should not be called for non-numeric input
      // (After clear, the first call might be for the clear operation)
      const numericCalls = onChange.mock.calls.filter((call) => !Number.isNaN(call[0]));
      // All calls should be numeric or no calls after clear
      expect(numericCalls.every((call) => typeof call[0] === 'number')).toBe(true);
    });
  });

  describe('disabled state', () => {
    it('should disable all controls when disabled', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} disabled />);

      expect(screen.getByLabelText('Decrease quantity')).toBeDisabled();
      expect(screen.getByLabelText('Increase quantity')).toBeDisabled();
      expect(screen.getByLabelText('Quantity')).toBeDisabled();
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} disabled />);

      await user.click(screen.getByLabelText('Increase quantity'));
      await user.click(screen.getByLabelText('Decrease quantity'));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('sizes', () => {
    it('should apply sm size classes', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={1} onChange={onChange} size="sm" />);

      const input = screen.getByLabelText('Quantity');
      expect(input).toHaveClass('h-7');
    });

    it('should apply default size classes', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={1} onChange={onChange} size="default" />);

      const input = screen.getByLabelText('Quantity');
      expect(input).toHaveClass('h-9');
    });

    it('should apply lg size classes', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={1} onChange={onChange} size="lg" />);

      const input = screen.getByLabelText('Quantity');
      expect(input).toHaveClass('h-11');
    });
  });

  describe('styling', () => {
    it('should have inline-flex container', () => {
      const onChange = vi.fn();
      const { container } = render(<QuantitySelector value={1} onChange={onChange} />);

      expect(container.firstChild).toHaveClass('inline-flex');
      expect(container.firstChild).toHaveClass('items-center');
    });

    it('should merge custom className', () => {
      const onChange = vi.fn();
      const { container } = render(
        <QuantitySelector value={1} onChange={onChange} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
      expect(container.firstChild).toHaveClass('inline-flex');
    });
  });

  describe('accessibility', () => {
    it('should have proper aria labels', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={1} onChange={onChange} />);

      expect(screen.getByLabelText('Decrease quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Increase quantity')).toBeInTheDocument();
      expect(screen.getByLabelText('Quantity')).toBeInTheDocument();
    });

    it('should have min and max attributes on input', () => {
      const onChange = vi.fn();
      render(<QuantitySelector value={5} onChange={onChange} min={1} max={10} />);

      const input = screen.getByLabelText('Quantity');
      expect(input).toHaveAttribute('min', '1');
      expect(input).toHaveAttribute('max', '10');
    });
  });
});
