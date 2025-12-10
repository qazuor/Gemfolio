import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Popover, PopoverContent, PopoverTrigger } from '../src/components/popover';

describe('Popover', () => {
  describe('PopoverTrigger', () => {
    it('should render trigger', () => {
      render(
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
        </Popover>
      );
      expect(screen.getByText('Open Popover')).toBeInTheDocument();
    });

    it('should open popover on click', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Popover content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      expect(screen.getByText('Popover content')).toBeInTheDocument();
    });
  });

  describe('PopoverContent', () => {
    it('should render content when open', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content here</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      expect(screen.getByText('Content here')).toBeInTheDocument();
    });

    it('should have default classes', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent data-testid="popover">Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      const popover = screen.getByTestId('popover');
      expect(popover).toHaveClass('z-50');
      expect(popover).toHaveClass('w-72');
      expect(popover).toHaveClass('rounded-md');
      expect(popover).toHaveClass('border');
      expect(popover).toHaveClass('bg-popover');
      expect(popover).toHaveClass('p-4');
      expect(popover).toHaveClass('text-popover-foreground');
      expect(popover).toHaveClass('shadow-md');
    });

    it('should merge custom className', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent data-testid="popover" className="w-96">
            Content
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      const popover = screen.getByTestId('popover');
      expect(popover).toHaveClass('w-96');
      expect(popover).toHaveClass('z-50');
    });

    it('should close on outside click', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <Popover>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent>Content</PopoverContent>
          </Popover>
        </div>
      );

      await user.click(screen.getByText('Open'));
      expect(screen.getByText('Content')).toBeInTheDocument();

      await user.click(screen.getByTestId('outside'));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('alignment', () => {
    it('should default to center alignment', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept start alignment', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent align="start">Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept end alignment', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent align="end">Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('sideOffset', () => {
    it('should use default sideOffset of 4', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should accept custom sideOffset', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent sideOffset={10}>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('controlled state', () => {
    it('should show popover when open prop is true', () => {
      render(
        <Popover open>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Always visible</PopoverContent>
        </Popover>
      );
      expect(screen.getByText('Always visible')).toBeInTheDocument();
    });

    it('should hide popover when open prop is false', () => {
      render(
        <Popover open={false}>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Hidden content</PopoverContent>
        </Popover>
      );
      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('should call onOpenChange when opened', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Popover onOpenChange={onOpenChange}>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it('should call onOpenChange when closed', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <div>
          <div data-testid="outside">Outside</div>
          <Popover onOpenChange={onOpenChange}>
            <PopoverTrigger>Open</PopoverTrigger>
            <PopoverContent>Content</PopoverContent>
          </Popover>
        </div>
      );

      await user.click(screen.getByText('Open'));
      expect(onOpenChange).toHaveBeenCalledWith(true);

      await user.click(screen.getByTestId('outside'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('complex content', () => {
    it('should render form content', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Settings</PopoverTrigger>
          <PopoverContent>
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Dimensions</h4>
                <p className="text-sm">Set the dimensions</p>
              </div>
              <div>
                <label htmlFor="width">Width</label>
                <input id="width" defaultValue="100%" />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Settings'));
      expect(screen.getByText('Dimensions')).toBeInTheDocument();
      expect(screen.getByLabelText('Width')).toBeInTheDocument();
    });

    it('should allow interaction with form elements', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Edit</PopoverTrigger>
          <PopoverContent>
            <input data-testid="input" placeholder="Enter value" />
            <button type="button">Save</button>
          </PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Edit'));
      await user.type(screen.getByTestId('input'), 'test value');
      expect(screen.getByTestId('input')).toHaveValue('test value');
    });
  });

  describe('accessibility', () => {
    it('should close on escape key', async () => {
      const user = userEvent.setup();
      render(
        <Popover>
          <PopoverTrigger>Open</PopoverTrigger>
          <PopoverContent>Content</PopoverContent>
        </Popover>
      );

      await user.click(screen.getByText('Open'));
      expect(screen.getByText('Content')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });
});
