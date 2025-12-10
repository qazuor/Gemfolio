import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../src/components/dialog';

describe('Dialog', () => {
  describe('DialogTrigger', () => {
    it('should render trigger button', () => {
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
        </Dialog>
      );
      expect(screen.getByText('Open Dialog')).toBeInTheDocument();
    });

    it('should open dialog on click', async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open Dialog'));
      expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    });
  });

  describe('DialogContent', () => {
    it('should render content when open', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Test Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Dialog open>
          <DialogContent data-testid="content">
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('fixed');
      expect(content).toHaveClass('z-50');
      expect(content).toHaveClass('border');
      expect(content).toHaveClass('bg-background');
    });

    it('should merge custom className', () => {
      render(
        <Dialog open>
          <DialogContent data-testid="content" className="custom-class">
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('custom-class');
      expect(content).toHaveClass('fixed');
    });
  });

  describe('DialogHeader', () => {
    it('should render header', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader data-testid="header">
              <DialogTitle>Header Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader data-testid="header">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('flex');
      expect(header).toHaveClass('flex-col');
      expect(header).toHaveClass('space-y-1.5');
    });

    it('should merge custom className', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogHeader data-testid="header" className="custom-class">
              <DialogTitle>Title</DialogTitle>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
      const header = screen.getByTestId('header');
      expect(header).toHaveClass('custom-class');
    });
  });

  describe('DialogFooter', () => {
    it('should render footer', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter data-testid="footer">
              <button type="button">Cancel</button>
              <button type="button">Confirm</button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogFooter data-testid="footer">Footer</DialogFooter>
          </DialogContent>
        </Dialog>
      );
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass('flex');
      expect(footer).toHaveClass('flex-col-reverse');
    });
  });

  describe('DialogTitle', () => {
    it('should render title', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>My Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('My Title')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle data-testid="title">Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      const title = screen.getByTestId('title');
      expect(title).toHaveClass('text-lg');
      expect(title).toHaveClass('font-semibold');
      expect(title).toHaveClass('leading-none');
    });
  });

  describe('DialogDescription', () => {
    it('should render description', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>My Description</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('My Description')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription data-testid="desc">Description</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      const desc = screen.getByTestId('desc');
      expect(desc).toHaveClass('text-sm');
      expect(desc).toHaveClass('text-muted-foreground');
    });
  });

  describe('DialogClose', () => {
    it('should close dialog on click', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Dialog open onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogClose data-testid="close-btn">Close me</DialogClose>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByTestId('close-btn'));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('controlled state', () => {
    it('should respect open prop', () => {
      const { rerender } = render(
        <Dialog open={false}>
          <DialogContent>
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();

      rerender(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should call onOpenChange when opened', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <Dialog onOpenChange={onOpenChange}>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogTitle>Content</DialogTitle>
          </DialogContent>
        </Dialog>
      );

      await user.click(screen.getByText('Open'));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('accessibility', () => {
    it('should have proper role', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
          </DialogContent>
        </Dialog>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have aria-describedby when description present', () => {
      render(
        <Dialog open>
          <DialogContent>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description text</DialogDescription>
          </DialogContent>
        </Dialog>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby');
    });
  });
});
