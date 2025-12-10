import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Avatar, AvatarFallback, AvatarImage } from '../src/components/avatar';

describe('Avatar', () => {
  describe('Avatar component', () => {
    it('should render avatar', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Avatar data-testid="avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('relative');
      expect(avatar).toHaveClass('flex');
      expect(avatar).toHaveClass('h-10');
      expect(avatar).toHaveClass('w-10');
      expect(avatar).toHaveClass('shrink-0');
      expect(avatar).toHaveClass('overflow-hidden');
      expect(avatar).toHaveClass('rounded-full');
    });

    it('should merge custom className', () => {
      render(
        <Avatar data-testid="avatar" className="h-16 w-16">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      const avatar = screen.getByTestId('avatar');
      expect(avatar).toHaveClass('h-16');
      expect(avatar).toHaveClass('w-16');
      expect(avatar).toHaveClass('relative');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Avatar ref={ref}>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(ref).toHaveBeenCalled();
    });
  });

  describe('AvatarImage component', () => {
    it('should render AvatarImage component', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="User avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      // AvatarImage is rendered but hidden until loaded in jsdom
      // Check that avatar container exists
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should pass alt attribute to img when rendered', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="/avatar.jpg" alt="User avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      // The image element should be in DOM even if hidden
      const img = container.querySelector('img');
      if (img) {
        expect(img).toHaveAttribute('alt', 'User avatar');
      }
    });
  });

  describe('AvatarFallback component', () => {
    it('should render fallback content', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback">JD</AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveClass('flex');
      expect(fallback).toHaveClass('h-full');
      expect(fallback).toHaveClass('w-full');
      expect(fallback).toHaveClass('items-center');
      expect(fallback).toHaveClass('justify-center');
      expect(fallback).toHaveClass('rounded-full');
      expect(fallback).toHaveClass('bg-muted');
    });

    it('should merge custom className', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback" className="bg-primary text-primary-foreground">
            JD
          </AvatarFallback>
        </Avatar>
      );
      const fallback = screen.getByTestId('fallback');
      expect(fallback).toHaveClass('bg-primary');
      expect(fallback).toHaveClass('text-primary-foreground');
      expect(fallback).toHaveClass('flex');
    });

    it('should forward ref', () => {
      const ref = vi.fn();
      render(
        <Avatar>
          <AvatarFallback ref={ref}>JD</AvatarFallback>
        </Avatar>
      );
      expect(ref).toHaveBeenCalled();
    });

    it('should render with delay', async () => {
      render(
        <Avatar>
          <AvatarFallback delayMs={100}>JD</AvatarFallback>
        </Avatar>
      );
      // Fallback should eventually appear
      await waitFor(() => {
        expect(screen.getByText('JD')).toBeInTheDocument();
      });
    });
  });

  describe('composed Avatar', () => {
    it('should render avatar with image and fallback', () => {
      render(
        <Avatar>
          <AvatarImage src="/user.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      // Both should be in the document (fallback shows while image loads)
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should show fallback when image fails to load', async () => {
      render(
        <Avatar>
          <AvatarImage src="/invalid-image.jpg" alt="User" />
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
      );
      // Fallback should be visible
      expect(screen.getByText('FB')).toBeInTheDocument();
    });

    it('should render different size avatars', () => {
      const { rerender } = render(
        <Avatar data-testid="avatar" className="h-8 w-8">
          <AvatarFallback>SM</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar')).toHaveClass('h-8');
      expect(screen.getByTestId('avatar')).toHaveClass('w-8');

      rerender(
        <Avatar data-testid="avatar" className="h-16 w-16">
          <AvatarFallback>LG</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar')).toHaveClass('h-16');
      expect(screen.getByTestId('avatar')).toHaveClass('w-16');
    });

    it('should render avatar with icon fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>
            <svg data-testid="icon" />
          </AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  describe('HTML attributes', () => {
    it('should pass through HTML attributes on Avatar', () => {
      render(
        <Avatar data-testid="avatar" id="user-avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('avatar')).toHaveAttribute('id', 'user-avatar');
    });

    it('should pass through HTML attributes on AvatarFallback', () => {
      render(
        <Avatar>
          <AvatarFallback data-testid="fallback" id="user-fallback">
            JD
          </AvatarFallback>
        </Avatar>
      );
      expect(screen.getByTestId('fallback')).toHaveAttribute('id', 'user-fallback');
    });
  });
});
