import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Toaster } from '../src/components/sonner';

describe('Toaster', () => {
  describe('rendering', () => {
    it('should render toaster', () => {
      const { container } = render(<Toaster />);
      expect(container).toBeInTheDocument();
    });

    it('should render without errors', () => {
      expect(() => render(<Toaster />)).not.toThrow();
    });
  });

  describe('props', () => {
    it('should pass position prop without errors', () => {
      expect(() => render(<Toaster position="top-center" />)).not.toThrow();
    });

    it('should pass duration prop without errors', () => {
      expect(() => render(<Toaster duration={5000} />)).not.toThrow();
    });

    it('should pass theme prop without errors', () => {
      expect(() => render(<Toaster theme="dark" />)).not.toThrow();
    });

    it('should pass richColors prop without errors', () => {
      expect(() => render(<Toaster richColors />)).not.toThrow();
    });

    it('should pass expand prop without errors', () => {
      expect(() => render(<Toaster expand />)).not.toThrow();
    });

    it('should pass closeButton prop without errors', () => {
      expect(() => render(<Toaster closeButton />)).not.toThrow();
    });
  });
});
