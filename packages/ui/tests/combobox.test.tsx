import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Combobox, type ComboboxOption } from '../src/components/combobox';

const options: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('Combobox', () => {
  describe('rendering', () => {
    it('should render with default placeholder', () => {
      render(<Combobox options={options} />);
      expect(screen.getByRole('combobox')).toHaveTextContent('Select option...');
    });

    it('should render with custom placeholder', () => {
      render(<Combobox options={options} placeholder="Choose a fruit" />);
      expect(screen.getByRole('combobox')).toHaveTextContent('Choose a fruit');
    });

    it('should render with selected value', () => {
      render(<Combobox options={options} value="apple" />);
      expect(screen.getByRole('combobox')).toHaveTextContent('Apple');
    });

    it('should render with custom className', () => {
      render(<Combobox options={options} className="custom-class" />);
      expect(screen.getByRole('combobox')).toHaveClass('custom-class');
    });

    it('should render with custom searchPlaceholder', () => {
      render(<Combobox options={options} searchPlaceholder="Search fruits..." />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render with custom emptyMessage', () => {
      render(<Combobox options={[]} emptyMessage="No fruits found." />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should render as disabled', () => {
      render(<Combobox options={options} disabled />);
      expect(screen.getByRole('combobox')).toBeDisabled();
    });

    it('should have correct styles when disabled', () => {
      render(<Combobox options={options} disabled />);
      expect(screen.getByRole('combobox')).toHaveClass('disabled:opacity-50');
    });
  });

  describe('accessibility', () => {
    it('should have aria-expanded attribute', () => {
      render(<Combobox options={options} />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have combobox role', () => {
      render(<Combobox options={options} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('button styling', () => {
    it('should have default button classes', () => {
      render(<Combobox options={options} />);
      expect(screen.getByRole('combobox')).toHaveClass('justify-between');
    });

    it('should render chevron icon', () => {
      render(<Combobox options={options} />);
      const button = screen.getByRole('combobox');
      expect(button.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('options', () => {
    it('should work with empty options array', () => {
      render(<Combobox options={[]} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should work with single option', () => {
      render(<Combobox options={[{ value: 'single', label: 'Single' }]} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should work with many options', () => {
      const manyOptions = Array.from({ length: 100 }, (_, i) => ({
        value: `option-${i}`,
        label: `Option ${i}`,
      }));
      render(<Combobox options={manyOptions} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('should open popover on click', async () => {
      const user = userEvent.setup();
      render(<Combobox options={options} />);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);

      expect(combobox).toHaveAttribute('aria-expanded', 'true');
    });

    it('should call onValueChange when option is selected', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Combobox options={options} onValueChange={onValueChange} />);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);

      const optionElement = screen.getByRole('option', { name: 'Apple' });
      await user.click(optionElement);

      expect(onValueChange).toHaveBeenCalledWith('apple');
    });

    it('should clear value when same option is selected', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(<Combobox options={options} value="apple" onValueChange={onValueChange} />);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);

      const optionElement = screen.getByRole('option', { name: 'Apple' });
      await user.click(optionElement);

      expect(onValueChange).toHaveBeenCalledWith('');
    });

    it('should close popover after selection', async () => {
      const user = userEvent.setup();
      render(<Combobox options={options} />);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);

      const optionElement = screen.getByRole('option', { name: 'Banana' });
      await user.click(optionElement);

      expect(combobox).toHaveAttribute('aria-expanded', 'false');
    });

    it('should show check icon for selected option', async () => {
      const user = userEvent.setup();
      render(<Combobox options={options} value="banana" />);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);

      // The selected option should be visible with check indicator
      const bananaOption = screen.getByRole('option', { name: 'Banana' });
      expect(bananaOption).toBeInTheDocument();
      // The check icon is an SVG inside the option
      const checkIcon = bananaOption.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should handle selection without onValueChange prop', async () => {
      const user = userEvent.setup();
      render(<Combobox options={options} />);

      const combobox = screen.getByRole('combobox');
      await user.click(combobox);

      const optionElement = screen.getByRole('option', { name: 'Cherry' });
      await user.click(optionElement);

      // Should not throw error even without callback
      expect(combobox).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
