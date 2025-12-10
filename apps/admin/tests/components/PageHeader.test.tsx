import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageHeader } from '../../src/components/shared/page-header';

describe('PageHeader', () => {
  describe('rendering', () => {
    it('should render title', () => {
      render(<PageHeader title="Dashboard" />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should render title as h1', () => {
      render(<PageHeader title="Products" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Products');
    });

    it('should render description when provided', () => {
      render(<PageHeader title="Products" description="Manage your product catalog" />);
      expect(screen.getByText('Manage your product catalog')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const { container } = render(<PageHeader title="Products" />);
      expect(container.querySelector('.text-muted-foreground')).not.toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should render actions when provided', () => {
      render(<PageHeader title="Products" actions={<button type="button">Add Product</button>} />);
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    it('should render multiple actions', () => {
      render(
        <PageHeader
          title="Products"
          actions={
            <>
              <button type="button">Export</button>
              <button type="button">Add Product</button>
            </>
          }
        />
      );
      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });
  });

  describe('children', () => {
    it('should render children when provided', () => {
      render(
        <PageHeader title="Products">
          <div data-testid="filters">Filters content</div>
        </PageHeader>
      );
      expect(screen.getByTestId('filters')).toBeInTheDocument();
    });

    it('should not render children container when no children', () => {
      const { container } = render(<PageHeader title="Products" />);
      expect(container.querySelector('.mt-4')).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have proper title styling', () => {
      render(<PageHeader title="Test" />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-2xl');
      expect(heading).toHaveClass('font-bold');
    });

    it('should have proper description styling', () => {
      render(<PageHeader title="Test" description="Description text" />);
      const description = screen.getByText('Description text');
      expect(description).toHaveClass('text-sm');
      expect(description).toHaveClass('text-muted-foreground');
    });

    it('should have flex container', () => {
      const { container } = render(<PageHeader title="Test" />);
      const flexContainer = container.querySelector('.flex');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  describe('complete page header', () => {
    it('should render full page header with all props', () => {
      render(
        <PageHeader
          title="Manage Products"
          description="Add, edit, and delete products in your store"
          actions={<button type="button">Add New</button>}
        >
          <input placeholder="Search products..." />
        </PageHeader>
      );

      expect(screen.getByText('Manage Products')).toBeInTheDocument();
      expect(screen.getByText('Add, edit, and delete products in your store')).toBeInTheDocument();
      expect(screen.getByText('Add New')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    });
  });
});
