import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from '../src/components/skeleton';

describe('Skeleton', () => {
  describe('rendering', () => {
    it('should render skeleton div', () => {
      render(<Skeleton data-testid="skeleton" />);
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should render as div element', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton.tagName).toBe('DIV');
    });
  });

  describe('styling', () => {
    it('should have default classes', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('rounded-md');
      expect(skeleton).toHaveClass('bg-primary/10');
    });

    it('should merge custom className', () => {
      render(<Skeleton data-testid="skeleton" className="h-4 w-full" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-4');
      expect(skeleton).toHaveClass('w-full');
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should allow overriding height', () => {
      render(<Skeleton data-testid="skeleton" className="h-10" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-10');
    });

    it('should allow overriding width', () => {
      render(<Skeleton data-testid="skeleton" className="w-[200px]" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('w-[200px]');
    });

    it('should allow overriding rounded', () => {
      render(<Skeleton data-testid="skeleton" className="rounded-full" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-full');
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes', () => {
      render(<Skeleton data-testid="skeleton" id="my-skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('id', 'my-skeleton');
    });

    it('should pass through aria attributes', () => {
      render(<Skeleton data-testid="skeleton" aria-label="Loading content" role="status" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
      expect(skeleton).toHaveAttribute('role', 'status');
    });
  });

  describe('common skeleton patterns', () => {
    it('should render text skeleton', () => {
      render(<Skeleton data-testid="skeleton" className="h-4 w-[250px]" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-4');
      expect(skeleton).toHaveClass('w-[250px]');
    });

    it('should render avatar skeleton', () => {
      render(<Skeleton data-testid="skeleton" className="h-12 w-12 rounded-full" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-12');
      expect(skeleton).toHaveClass('w-12');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('should render button skeleton', () => {
      render(<Skeleton data-testid="skeleton" className="h-10 w-24" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-10');
      expect(skeleton).toHaveClass('w-24');
    });

    it('should render card skeleton', () => {
      render(<Skeleton data-testid="skeleton" className="h-[200px] w-full" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-[200px]');
      expect(skeleton).toHaveClass('w-full');
    });
  });

  describe('multiple skeletons', () => {
    it('should render multiple skeletons for loading list', () => {
      render(
        <div data-testid="skeleton-list">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      );
      const list = screen.getByTestId('skeleton-list');
      const skeletons = list.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });

    it('should render card with header and content skeletons', () => {
      render(
        <div data-testid="card-skeleton" className="p-4 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      );
      const card = screen.getByTestId('card-skeleton');
      const skeletons = card.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(4);
    });
  });
});
