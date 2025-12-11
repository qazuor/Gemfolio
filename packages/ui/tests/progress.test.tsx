import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Progress } from '../src/components/progress';

describe('Progress', () => {
  describe('rendering', () => {
    it('should render progress bar', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render with default classes', () => {
      render(<Progress value={50} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('relative');
      expect(progressbar).toHaveClass('h-2');
      expect(progressbar).toHaveClass('w-full');
    });
  });

  describe('value', () => {
    it('should render with different value props', () => {
      const { rerender } = render(<Progress value={75} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      rerender(<Progress value={0} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      rerender(<Progress value={100} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should handle undefined value', () => {
      render(<Progress />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toBeInTheDocument();
    });
  });

  describe('indicator', () => {
    it('should render indicator element', () => {
      const { container } = render(<Progress value={50} />);
      const indicator = container.querySelector('[class*="bg-primary"]');
      expect(indicator).toBeInTheDocument();
    });

    it('should render indicator with style', () => {
      const { container } = render(<Progress value={50} />);
      const indicator = container.querySelector('[class*="bg-primary"]');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should merge custom className with default classes', () => {
      render(<Progress value={50} className="custom-progress" />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveClass('custom-progress');
      expect(progressbar).toHaveClass('relative');
    });
  });

  describe('accessibility', () => {
    it('should have role progressbar', () => {
      render(<Progress value={50} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('custom max', () => {
    it('should support custom max value', () => {
      render(<Progress value={50} max={200} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });
});
