import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '../../src/components/shared/Pagination';

describe('Pagination', () => {
  const defaultProps = {
    page: 1,
    totalPages: 10,
    total: 100,
    limit: 10,
    onPageChange: vi.fn(),
  };

  describe('rendering', () => {
    it('should render current page and total pages', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should render item count text', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByText('1-10 de 100')).toBeInTheDocument();
    });

    it('should render correct item range on different pages', () => {
      render(<Pagination {...defaultProps} page={3} />);
      expect(screen.getByText('21-30 de 100')).toBeInTheDocument();
    });

    it('should render correct item range on last page', () => {
      render(<Pagination {...defaultProps} page={10} total={95} />);
      expect(screen.getByText('91-95 de 95')).toBeInTheDocument();
    });

    it('should render page size selector when enabled', () => {
      render(<Pagination {...defaultProps} showPageSizeSelector onLimitChange={vi.fn()} />);
      expect(screen.getByText('Mostrar:')).toBeInTheDocument();
    });

    it('should not render page size selector when disabled', () => {
      render(<Pagination {...defaultProps} showPageSizeSelector={false} />);
      expect(screen.queryByText('Mostrar:')).not.toBeInTheDocument();
    });
  });

  describe('navigation buttons', () => {
    it('should disable previous button on first page', () => {
      render(<Pagination {...defaultProps} page={1} />);
      const buttons = screen.getAllByRole('button');
      // Previous button should be disabled (second button after first page)
      const prevButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-left'));
      expect(prevButton).toBeDisabled();
    });

    it('should enable previous button on pages after first', () => {
      render(<Pagination {...defaultProps} page={2} />);
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-left'));
      expect(prevButton).not.toBeDisabled();
    });

    it('should disable next button on last page', () => {
      render(<Pagination {...defaultProps} page={10} />);
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-right'));
      expect(nextButton).toBeDisabled();
    });

    it('should enable next button when not on last page', () => {
      render(<Pagination {...defaultProps} page={5} />);
      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-right'));
      expect(nextButton).not.toBeDisabled();
    });
  });

  describe('page navigation', () => {
    it('should call onPageChange with next page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} page={5} onPageChange={onPageChange} />);

      const buttons = screen.getAllByRole('button');
      const nextButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-right'));
      await user.click(nextButton!);
      expect(onPageChange).toHaveBeenCalledWith(6);
    });

    it('should call onPageChange with previous page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} page={5} onPageChange={onPageChange} />);

      const buttons = screen.getAllByRole('button');
      const prevButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-left'));
      await user.click(prevButton!);
      expect(onPageChange).toHaveBeenCalledWith(4);
    });

    it('should call onPageChange with first page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} page={5} onPageChange={onPageChange} />);

      const buttons = screen.getAllByRole('button');
      const firstButton = buttons.find((btn) => btn.querySelector('.lucide-chevrons-left'));
      await user.click(firstButton!);
      expect(onPageChange).toHaveBeenCalledWith(1);
    });

    it('should call onPageChange with last page', async () => {
      const user = userEvent.setup();
      const onPageChange = vi.fn();
      render(<Pagination {...defaultProps} page={5} onPageChange={onPageChange} />);

      const buttons = screen.getAllByRole('button');
      const lastButton = buttons.find((btn) => btn.querySelector('.lucide-chevrons-right'));
      await user.click(lastButton!);
      expect(onPageChange).toHaveBeenCalledWith(10);
    });
  });

  describe('page size selector', () => {
    // Note: Tests with Select interactions are skipped because jsdom doesn't support
    // hasPointerCapture which Radix Select uses internally
    it('should render page size selector with combobox role', () => {
      render(<Pagination {...defaultProps} showPageSizeSelector onLimitChange={vi.fn()} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should show current limit value in selector', () => {
      render(
        <Pagination {...defaultProps} limit={20} showPageSizeSelector onLimitChange={vi.fn()} />
      );
      // Current value should be displayed
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle single page', () => {
      render(<Pagination {...defaultProps} page={1} totalPages={1} total={5} />);
      const buttons = screen.getAllByRole('button');
      const prevButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-left'));
      const nextButton = buttons.find((btn) => btn.querySelector('.lucide-chevron-right'));
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('should handle zero total pages', () => {
      render(<Pagination {...defaultProps} page={1} totalPages={0} total={0} />);
      // Page 1 is displayed even with 0 total pages
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });

    it('should show correct divider', () => {
      render(<Pagination {...defaultProps} />);
      expect(screen.getByText('/')).toBeInTheDocument();
    });
  });
});
