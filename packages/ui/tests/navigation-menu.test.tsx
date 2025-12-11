import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '../src/components/navigation-menu';

describe('NavigationMenu', () => {
  describe('rendering', () => {
    it('should render navigation menu', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Menu Item</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      expect(screen.getByText('Menu Item')).toBeInTheDocument();
    });
  });

  describe('NavigationMenu', () => {
    it('should have default classes', () => {
      render(
        <NavigationMenu data-testid="nav-menu">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      expect(screen.getByTestId('nav-menu')).toHaveClass('relative');
    });

    it('should merge custom className', () => {
      render(
        <NavigationMenu className="custom-nav" data-testid="nav-menu">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      expect(screen.getByTestId('nav-menu')).toHaveClass('custom-nav');
    });
  });

  describe('NavigationMenuList', () => {
    it('should have default classes', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList data-testid="nav-list">
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      expect(screen.getByTestId('nav-list')).toHaveClass('group');
      expect(screen.getByTestId('nav-list')).toHaveClass('flex');
    });

    it('should merge custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList className="custom-list" data-testid="nav-list">
            <NavigationMenuItem>
              <NavigationMenuTrigger>Item</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      expect(screen.getByTestId('nav-list')).toHaveClass('custom-list');
    });
  });

  describe('NavigationMenuTrigger', () => {
    it('should render trigger button', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Trigger</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      expect(screen.getByRole('button', { name: /trigger/i })).toBeInTheDocument();
    });

    it('should render chevron icon', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Trigger</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      const trigger = screen.getByRole('button', { name: /trigger/i });
      expect(trigger.querySelector('svg')).toBeInTheDocument();
    });

    it('should merge custom className', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="custom-trigger">Trigger</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      expect(screen.getByRole('button', { name: /trigger/i })).toHaveClass('custom-trigger');
    });
  });

  describe('NavigationMenuContent', () => {
    it('should show content on trigger click', async () => {
      const user = userEvent.setup();
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div>Product Content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      await user.click(screen.getByRole('button', { name: /products/i }));

      await waitFor(() => {
        expect(screen.getByText('Product Content')).toBeInTheDocument();
      });
    });

    it('should merge custom className', async () => {
      const user = userEvent.setup();
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
              <NavigationMenuContent className="custom-content" data-testid="content">
                <div>Content</div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      await user.click(screen.getByRole('button', { name: /products/i }));

      await waitFor(() => {
        expect(screen.getByTestId('content')).toHaveClass('custom-content');
      });
    });
  });

  describe('NavigationMenuLink', () => {
    it('should render link', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/test">Test Link</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      expect(screen.getByRole('link', { name: /test link/i })).toBeInTheDocument();
    });

    it('should have correct href', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="/test">Test Link</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      expect(screen.getByRole('link', { name: /test link/i })).toHaveAttribute('href', '/test');
    });
  });

  describe('navigationMenuTriggerStyle', () => {
    it('should generate class string', () => {
      const classes = navigationMenuTriggerStyle();
      expect(classes).toContain('inline-flex');
      expect(classes).toContain('h-9');
      expect(classes).toContain('rounded-md');
    });
  });

  describe('multiple menu items', () => {
    it('should render multiple items', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Services</NavigationMenuTrigger>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="/about">About</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      );

      expect(screen.getByText('Products')).toBeInTheDocument();
      expect(screen.getByText('Services')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });
  });
});
