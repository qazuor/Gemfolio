import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Label } from '../src/components/label';

describe('Label', () => {
  describe('rendering', () => {
    it('should render with children', () => {
      render(<Label>Email</Label>);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render as label element', () => {
      render(<Label data-testid="label">Name</Label>);
      const label = screen.getByTestId('label');
      expect(label.tagName).toBe('LABEL');
    });
  });

  describe('styling', () => {
    it('should have default classes', () => {
      render(<Label data-testid="label">Email</Label>);
      const label = screen.getByTestId('label');
      expect(label).toHaveClass('text-sm');
      expect(label).toHaveClass('font-medium');
      expect(label).toHaveClass('leading-none');
    });

    it('should merge custom className', () => {
      render(
        <Label data-testid="label" className="text-red-500">
          Email
        </Label>
      );
      const label = screen.getByTestId('label');
      expect(label).toHaveClass('text-red-500');
      expect(label).toHaveClass('text-sm');
    });
  });

  describe('htmlFor attribute', () => {
    it('should associate with input using htmlFor', () => {
      render(
        <>
          <Label htmlFor="email-input">Email</Label>
          <input id="email-input" type="email" />
        </>
      );
      const label = screen.getByText('Email');
      expect(label).toHaveAttribute('for', 'email-input');
    });

    it('should click target input when label is clicked', async () => {
      const user = userEvent.setup();
      const onFocus = vi.fn();
      render(
        <>
          <Label htmlFor="test-input">Click me</Label>
          <input id="test-input" onFocus={onFocus} />
        </>
      );
      await user.click(screen.getByText('Click me'));
      expect(onFocus).toHaveBeenCalled();
    });
  });

  describe('ref forwarding', () => {
    it('should forward ref', () => {
      const ref = vi.fn();
      render(<Label ref={ref}>Email</Label>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLLabelElement);
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes', () => {
      render(
        <Label data-testid="label" id="my-label">
          Email
        </Label>
      );
      const label = screen.getByTestId('label');
      expect(label).toHaveAttribute('id', 'my-label');
    });
  });

  describe('peer disabled styling', () => {
    it('should have peer-disabled classes for styling', () => {
      render(<Label data-testid="label">Disabled input label</Label>);
      const label = screen.getByTestId('label');
      expect(label).toHaveClass('peer-disabled:cursor-not-allowed');
      expect(label).toHaveClass('peer-disabled:opacity-70');
    });
  });
});
