import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner, spinnerVariants } from '../src/components/spinner';

describe('Spinner', () => {
  describe('rendering', () => {
    it('should render spinner', () => {
      render(<Spinner data-testid="spinner" />);
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    it('should render as svg element', () => {
      render(<Spinner data-testid="spinner" />);
      expect(screen.getByTestId('spinner').tagName).toBe('svg');
    });

    it('should have animate-spin class', () => {
      render(<Spinner data-testid="spinner" />);
      expect(screen.getByTestId('spinner')).toHaveClass('animate-spin');
    });
  });

  describe('sizes', () => {
    it('should apply default size classes', () => {
      render(<Spinner data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-4');
      expect(spinner).toHaveClass('w-4');
    });

    it('should apply sm size classes', () => {
      render(<Spinner size="sm" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-3');
      expect(spinner).toHaveClass('w-3');
    });

    it('should apply lg size classes', () => {
      render(<Spinner size="lg" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-6');
      expect(spinner).toHaveClass('w-6');
    });

    it('should apply xl size classes', () => {
      render(<Spinner size="xl" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('h-8');
      expect(spinner).toHaveClass('w-8');
    });
  });

  describe('custom className', () => {
    it('should merge custom className with default classes', () => {
      render(<Spinner className="custom-spinner" data-testid="spinner" />);
      const spinner = screen.getByTestId('spinner');
      expect(spinner).toHaveClass('custom-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('spinnerVariants', () => {
    it('should generate correct class string for default', () => {
      const classes = spinnerVariants();
      expect(classes).toContain('animate-spin');
      expect(classes).toContain('h-4');
      expect(classes).toContain('w-4');
    });

    it('should generate correct class string for sm size', () => {
      const classes = spinnerVariants({ size: 'sm' });
      expect(classes).toContain('h-3');
      expect(classes).toContain('w-3');
    });

    it('should generate correct class string for lg size', () => {
      const classes = spinnerVariants({ size: 'lg' });
      expect(classes).toContain('h-6');
      expect(classes).toContain('w-6');
    });

    it('should generate correct class string for xl size', () => {
      const classes = spinnerVariants({ size: 'xl' });
      expect(classes).toContain('h-8');
      expect(classes).toContain('w-8');
    });
  });

  describe('accessibility', () => {
    it('should have aria-hidden when used decoratively', () => {
      render(<Spinner data-testid="spinner" aria-hidden="true" />);
      expect(screen.getByTestId('spinner')).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support aria-label', () => {
      render(<Spinner data-testid="spinner" aria-label="Loading..." />);
      expect(screen.getByTestId('spinner')).toHaveAttribute('aria-label', 'Loading...');
    });
  });
});
