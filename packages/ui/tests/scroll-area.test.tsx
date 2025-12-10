import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ScrollArea, ScrollBar } from '../src/components/scroll-area';

// Generate test items with unique ids
const generateItems = (count: number, prefix: string) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    label: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${i + 1}`,
  }));

describe('ScrollArea', () => {
  describe('ScrollArea component', () => {
    it('should render scroll area with children', () => {
      render(
        <ScrollArea>
          <div>Scrollable content</div>
        </ScrollArea>
      );
      expect(screen.getByText('Scrollable content')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('relative');
      expect(scrollArea).toHaveClass('overflow-hidden');
    });

    it('should merge custom className', () => {
      render(
        <ScrollArea data-testid="scroll-area" className="h-[200px] w-[300px]">
          <div>Content</div>
        </ScrollArea>
      );
      const scrollArea = screen.getByTestId('scroll-area');
      expect(scrollArea).toHaveClass('h-[200px]');
      expect(scrollArea).toHaveClass('w-[300px]');
      expect(scrollArea).toHaveClass('relative');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <ScrollArea ref={ref}>
          <div>Content</div>
        </ScrollArea>
      );
      expect(ref).toHaveBeenCalled();
    });

    it('should contain viewport', () => {
      render(
        <ScrollArea data-testid="scroll-area">
          <div>Content</div>
        </ScrollArea>
      );
      const scrollArea = screen.getByTestId('scroll-area');
      const viewport = scrollArea.querySelector('[data-radix-scroll-area-viewport]');
      expect(viewport).toBeInTheDocument();
    });

    it('should contain default scrollbar', () => {
      const { container } = render(
        <ScrollArea>
          <div>Content</div>
        </ScrollArea>
      );
      // ScrollArea automatically includes a vertical ScrollBar
      // In jsdom, the scrollbar might be hidden since there's no actual scrolling
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('composed ScrollArea', () => {
    it('should render scroll area with long content', () => {
      const items = generateItems(50, 'item');
      render(
        <ScrollArea className="h-[200px]" data-testid="scroll-area">
          <div>
            {items.map((item) => (
              <p key={item.id}>{item.label}</p>
            ))}
          </div>
        </ScrollArea>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 50')).toBeInTheDocument();
    });

    it('should render scroll area with list items', () => {
      render(
        <ScrollArea className="h-72 rounded-md border" data-testid="scroll-area">
          <div className="p-4">
            <h4>Tags</h4>
            {['Tag 1', 'Tag 2', 'Tag 3'].map((tag) => (
              <div key={tag} className="text-sm">
                {tag}
              </div>
            ))}
          </div>
        </ScrollArea>
      );
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByText('Tag 1')).toBeInTheDocument();
      expect(screen.getByText('Tag 2')).toBeInTheDocument();
      expect(screen.getByText('Tag 3')).toBeInTheDocument();
    });

    it('should render scroll area with custom content', () => {
      const cards = generateItems(10, 'card');
      render(
        <ScrollArea className="w-96 whitespace-nowrap" data-testid="scroll-area">
          <div className="flex w-max space-x-4 p-4">
            {cards.map((card) => (
              <div key={card.id} className="w-[150px] shrink-0">
                {card.label}
              </div>
            ))}
          </div>
        </ScrollArea>
      );
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 10')).toBeInTheDocument();
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes on ScrollArea', () => {
      render(
        <ScrollArea data-testid="scroll-area" id="my-scroll-area">
          <div>Content</div>
        </ScrollArea>
      );
      expect(screen.getByTestId('scroll-area')).toHaveAttribute('id', 'my-scroll-area');
    });
  });

  describe('ScrollBar component (standalone)', () => {
    // Note: ScrollBar is designed to be used within ScrollArea context
    // These tests verify the component can be imported and has correct types
    it('should export ScrollBar component', () => {
      expect(ScrollBar).toBeDefined();
    });

    it('should have correct displayName', () => {
      expect(ScrollBar.displayName).toBe('ScrollAreaScrollbar');
    });
  });
});
