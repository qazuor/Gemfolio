import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../src/components/breadcrumb';

describe('Breadcrumb', () => {
  describe('Breadcrumb (root)', () => {
    it('should render as nav element', () => {
      render(<Breadcrumb data-testid="breadcrumb" />);
      expect(screen.getByTestId('breadcrumb').tagName).toBe('NAV');
    });

    it('should have aria-label="breadcrumb"', () => {
      render(<Breadcrumb data-testid="breadcrumb" />);
      expect(screen.getByTestId('breadcrumb')).toHaveAttribute('aria-label', 'breadcrumb');
    });
  });

  describe('BreadcrumbList', () => {
    it('should render as ordered list', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList data-testid="list" />
        </Breadcrumb>
      );
      expect(screen.getByTestId('list').tagName).toBe('OL');
    });

    it('should have default classes', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList data-testid="list" />
        </Breadcrumb>
      );
      expect(screen.getByTestId('list')).toHaveClass('flex');
      expect(screen.getByTestId('list')).toHaveClass('flex-wrap');
    });

    it('should merge custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList className="custom-class" data-testid="list" />
        </Breadcrumb>
      );
      expect(screen.getByTestId('list')).toHaveClass('custom-class');
    });
  });

  describe('BreadcrumbItem', () => {
    it('should render as list item', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem data-testid="item">Item</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('item').tagName).toBe('LI');
    });

    it('should have default classes', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem data-testid="item">Item</BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('item')).toHaveClass('inline-flex');
      expect(screen.getByTestId('item')).toHaveClass('items-center');
    });

    it('should merge custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="custom-class" data-testid="item">
              Item
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('item')).toHaveClass('custom-class');
    });
  });

  describe('BreadcrumbLink', () => {
    it('should render as anchor by default', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/test">Link</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      const link = screen.getByRole('link', { name: /link/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should render as child when asChild is true', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <button type="button">Custom Button</button>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByRole('button', { name: /custom button/i })).toBeInTheDocument();
    });

    it('should merge custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/test" className="custom-link">
                Link
              </BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByRole('link')).toHaveClass('custom-link');
    });
  });

  describe('BreadcrumbPage', () => {
    it('should render as span', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage data-testid="page">Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('page').tagName).toBe('SPAN');
    });

    it('should have aria-current="page"', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage data-testid="page">Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('page')).toHaveAttribute('aria-current', 'page');
    });

    it('should merge custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="custom-page" data-testid="page">
                Current
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('page')).toHaveClass('custom-page');
    });
  });

  describe('BreadcrumbSeparator', () => {
    it('should render as list item', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator data-testid="separator" />
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('separator').tagName).toBe('LI');
    });

    it('should have role="presentation"', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator data-testid="separator" />
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('separator')).toHaveAttribute('role', 'presentation');
    });

    it('should have aria-hidden="true"', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator data-testid="separator" />
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('separator')).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render default ChevronRight icon', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator data-testid="separator" />
          </BreadcrumbList>
        </Breadcrumb>
      );
      const separator = screen.getByTestId('separator');
      expect(separator.querySelector('svg')).toBeInTheDocument();
    });

    it('should render custom children', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByText('/')).toBeInTheDocument();
    });

    it('should merge custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbSeparator className="custom-sep" data-testid="separator" />
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('separator')).toHaveClass('custom-sep');
    });
  });

  describe('BreadcrumbEllipsis', () => {
    it('should render as span', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis data-testid="ellipsis" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('ellipsis').tagName).toBe('SPAN');
    });

    it('should have role="presentation"', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis data-testid="ellipsis" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('ellipsis')).toHaveAttribute('role', 'presentation');
    });

    it('should have aria-hidden="true"', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis data-testid="ellipsis" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('ellipsis')).toHaveAttribute('aria-hidden', 'true');
    });

    it('should render MoreHorizontal icon', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis data-testid="ellipsis" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      const ellipsis = screen.getByTestId('ellipsis');
      expect(ellipsis.querySelector('svg')).toBeInTheDocument();
    });

    it('should have sr-only text "More"', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByText('More')).toHaveClass('sr-only');
    });

    it('should merge custom className', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbEllipsis className="custom-ellipsis" data-testid="ellipsis" />
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );
      expect(screen.getByTestId('ellipsis')).toHaveClass('custom-ellipsis');
    });
  });

  describe('complete breadcrumb', () => {
    it('should render full breadcrumb navigation', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current Page</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
      expect(screen.getByText('Current Page')).toBeInTheDocument();
    });

    it('should render breadcrumb with ellipsis', () => {
      render(
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Current</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      );

      expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByText('More')).toBeInTheDocument();
      expect(screen.getByText('Current')).toBeInTheDocument();
    });
  });
});
