import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileText } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyState } from '../../src/components/shared/empty-state';

describe('EmptyState', () => {
  describe('rendering', () => {
    it('should render title', () => {
      render(<EmptyState title="No products found" />);
      expect(screen.getByText('No products found')).toBeInTheDocument();
    });

    it('should render description when provided', () => {
      render(
        <EmptyState title="No products" description="Add your first product to get started" />
      );
      expect(screen.getByText('Add your first product to get started')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const { container } = render(<EmptyState title="No products" />);
      // Only title text should be present
      expect(container.querySelectorAll('p').length).toBe(0);
    });

    it('should render default Package icon', () => {
      const { container } = render(<EmptyState title="Empty" />);
      const iconContainer = container.querySelector('.bg-muted');
      const icon = iconContainer?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should render custom icon when provided', () => {
      const { container } = render(<EmptyState title="No files" icon={FileText} />);
      const iconContainer = container.querySelector('.bg-muted');
      const icon = iconContainer?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('action button', () => {
    it('should render action button when provided', () => {
      const action = {
        label: 'Add Product',
        onClick: vi.fn(),
      };
      render(<EmptyState title="No products" action={action} />);
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    it('should call onClick when action button is clicked', async () => {
      const user = userEvent.setup();
      const action = {
        label: 'Add Product',
        onClick: vi.fn(),
      };
      render(<EmptyState title="No products" action={action} />);

      await user.click(screen.getByText('Add Product'));
      expect(action.onClick).toHaveBeenCalled();
    });

    it('should not render button when action not provided', () => {
      render(<EmptyState title="No products" />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('children', () => {
    it('should render children when provided', () => {
      render(
        <EmptyState title="No data">
          <p data-testid="custom-content">Custom content here</p>
        </EmptyState>
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });

    it('should render both action and children', () => {
      const action = {
        label: 'Primary Action',
        onClick: vi.fn(),
      };
      render(
        <EmptyState title="No data" action={action}>
          <p data-testid="secondary">Secondary content</p>
        </EmptyState>
      );
      expect(screen.getByText('Primary Action')).toBeInTheDocument();
      expect(screen.getByTestId('secondary')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should have centered content', () => {
      const { container } = render(<EmptyState title="Empty" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex');
      expect(wrapper).toHaveClass('flex-col');
      expect(wrapper).toHaveClass('items-center');
      expect(wrapper).toHaveClass('justify-center');
    });

    it('should have dashed border', () => {
      const { container } = render(<EmptyState title="Empty" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('border-dashed');
      expect(wrapper).toHaveClass('rounded-lg');
    });

    it('should have minimum height', () => {
      const { container } = render(<EmptyState title="Empty" />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('min-h-[250px]');
    });

    it('should have proper title styling', () => {
      render(<EmptyState title="Empty State" />);
      const title = screen.getByText('Empty State');
      expect(title).toHaveClass('font-semibold');
    });
  });

  describe('complete empty state', () => {
    it('should render complete empty state', () => {
      const action = {
        label: 'Create New',
        onClick: vi.fn(),
      };

      render(
        <EmptyState
          icon={FileText}
          title="No Documents"
          description="Upload your first document to organize your files"
          action={action}
        />
      );

      expect(screen.getByText('No Documents')).toBeInTheDocument();
      expect(
        screen.getByText('Upload your first document to organize your files')
      ).toBeInTheDocument();
      expect(screen.getByText('Create New')).toBeInTheDocument();
    });
  });
});
