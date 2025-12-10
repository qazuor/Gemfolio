import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../src/components/tooltip';

describe('Tooltip', () => {
  const renderTooltip = (children: React.ReactNode) => {
    return render(<TooltipProvider>{children}</TooltipProvider>);
  };

  describe('TooltipTrigger', () => {
    it('should render trigger', () => {
      renderTooltip(
        <Tooltip>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </Tooltip>
      );
      expect(screen.getByText('Hover me')).toBeInTheDocument();
    });

    it('should render trigger with asChild', () => {
      renderTooltip(
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button">Button trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );
      expect(screen.getByRole('button', { name: 'Button trigger' })).toBeInTheDocument();
    });
  });

  describe('controlled state', () => {
    it('should show tooltip when open prop is true', () => {
      renderTooltip(
        <Tooltip open>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Always visible</TooltipContent>
        </Tooltip>
      );
      // Radix tooltip duplicates content for accessibility
      expect(screen.getAllByText('Always visible').length).toBeGreaterThan(0);
    });

    it('should hide tooltip when open prop is false', () => {
      renderTooltip(
        <Tooltip open={false}>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Hidden content</TooltipContent>
        </Tooltip>
      );
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('should call onOpenChange callback', () => {
      const onOpenChange = vi.fn();
      renderTooltip(
        <Tooltip open onOpenChange={onOpenChange}>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </Tooltip>
      );
      // Just verifying the component renders with callback
      expect(screen.getByText('Trigger')).toBeInTheDocument();
    });
  });

  describe('TooltipContent styling (when open)', () => {
    it('should have default classes when shown', () => {
      renderTooltip(
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent data-testid="tooltip">Content</TooltipContent>
        </Tooltip>
      );

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveClass('z-50');
      expect(tooltip).toHaveClass('overflow-hidden');
      expect(tooltip).toHaveClass('rounded-md');
      expect(tooltip).toHaveClass('bg-primary');
      expect(tooltip).toHaveClass('px-3');
      expect(tooltip).toHaveClass('py-1.5');
      expect(tooltip).toHaveClass('text-xs');
      expect(tooltip).toHaveClass('text-primary-foreground');
    });

    it('should merge custom className', () => {
      renderTooltip(
        <Tooltip open>
          <TooltipTrigger>Hover me</TooltipTrigger>
          <TooltipContent data-testid="tooltip" className="custom-class">
            Content
          </TooltipContent>
        </Tooltip>
      );

      const tooltip = screen.getByTestId('tooltip');
      expect(tooltip).toHaveClass('custom-class');
      expect(tooltip).toHaveClass('z-50');
    });
  });

  describe('complex content', () => {
    it('should render complex content when open', () => {
      renderTooltip(
        <Tooltip open>
          <TooltipTrigger>Hover</TooltipTrigger>
          <TooltipContent>
            <div>
              <strong>Bold text</strong>
              <p>Paragraph</p>
            </div>
          </TooltipContent>
        </Tooltip>
      );

      // Radix tooltip duplicates content for accessibility
      expect(screen.getAllByText('Bold text').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Paragraph').length).toBeGreaterThan(0);
    });
  });

  describe('TooltipProvider', () => {
    it('should wrap tooltips', () => {
      renderTooltip(
        <Tooltip>
          <TooltipTrigger>Trigger 1</TooltipTrigger>
          <TooltipContent>Content 1</TooltipContent>
        </Tooltip>
      );

      expect(screen.getByText('Trigger 1')).toBeInTheDocument();
    });

    it('should support delayDuration prop', () => {
      render(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>Quick trigger</TooltipTrigger>
            <TooltipContent>Quick content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );

      expect(screen.getByText('Quick trigger')).toBeInTheDocument();
    });
  });
});
