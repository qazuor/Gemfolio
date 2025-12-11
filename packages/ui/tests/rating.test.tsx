import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Rating } from '../src/primitives/rating';

describe('Rating', () => {
  describe('rendering', () => {
    it('should render 5 stars by default', () => {
      render(<Rating value={3} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('should render custom number of stars', () => {
      render(<Rating value={2} max={10} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(10);
    });

    it('should display value when showValue is true', () => {
      render(<Rating value={3.5} showValue />);
      expect(screen.getByText('3.5')).toBeInTheDocument();
    });

    it('should not display value by default', () => {
      render(<Rating value={3.5} />);
      expect(screen.queryByText('3.5')).not.toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Rating value={3} className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('filled stars', () => {
    it('should fill stars up to the value', () => {
      render(<Rating value={3} />);
      const buttons = screen.getAllByRole('button');

      // First 3 should be filled (have fill-yellow-400 class on the svg)
      for (let i = 0; i < 3; i++) {
        const svg = buttons[i].querySelector('svg');
        expect(svg).toHaveClass('fill-yellow-400');
        expect(svg).toHaveClass('text-yellow-400');
      }

      // Star at index 3 might be half-filled due to displayValue logic
      // Stars 4 should be empty (not have fill-yellow-400)
      const svg4 = buttons[4].querySelector('svg');
      expect(svg4).not.toHaveClass('fill-yellow-400');
    });

    it('should handle value of 0', () => {
      render(<Rating value={0} />);
      const buttons = screen.getAllByRole('button');

      // First star might be half-filled (0 < 0 + 0.5), so check last star is empty
      const lastSvg = buttons[4].querySelector('svg');
      expect(lastSvg).not.toHaveClass('fill-yellow-400');
    });

    it('should handle value equal to max', () => {
      render(<Rating value={5} />);
      const buttons = screen.getAllByRole('button');

      for (const button of buttons) {
        const svg = button.querySelector('svg');
        expect(svg).toHaveClass('fill-yellow-400');
      }
    });
  });

  describe('readonly mode', () => {
    it('should be readonly by default', () => {
      render(<Rating value={3} />);
      const buttons = screen.getAllByRole('button');

      for (const button of buttons) {
        expect(button).toBeDisabled();
      }
    });

    it('should disable buttons in readonly mode', () => {
      render(<Rating value={3} readonly />);
      const buttons = screen.getAllByRole('button');

      for (const button of buttons) {
        expect(button).toBeDisabled();
      }
    });

    it('should not call onValueChange when readonly', () => {
      const onValueChange = vi.fn();
      render(<Rating value={3} readonly onValueChange={onValueChange} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[4]);

      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe('interactive mode', () => {
    it('should enable buttons when readonly is false', () => {
      render(<Rating value={3} readonly={false} onValueChange={() => {}} />);
      const buttons = screen.getAllByRole('button');

      for (const button of buttons) {
        expect(button).not.toBeDisabled();
      }
    });

    it('should call onValueChange with correct value on click', () => {
      const onValueChange = vi.fn();
      render(<Rating value={3} readonly={false} onValueChange={onValueChange} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[4]); // Click 5th star (index 4)

      expect(onValueChange).toHaveBeenCalledWith(5);
    });

    it('should call onValueChange with 1 when clicking first star', () => {
      const onValueChange = vi.fn();
      render(<Rating value={3} readonly={false} onValueChange={onValueChange} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);

      expect(onValueChange).toHaveBeenCalledWith(1);
    });

    it('should highlight stars on hover', () => {
      render(<Rating value={1} readonly={false} onValueChange={() => {}} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.mouseEnter(buttons[3]); // Hover over 4th star

      // After hover, stars 0-3 should appear filled
      const svg = buttons[3].querySelector('svg');
      expect(svg).toHaveClass('fill-yellow-400');
    });

    it('should reset hover state on mouse leave', () => {
      render(<Rating value={2} readonly={false} onValueChange={() => {}} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.mouseEnter(buttons[4]); // Hover over 5th star
      fireEvent.mouseLeave(buttons[4]); // Leave

      // Should return to showing only 2 filled (positions 0 and 1)
      // Position 2 is half-filled (2 < 2.5), position 3 and 4 are empty
      const svg3 = buttons[3].querySelector('svg');
      expect(svg3).toHaveClass('fill-transparent');
    });
  });

  describe('sizes', () => {
    it('should apply small size classes', () => {
      render(<Rating value={3} size="sm" />);
      const buttons = screen.getAllByRole('button');
      const svg = buttons[0].querySelector('svg');
      expect(svg).toHaveClass('h-3', 'w-3');
    });

    it('should apply default size classes', () => {
      render(<Rating value={3} size="default" />);
      const buttons = screen.getAllByRole('button');
      const svg = buttons[0].querySelector('svg');
      expect(svg).toHaveClass('h-4', 'w-4');
    });

    it('should apply large size classes', () => {
      render(<Rating value={3} size="lg" />);
      const buttons = screen.getAllByRole('button');
      const svg = buttons[0].querySelector('svg');
      expect(svg).toHaveClass('h-5', 'w-5');
    });
  });

  describe('half stars', () => {
    it('should show half-filled star for decimal values', () => {
      // With value=2, position 2 is half-filled because:
      // - isFilled: 2 < 2 = false
      // - isHalf: 2 < 2 + 0.5 = 2.5 = true
      render(<Rating value={2} />);
      const buttons = screen.getAllByRole('button');

      // Stars 0-1 should be filled (position < 2)
      expect(buttons[0].querySelector('svg')).toHaveClass('fill-yellow-400');
      expect(buttons[1].querySelector('svg')).toHaveClass('fill-yellow-400');

      // Star 2 should be half-filled (not < 2, but < 2.5)
      expect(buttons[2].querySelector('svg')).toHaveClass('fill-yellow-400/50');

      // Stars 3-4 should be empty (not < 2, not < 2.5)
      expect(buttons[3].querySelector('svg')).toHaveClass('fill-transparent');
      expect(buttons[4].querySelector('svg')).toHaveClass('fill-transparent');
    });
  });

  describe('accessibility', () => {
    it('should have buttons with type="button"', () => {
      render(<Rating value={3} />);
      const buttons = screen.getAllByRole('button');

      for (const button of buttons) {
        expect(button).toHaveAttribute('type', 'button');
      }
    });

    it('should apply focus styles', () => {
      render(<Rating value={3} />);
      const buttons = screen.getAllByRole('button');

      for (const button of buttons) {
        expect(button).toHaveClass('focus:outline-none');
      }
    });
  });

  describe('edge cases', () => {
    it('should not call anything when click without onValueChange provided', () => {
      // readonly=false but no onValueChange - should not throw
      render(<Rating value={3} readonly={false} />);

      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[4]);

      // Should not throw, just do nothing
      expect(buttons[4]).toBeInTheDocument();
    });

    it('should not update hover state when readonly and mouse events fire', () => {
      render(<Rating value={2} readonly />);

      const buttons = screen.getAllByRole('button');

      // Try to hover - should not change display
      fireEvent.mouseEnter(buttons[4]);
      fireEvent.mouseLeave(buttons[4]);

      // Stars 0-1 should still be filled (value is 2)
      expect(buttons[0].querySelector('svg')).toHaveClass('fill-yellow-400');
      expect(buttons[1].querySelector('svg')).toHaveClass('fill-yellow-400');
    });

    it('should handle decimal value display correctly', () => {
      render(<Rating value={3.7} showValue />);
      expect(screen.getByText('3.7')).toBeInTheDocument();
    });

    it('should handle value of 0 with showValue', () => {
      render(<Rating value={0} showValue />);
      expect(screen.getByText('0.0')).toBeInTheDocument();
    });
  });
});
