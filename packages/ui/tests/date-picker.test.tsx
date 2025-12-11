import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from '../src/components/date-picker';

describe('DatePicker', () => {
  describe('rendering', () => {
    it('should render with default placeholder', () => {
      render(<DatePicker />);
      expect(screen.getByRole('button')).toHaveTextContent('Pick a date');
    });

    it('should render with custom placeholder', () => {
      render(<DatePicker placeholder="Select date" />);
      expect(screen.getByRole('button')).toHaveTextContent('Select date');
    });

    it('should render with selected date', () => {
      const date = new Date(2024, 0, 15);
      render(<DatePicker date={date} />);
      expect(screen.getByRole('button')).toHaveTextContent('January 15th, 2024');
    });

    it('should render with custom className', () => {
      render(<DatePicker className="custom-class" />);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
  });

  describe('disabled state', () => {
    it('should render as disabled', () => {
      render(<DatePicker disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should not open calendar when disabled', async () => {
      const user = userEvent.setup();
      render(<DatePicker disabled />);

      await user.click(screen.getByRole('button'));

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should open calendar on click', async () => {
      const user = userEvent.setup();
      render(<DatePicker />);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });

    it('should call onDateChange when date is selected', async () => {
      const user = userEvent.setup();
      const handleDateChange = vi.fn();
      render(<DatePicker onDateChange={handleDateChange} />);

      await user.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      const dayCell = screen.getByRole('gridcell', { name: '15' });
      const dayButton = dayCell.querySelector('button') || dayCell;
      await user.click(dayButton);

      expect(handleDateChange).toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('should apply muted text when no date is selected', () => {
      render(<DatePicker />);
      expect(screen.getByRole('button')).toHaveClass('text-muted-foreground');
    });

    it('should not apply muted text when date is selected', () => {
      const date = new Date(2024, 0, 15);
      render(<DatePicker date={date} />);
      expect(screen.getByRole('button')).not.toHaveClass('text-muted-foreground');
    });
  });

  describe('calendar icon', () => {
    it('should render calendar icon', () => {
      render(<DatePicker />);
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
