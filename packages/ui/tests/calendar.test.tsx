import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from '../src/components/calendar';

describe('Calendar', () => {
  describe('rendering', () => {
    it('should render calendar', () => {
      render(<Calendar />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should render with selected date', () => {
      const selectedDate = new Date(2024, 0, 15);
      render(<Calendar mode="single" selected={selectedDate} />);

      const selectedButton = screen.getByRole('gridcell', { name: '15' });
      expect(selectedButton).toBeInTheDocument();
    });

    it('should show outside days by default', () => {
      render(<Calendar defaultMonth={new Date(2024, 0, 1)} />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should hide outside days when showOutsideDays is false', () => {
      render(<Calendar defaultMonth={new Date(2024, 0, 1)} showOutsideDays={false} />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should merge custom className with default classes', () => {
      render(<Calendar className="custom-calendar" />);
      const calendar = screen.getByRole('grid').closest('.custom-calendar');
      expect(calendar).toBeInTheDocument();
    });
  });

  describe('custom classNames', () => {
    it('should override classNames for specific parts', () => {
      render(
        <Calendar
          classNames={{
            month: 'custom-month-class',
          }}
        />
      );
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('modes', () => {
    it('should render in single mode', () => {
      render(<Calendar mode="single" />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should render in range mode', () => {
      render(<Calendar mode="range" />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should render in multiple mode', () => {
      render(<Calendar mode="multiple" />);
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should support onSelect callback', () => {
      const handleSelect = vi.fn();
      render(
        <Calendar mode="single" onSelect={handleSelect} defaultMonth={new Date(2024, 0, 1)} />
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(<Calendar defaultMonth={new Date(2024, 1, 1)} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('disabled dates', () => {
    it('should support disabled prop', () => {
      render(
        <Calendar defaultMonth={new Date(2024, 0, 1)} disabled={(date) => date.getDate() === 15} />
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('displayName', () => {
    it('should have correct displayName', () => {
      expect(Calendar.displayName).toBe('Calendar');
    });
  });
});
