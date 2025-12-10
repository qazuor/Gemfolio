import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StockBadge, stockBadgeVariants } from '../src/primitives/stock-badge';

describe('StockBadge', () => {
  describe('rendering', () => {
    it('should render with in stock status', () => {
      render(<StockBadge stock={10} />);
      expect(screen.getByText('En stock')).toBeInTheDocument();
    });

    it('should render with low stock status', () => {
      render(<StockBadge stock={3} />);
      expect(screen.getByText('Pocas unidades')).toBeInTheDocument();
    });

    it('should render with out of stock status', () => {
      render(<StockBadge stock={0} />);
      expect(screen.getByText('Agotado')).toBeInTheDocument();
    });
  });

  describe('stock thresholds', () => {
    it('should show in stock when above threshold', () => {
      render(<StockBadge stock={10} lowStockThreshold={5} />);
      expect(screen.getByText('En stock')).toBeInTheDocument();
    });

    it('should show low stock at threshold', () => {
      render(<StockBadge stock={5} lowStockThreshold={5} />);
      expect(screen.getByText('Pocas unidades')).toBeInTheDocument();
    });

    it('should show low stock below threshold', () => {
      render(<StockBadge stock={3} lowStockThreshold={5} />);
      expect(screen.getByText('Pocas unidades')).toBeInTheDocument();
    });

    it('should show out of stock at zero', () => {
      render(<StockBadge stock={0} lowStockThreshold={5} />);
      expect(screen.getByText('Agotado')).toBeInTheDocument();
    });

    it('should show out of stock for negative values', () => {
      render(<StockBadge stock={-1} lowStockThreshold={5} />);
      expect(screen.getByText('Agotado')).toBeInTheDocument();
    });

    it('should use custom threshold', () => {
      render(<StockBadge stock={8} lowStockThreshold={10} />);
      expect(screen.getByText('Pocas unidades')).toBeInTheDocument();
    });
  });

  describe('custom labels', () => {
    it('should use custom in stock label', () => {
      render(
        <StockBadge
          stock={10}
          labels={{
            inStock: 'Available',
            lowStock: 'Few left',
            outOfStock: 'Sold out',
          }}
        />
      );
      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should use custom low stock label', () => {
      render(
        <StockBadge
          stock={3}
          labels={{
            inStock: 'Available',
            lowStock: 'Few left',
            outOfStock: 'Sold out',
          }}
        />
      );
      expect(screen.getByText('Few left')).toBeInTheDocument();
    });

    it('should use custom out of stock label', () => {
      render(
        <StockBadge
          stock={0}
          labels={{
            inStock: 'Available',
            lowStock: 'Few left',
            outOfStock: 'Sold out',
          }}
        />
      );
      expect(screen.getByText('Sold out')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply in stock styling', () => {
      render(<StockBadge stock={10} />);
      const badge = screen.getByText('En stock');
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-800');
    });

    it('should apply low stock styling', () => {
      render(<StockBadge stock={3} />);
      const badge = screen.getByText('Pocas unidades');
      expect(badge).toHaveClass('bg-yellow-100');
      expect(badge).toHaveClass('text-yellow-800');
    });

    it('should apply out of stock styling', () => {
      render(<StockBadge stock={0} />);
      const badge = screen.getByText('Agotado');
      expect(badge).toHaveClass('bg-red-100');
      expect(badge).toHaveClass('text-red-800');
    });

    it('should have base classes', () => {
      render(<StockBadge stock={10} />);
      const badge = screen.getByText('En stock');
      expect(badge).toHaveClass('inline-flex');
      expect(badge).toHaveClass('items-center');
      expect(badge).toHaveClass('rounded-full');
      expect(badge).toHaveClass('text-xs');
      expect(badge).toHaveClass('font-medium');
    });

    it('should merge custom className', () => {
      render(<StockBadge stock={10} className="custom-class" />);
      const badge = screen.getByText('En stock');
      expect(badge).toHaveClass('custom-class');
      expect(badge).toHaveClass('inline-flex');
    });
  });

  describe('stockBadgeVariants', () => {
    it('should generate in stock classes', () => {
      const classes = stockBadgeVariants({ status: 'inStock' });
      expect(classes).toContain('bg-green-100');
      expect(classes).toContain('text-green-800');
    });

    it('should generate low stock classes', () => {
      const classes = stockBadgeVariants({ status: 'lowStock' });
      expect(classes).toContain('bg-yellow-100');
      expect(classes).toContain('text-yellow-800');
    });

    it('should generate out of stock classes', () => {
      const classes = stockBadgeVariants({ status: 'outOfStock' });
      expect(classes).toContain('bg-red-100');
      expect(classes).toContain('text-red-800');
    });

    it('should default to in stock', () => {
      const classes = stockBadgeVariants();
      expect(classes).toContain('bg-green-100');
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes', () => {
      render(<StockBadge stock={10} data-testid="stock-badge" id="my-badge" />);
      const badge = screen.getByTestId('stock-badge');
      expect(badge).toHaveAttribute('id', 'my-badge');
    });
  });
});
