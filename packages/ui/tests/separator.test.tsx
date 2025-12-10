import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Separator } from '../src/components/separator';

describe('Separator', () => {
  describe('rendering', () => {
    it('should render separator', () => {
      render(<Separator data-testid="separator" />);
      expect(screen.getByTestId('separator')).toBeInTheDocument();
    });
  });

  describe('orientation', () => {
    it('should render horizontal by default', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-[1px]');
      expect(separator).toHaveClass('w-full');
    });

    it('should render horizontal when orientation is horizontal', () => {
      render(<Separator data-testid="separator" orientation="horizontal" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-[1px]');
      expect(separator).toHaveClass('w-full');
    });

    it('should render vertical when orientation is vertical', () => {
      render(<Separator data-testid="separator" orientation="vertical" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-full');
      expect(separator).toHaveClass('w-[1px]');
    });
  });

  describe('styling', () => {
    it('should have default classes', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('shrink-0');
      expect(separator).toHaveClass('bg-border');
    });

    it('should merge custom className', () => {
      render(<Separator data-testid="separator" className="my-4" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('my-4');
      expect(separator).toHaveClass('shrink-0');
    });

    it('should allow overriding background color', () => {
      render(<Separator data-testid="separator" className="bg-red-500" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('bg-red-500');
    });
  });

  describe('decorative prop', () => {
    it('should be decorative by default', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should respect decorative=false', () => {
      render(<Separator data-testid="separator" decorative={false} />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('role', 'separator');
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref', () => {
      const ref = vi.fn();
      render(<Separator ref={ref} />);
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes', () => {
      render(<Separator data-testid="separator" id="my-separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('id', 'my-separator');
    });
  });

  describe('accessibility', () => {
    it('should have data-orientation attribute for horizontal', () => {
      render(<Separator data-testid="separator" orientation="horizontal" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should have data-orientation attribute for vertical', () => {
      render(<Separator data-testid="separator" orientation="vertical" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('usage patterns', () => {
    it('should work as content divider', () => {
      render(
        <div data-testid="container">
          <p>Section 1</p>
          <Separator data-testid="separator" className="my-4" />
          <p>Section 2</p>
        </div>
      );
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByTestId('separator')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });

    it('should work in vertical layout', () => {
      render(
        <div data-testid="container" className="flex h-10">
          <span>Left</span>
          <Separator data-testid="separator" orientation="vertical" className="mx-4" />
          <span>Right</span>
        </div>
      );
      expect(screen.getByText('Left')).toBeInTheDocument();
      expect(screen.getByTestId('separator')).toHaveClass('h-full');
      expect(screen.getByText('Right')).toBeInTheDocument();
    });
  });
});
