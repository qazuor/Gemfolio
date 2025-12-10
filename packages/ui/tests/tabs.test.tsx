import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../src/components/tabs';

describe('Tabs', () => {
  describe('TabsList', () => {
    it('should render tabs list', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(screen.getByTestId('list')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="list">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      const list = screen.getByTestId('list');
      expect(list).toHaveClass('inline-flex');
      expect(list).toHaveClass('h-9');
      expect(list).toHaveClass('items-center');
      expect(list).toHaveClass('rounded-lg');
      expect(list).toHaveClass('bg-muted');
    });

    it('should merge custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList data-testid="list" className="custom-class">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      const list = screen.getByTestId('list');
      expect(list).toHaveClass('custom-class');
      expect(list).toHaveClass('inline-flex');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Tabs defaultValue="tab1">
          <TabsList ref={ref}>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('TabsTrigger', () => {
    it('should render trigger button', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('inline-flex');
      expect(trigger).toHaveClass('items-center');
      expect(trigger).toHaveClass('rounded-md');
      expect(trigger).toHaveClass('text-sm');
      expect(trigger).toHaveClass('font-medium');
    });

    it('should have active state when selected', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('data-state', 'active');
    });

    it('should have inactive state when not selected', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2" data-testid="trigger2">
              Tab 2
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      const trigger = screen.getByTestId('trigger2');
      expect(trigger).toHaveAttribute('data-state', 'inactive');
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" disabled data-testid="trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeDisabled();
    });

    it('should switch tabs on click', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="trigger1">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" data-testid="trigger2">
              Tab 2
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );

      await user.click(screen.getByTestId('trigger2'));
      expect(screen.getByTestId('trigger2')).toHaveAttribute('data-state', 'active');
      expect(screen.getByTestId('trigger1')).toHaveAttribute('data-state', 'inactive');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" ref={ref}>
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('TabsContent', () => {
    it('should render content for active tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      );
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should not render content for inactive tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="content">
            Content 1
          </TabsContent>
        </Tabs>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('mt-2');
      expect(content).toHaveClass('ring-offset-background');
    });

    it('should merge custom className', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="content" className="custom-class">
            Content 1
          </TabsContent>
        </Tabs>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-class');
      expect(content).toHaveClass('mt-2');
    });

    it('should switch content when tab changes', async () => {
      const user = userEvent.setup();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );

      expect(screen.getByText('Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument();

      await user.click(screen.getByText('Tab 2'));

      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" ref={ref}>
            Content
          </TabsContent>
        </Tabs>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('controlled state', () => {
    it('should respect value prop', () => {
      render(
        <Tabs value="tab2">
          <TabsList>
            <TabsTrigger value="tab1" data-testid="trigger1">
              Tab 1
            </TabsTrigger>
            <TabsTrigger value="tab2" data-testid="trigger2">
              Tab 2
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      );
      expect(screen.getByTestId('trigger2')).toHaveAttribute('data-state', 'active');
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });

    it('should call onValueChange when tab changes', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <Tabs defaultValue="tab1" onValueChange={onValueChange}>
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );

      await user.click(screen.getByText('Tab 2'));
      expect(onValueChange).toHaveBeenCalledWith('tab2');
    });
  });

  describe('accessibility', () => {
    it('should have proper role attributes', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content</TabsContent>
        </Tabs>
      );
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab')).toBeInTheDocument();
      expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    });

    it('should have aria-selected on active tab', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      );
      expect(screen.getByText('Tab 1')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Tab 2')).toHaveAttribute('aria-selected', 'false');
    });
  });
});
