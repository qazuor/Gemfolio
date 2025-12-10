import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from '../src/components/alert';

describe('Alert', () => {
  describe('Alert component', () => {
    it('should render with children', () => {
      render(<Alert>Alert content</Alert>);
      expect(screen.getByText('Alert content')).toBeInTheDocument();
    });

    it('should have alert role', () => {
      render(<Alert>Content</Alert>);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(<Alert data-testid="alert">Content</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('relative');
      expect(alert).toHaveClass('w-full');
      expect(alert).toHaveClass('rounded-lg');
      expect(alert).toHaveClass('border');
      expect(alert).toHaveClass('px-4');
      expect(alert).toHaveClass('py-3');
      expect(alert).toHaveClass('text-sm');
    });

    it('should merge custom className', () => {
      render(
        <Alert data-testid="alert" className="custom-class">
          Content
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('custom-class');
      expect(alert).toHaveClass('relative');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(<Alert ref={ref}>Content</Alert>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('variants', () => {
    it('should apply default variant classes', () => {
      render(<Alert data-testid="alert">Content</Alert>);
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('bg-background');
      expect(alert).toHaveClass('text-foreground');
    });

    it('should apply destructive variant classes', () => {
      render(
        <Alert data-testid="alert" variant="destructive">
          Content
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('border-destructive/50');
      expect(alert).toHaveClass('text-destructive');
    });

    it('should apply success variant classes', () => {
      render(
        <Alert data-testid="alert" variant="success">
          Content
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('border-green-500/50');
      expect(alert).toHaveClass('text-green-700');
    });

    it('should apply warning variant classes', () => {
      render(
        <Alert data-testid="alert" variant="warning">
          Content
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('border-yellow-500/50');
      expect(alert).toHaveClass('text-yellow-700');
    });
  });

  describe('AlertTitle component', () => {
    it('should render title', () => {
      render(
        <Alert>
          <AlertTitle>Alert Title</AlertTitle>
        </Alert>
      );
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
    });

    it('should render as h5', () => {
      render(
        <Alert>
          <AlertTitle data-testid="title">Title</AlertTitle>
        </Alert>
      );
      const title = screen.getByTestId('title');
      expect(title.tagName).toBe('H5');
    });

    it('should have default classes', () => {
      render(
        <Alert>
          <AlertTitle data-testid="title">Title</AlertTitle>
        </Alert>
      );
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('mb-1');
      expect(title).toHaveClass('font-medium');
      expect(title).toHaveClass('leading-none');
      expect(title).toHaveClass('tracking-tight');
    });

    it('should merge custom className', () => {
      render(
        <Alert>
          <AlertTitle data-testid="title" className="custom-class">
            Title
          </AlertTitle>
        </Alert>
      );
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('custom-class');
      expect(title).toHaveClass('font-medium');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Alert>
          <AlertTitle ref={ref}>Title</AlertTitle>
        </Alert>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('AlertDescription component', () => {
    it('should render description', () => {
      render(
        <Alert>
          <AlertDescription>Alert Description</AlertDescription>
        </Alert>
      );
      expect(screen.getByText('Alert Description')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Alert>
          <AlertDescription data-testid="desc">Description</AlertDescription>
        </Alert>
      );
      const desc = screen.getByTestId('desc');
      expect(desc).toHaveClass('text-sm');
    });

    it('should merge custom className', () => {
      render(
        <Alert>
          <AlertDescription data-testid="desc" className="custom-class">
            Description
          </AlertDescription>
        </Alert>
      );
      const desc = screen.getByTestId('desc');
      expect(desc).toHaveClass('custom-class');
      expect(desc).toHaveClass('text-sm');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Alert>
          <AlertDescription ref={ref}>Description</AlertDescription>
        </Alert>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('composed Alert', () => {
    it('should render full alert with all components', () => {
      render(
        <Alert>
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>Something went wrong. Please try again.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });

    it('should render destructive alert composition', () => {
      render(
        <Alert variant="destructive" data-testid="alert">
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>Your session has expired.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('text-destructive');
      expect(screen.getByText('Error!')).toBeInTheDocument();
      expect(screen.getByText('Your session has expired.')).toBeInTheDocument();
    });

    it('should render success alert composition', () => {
      render(
        <Alert variant="success" data-testid="alert">
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your changes have been saved.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByTestId('alert');
      expect(alert).toHaveClass('text-green-700');
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Your changes have been saved.')).toBeInTheDocument();
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes', () => {
      render(
        <Alert data-testid="alert" id="my-alert">
          Content
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      expect(alert).toHaveAttribute('id', 'my-alert');
    });
  });
});
