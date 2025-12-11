import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../src/components/pagination';

describe('Pagination', () => {
  describe('Pagination (root)', () => {
    it('should render as nav element', () => {
      render(<Pagination data-testid="pagination" />);
      expect(screen.getByTestId('pagination').tagName).toBe('NAV');
    });

    it('should have aria-label="pagination"', () => {
      render(<Pagination data-testid="pagination" />);
      expect(screen.getByTestId('pagination')).toHaveAttribute('aria-label', 'pagination');
    });

    it('should have default classes', () => {
      render(<Pagination data-testid="pagination" />);
      expect(screen.getByTestId('pagination')).toHaveClass('mx-auto');
      expect(screen.getByTestId('pagination')).toHaveClass('flex');
    });

    it('should merge custom className', () => {
      render(<Pagination className="custom-pagination" data-testid="pagination" />);
      expect(screen.getByTestId('pagination')).toHaveClass('custom-pagination');
    });
  });

  describe('PaginationContent', () => {
    it('should render as ul element', () => {
      render(
        <Pagination>
          <PaginationContent data-testid="content" />
        </Pagination>
      );
      expect(screen.getByTestId('content').tagName).toBe('UL');
    });

    it('should have default classes', () => {
      render(
        <Pagination>
          <PaginationContent data-testid="content" />
        </Pagination>
      );
      expect(screen.getByTestId('content')).toHaveClass('flex');
      expect(screen.getByTestId('content')).toHaveClass('flex-row');
    });

    it('should merge custom className', () => {
      render(
        <Pagination>
          <PaginationContent className="custom-content" data-testid="content" />
        </Pagination>
      );
      expect(screen.getByTestId('content')).toHaveClass('custom-content');
    });
  });

  describe('PaginationItem', () => {
    it('should render as li element', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem data-testid="item" />
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByTestId('item').tagName).toBe('LI');
    });

    it('should merge custom className', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem className="custom-item" data-testid="item" />
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByTestId('item')).toHaveClass('custom-item');
    });
  });

  describe('PaginationLink', () => {
    it('should render as anchor element', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument();
    });

    it('should apply active styles when isActive', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1" isActive>
                1
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('aria-current', 'page');
    });

    it('should not have aria-current when not active', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1">1</PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByRole('link', { name: '1' })).not.toHaveAttribute('aria-current');
    });

    it('should merge custom className', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="/page/1" className="custom-link">
                1
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByRole('link', { name: '1' })).toHaveClass('custom-link');
    });
  });

  describe('PaginationPrevious', () => {
    it('should render previous link', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByRole('link', { name: /previous/i })).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Go to previous page');
    });

    it('should render chevron icon and text', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByRole('link').querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('PaginationNext', () => {
    it('should render next link', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="/page/2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByRole('link', { name: /next/i })).toBeInTheDocument();
    });

    it('should have aria-label', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="/page/2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByRole('link')).toHaveAttribute('aria-label', 'Go to next page');
    });

    it('should render text and chevron icon', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationNext href="/page/2" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByRole('link').querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('PaginationEllipsis', () => {
    it('should render ellipsis', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis data-testid="ellipsis" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByTestId('ellipsis')).toBeInTheDocument();
    });

    it('should be hidden from accessibility', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis data-testid="ellipsis" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByTestId('ellipsis')).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have sr-only text', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByText('More pages')).toHaveClass('sr-only');
    });

    it('should merge custom className', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationEllipsis className="custom-ellipsis" data-testid="ellipsis" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );
      expect(screen.getByTestId('ellipsis')).toHaveClass('custom-ellipsis');
    });
  });

  describe('complete pagination', () => {
    it('should render full pagination', () => {
      render(
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="/page/0" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/1">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/2" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="/page/3">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="/page/3" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      );

      expect(screen.getByRole('link', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: '3' })).toBeInTheDocument();
      expect(screen.getByText('More pages')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /next/i })).toBeInTheDocument();
    });
  });
});
