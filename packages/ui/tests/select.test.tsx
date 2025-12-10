import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '../src/components/select';

describe('Select', () => {
  describe('SelectTrigger', () => {
    it('should render with placeholder', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
        </Select>
      );
      expect(screen.getByText('Select option')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('flex');
      expect(trigger).toHaveClass('h-9');
      expect(trigger).toHaveClass('w-full');
      expect(trigger).toHaveClass('rounded-md');
      expect(trigger).toHaveClass('border');
    });

    it('should merge custom className', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger" className="custom-class">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('custom-class');
      expect(trigger).toHaveClass('flex');
    });

    it('should render chevron icon', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      const svg = trigger.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <Select disabled>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeDisabled();
    });
  });

  describe('controlled value', () => {
    it('should display selected value', () => {
      render(
        <Select value="option1">
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      );
      expect(screen.getByText('Option 1')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper role attributes', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
    });

    it('should have aria-expanded attribute', () => {
      render(
        <Select>
          <SelectTrigger data-testid="trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
        </Select>
      );
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  // Note: Tests requiring Select dropdown interaction are skipped
  // because jsdom doesn't support hasPointerCapture which Radix uses
  describe('component exports', () => {
    it('should export all components', () => {
      expect(Select).toBeDefined();
      expect(SelectContent).toBeDefined();
      expect(SelectGroup).toBeDefined();
      expect(SelectItem).toBeDefined();
      expect(SelectLabel).toBeDefined();
      expect(SelectSeparator).toBeDefined();
      expect(SelectTrigger).toBeDefined();
      expect(SelectValue).toBeDefined();
    });
  });
});
