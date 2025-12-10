import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Price, priceVariants } from '../src/primitives/price';

describe('Price', () => {
  describe('rendering', () => {
    it('should render price with default formatting', () => {
      render(<Price value={1000} />);
      // ARS formatting uses non-breaking space
      expect(screen.getByText(/\$\s*1\.000/)).toBeInTheDocument();
    });

    it('should render price with decimals when needed', () => {
      render(<Price value={1000.5} />);
      expect(screen.getByText(/1\.000,5/)).toBeInTheDocument();
    });

    it('should render zero price', () => {
      render(<Price value={0} />);
      expect(screen.getByText(/\$\s*0/)).toBeInTheDocument();
    });

    it('should render large numbers correctly', () => {
      render(<Price value={1000000} />);
      expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
    });
  });

  describe('compare price', () => {
    it('should render compare price when provided and higher than value', () => {
      render(<Price value={800} compareValue={1000} />);
      // Both prices should be visible
      expect(screen.getByText(/800/)).toBeInTheDocument();
      expect(screen.getByText(/1\.000/)).toBeInTheDocument();
    });

    it('should apply strikethrough to compare price', () => {
      render(<Price value={800} compareValue={1000} />);
      const comparePrice = screen.getByText(/1\.000/);
      expect(comparePrice).toHaveClass('line-through');
    });

    it('should apply destructive color to discounted price', () => {
      const { container } = render(<Price value={800} compareValue={1000} />);
      const priceSpan = container.querySelector('.text-destructive');
      expect(priceSpan).toBeInTheDocument();
    });

    it('should not show compare price if lower than value', () => {
      render(<Price value={1000} compareValue={800} />);
      // Only the main price should show without strikethrough styling
      const allText = screen.getByText(/1\.000/).closest('span');
      expect(allText?.querySelector('.line-through')).toBeNull();
    });

    it('should not show compare price if equal to value', () => {
      render(<Price value={1000} compareValue={1000} />);
      const strikethrough = document.querySelector('.line-through');
      expect(strikethrough).toBeNull();
    });
  });

  describe('currency formatting', () => {
    it('should format with default ARS currency', () => {
      render(<Price value={1000} />);
      expect(screen.getByText(/\$/)).toBeInTheDocument();
    });

    it('should format with USD currency', () => {
      render(<Price value={1000} currency="USD" locale="en-US" />);
      expect(screen.getByText(/\$1,000/)).toBeInTheDocument();
    });

    it('should format with EUR currency', () => {
      render(<Price value={1000} currency="EUR" locale="de-DE" />);
      expect(screen.getByText(/€|EUR/)).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('should apply default size', () => {
      const { container } = render(<Price value={1000} />);
      const priceSpan = container.querySelector('.text-base');
      expect(priceSpan).toBeInTheDocument();
    });

    it('should apply sm size', () => {
      const { container } = render(<Price value={1000} size="sm" />);
      const priceSpan = container.querySelector('.text-sm');
      expect(priceSpan).toBeInTheDocument();
    });

    it('should apply lg size', () => {
      const { container } = render(<Price value={1000} size="lg" />);
      const priceSpan = container.querySelector('.text-lg');
      expect(priceSpan).toBeInTheDocument();
    });

    it('should apply xl size', () => {
      const { container } = render(<Price value={1000} size="xl" />);
      const priceSpan = container.querySelector('.text-2xl');
      expect(priceSpan).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have inline-flex container', () => {
      const { container } = render(<Price value={1000} />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('inline-flex');
      expect(wrapper).toHaveClass('items-baseline');
    });

    it('should merge custom className', () => {
      const { container } = render(<Price value={1000} className="custom-class" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('custom-class');
      expect(wrapper).toHaveClass('inline-flex');
    });

    it('should apply font-semibold to price', () => {
      const { container } = render(<Price value={1000} />);
      const priceSpan = container.querySelector('.font-semibold');
      expect(priceSpan).toBeInTheDocument();
    });
  });

  describe('priceVariants', () => {
    it('should generate default size classes', () => {
      const classes = priceVariants();
      expect(classes).toContain('text-base');
      expect(classes).toContain('font-semibold');
    });

    it('should generate sm size classes', () => {
      const classes = priceVariants({ size: 'sm' });
      expect(classes).toContain('text-sm');
    });

    it('should generate xl size classes', () => {
      const classes = priceVariants({ size: 'xl' });
      expect(classes).toContain('text-2xl');
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes', () => {
      render(<Price value={1000} data-testid="price-component" id="my-price" />);
      const price = screen.getByTestId('price-component');
      expect(price).toHaveAttribute('id', 'my-price');
    });
  });
});
