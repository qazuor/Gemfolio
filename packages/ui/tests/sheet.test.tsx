import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../src/components/sheet';

describe('Sheet', () => {
  describe('SheetTrigger', () => {
    it('should render trigger', () => {
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
        </Sheet>
      );
      expect(screen.getByRole('button', { name: /open/i })).toBeInTheDocument();
    });

    it('should open sheet on click', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet content</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('SheetContent', () => {
    it('should render content when open', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet content</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Sheet content')).toBeInTheDocument();
      });
    });

    it('should render close button', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Content</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
      });
    });

    it('should apply default right side classes', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Content</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveClass('right-0');
      });
    });

    it('should apply left side classes', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="left">
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Content</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveClass('left-0');
      });
    });

    it('should apply top side classes', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="top">
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Content</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveClass('top-0');
      });
    });

    it('should apply bottom side classes', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent side="bottom">
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Content</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(dialog).toHaveClass('bottom-0');
      });
    });

    it('should merge custom className', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent className="custom-content">
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Content</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toHaveClass('custom-content');
      });
    });
  });

  describe('SheetHeader', () => {
    it('should render header', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader data-testid="sheet-header">
              <SheetTitle>Title</SheetTitle>
              <SheetDescription>Description</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByTestId('sheet-header')).toBeInTheDocument();
      });
    });

    it('should have default classes', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader data-testid="sheet-header">
              <SheetTitle>Title</SheetTitle>
              <SheetDescription>Description</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByTestId('sheet-header')).toHaveClass('flex');
        expect(screen.getByTestId('sheet-header')).toHaveClass('flex-col');
      });
    });

    it('should merge custom className', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetHeader className="custom-header" data-testid="sheet-header">
              <SheetTitle>Title</SheetTitle>
              <SheetDescription>Description</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByTestId('sheet-header')).toHaveClass('custom-header');
      });
    });
  });

  describe('SheetFooter', () => {
    it('should render footer', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
            <SheetFooter data-testid="sheet-footer">Footer content</SheetFooter>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByTestId('sheet-footer')).toBeInTheDocument();
      });
    });

    it('should merge custom className', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
            <SheetFooter className="custom-footer" data-testid="sheet-footer">
              Footer
            </SheetFooter>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByTestId('sheet-footer')).toHaveClass('custom-footer');
      });
    });
  });

  describe('SheetTitle', () => {
    it('should render title', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Sheet Title')).toBeInTheDocument();
      });
    });

    it('should merge custom className', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle className="custom-title">Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Title')).toHaveClass('custom-title');
      });
    });
  });

  describe('SheetDescription', () => {
    it('should render description', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Sheet Description')).toBeInTheDocument();
      });
    });

    it('should merge custom className', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription className="custom-desc">Description</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByText('Description')).toHaveClass('custom-desc');
      });
    });
  });

  describe('SheetClose', () => {
    it('should close sheet on click', async () => {
      const user = userEvent.setup();
      render(
        <Sheet>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Description</SheetDescription>
            <SheetClose>Close Sheet</SheetClose>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /close sheet/i }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('controlled state', () => {
    it('should respect open prop', () => {
      render(
        <Sheet open>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Content</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should call onOpenChange', async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();
      render(
        <Sheet onOpenChange={handleOpenChange}>
          <SheetTrigger>Open</SheetTrigger>
          <SheetContent>
            <SheetTitle>Title</SheetTitle>
            <SheetDescription>Content</SheetDescription>
          </SheetContent>
        </Sheet>
      );

      await user.click(screen.getByRole('button', { name: /open/i }));

      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });
});
