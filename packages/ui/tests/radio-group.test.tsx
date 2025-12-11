import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Label } from '../src/components/label';
import { RadioGroup, RadioGroupItem } from '../src/components/radio-group';

describe('RadioGroup', () => {
  describe('rendering', () => {
    it('should render radio group', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );
      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('should render multiple radio items', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
          <RadioGroupItem value="option3" />
        </RadioGroup>
      );

      expect(screen.getAllByRole('radio')).toHaveLength(3);
    });
  });

  describe('RadioGroup', () => {
    it('should have default classes', () => {
      render(
        <RadioGroup data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-group')).toHaveClass('grid');
      expect(screen.getByTestId('radio-group')).toHaveClass('gap-2');
    });

    it('should merge custom className', () => {
      render(
        <RadioGroup className="custom-group" data-testid="radio-group">
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByTestId('radio-group')).toHaveClass('custom-group');
    });
  });

  describe('RadioGroupItem', () => {
    it('should render radio button', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole('radio')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      const radio = screen.getByRole('radio');
      expect(radio).toHaveClass('aspect-square');
      expect(radio).toHaveClass('h-4');
      expect(radio).toHaveClass('w-4');
    });

    it('should merge custom className', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" className="custom-radio" />
        </RadioGroup>
      );

      expect(screen.getByRole('radio')).toHaveClass('custom-radio');
    });
  });

  describe('selection', () => {
    it('should select item on click', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      await user.click(radios[0]);

      expect(radios[0]).toBeChecked();
      expect(radios[1]).not.toBeChecked();
    });

    it('should switch selection', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      await user.click(radios[0]);
      expect(radios[0]).toBeChecked();

      await user.click(radios[1]);
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    });

    it('should call onValueChange', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      render(
        <RadioGroup onValueChange={handleValueChange}>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      await user.click(screen.getAllByRole('radio')[0]);
      expect(handleValueChange).toHaveBeenCalledWith('option1');
    });
  });

  describe('controlled state', () => {
    it('should respect value prop', () => {
      render(
        <RadioGroup value="option2">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).not.toBeChecked();
      expect(radios[1]).toBeChecked();
    });

    it('should respect defaultValue', () => {
      render(
        <RadioGroup defaultValue="option1">
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      expect(screen.getAllByRole('radio')[0]).toBeChecked();
    });
  });

  describe('disabled state', () => {
    it('should disable entire group', () => {
      render(
        <RadioGroup disabled>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      screen.getAllByRole('radio').forEach((radio) => {
        expect(radio).toBeDisabled();
      });
    });

    it('should disable individual item', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" disabled />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      expect(radios[0]).toBeDisabled();
      expect(radios[1]).not.toBeDisabled();
    });
  });

  describe('with labels', () => {
    it('should work with labels', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option1" id="option1" />
            <Label htmlFor="option1">Option 1</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="option2" id="option2" />
            <Label htmlFor="option2">Option 2</Label>
          </div>
        </RadioGroup>
      );

      await user.click(screen.getByText('Option 1'));
      expect(screen.getAllByRole('radio')[0]).toBeChecked();
    });
  });

  describe('accessibility', () => {
    it('should have role radiogroup', () => {
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
        </RadioGroup>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    });

    it('should navigate with keyboard', async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup>
          <RadioGroupItem value="option1" />
          <RadioGroupItem value="option2" />
        </RadioGroup>
      );

      const radios = screen.getAllByRole('radio');
      radios[0].focus();
      await user.keyboard('{ArrowDown}');

      expect(radios[1]).toHaveFocus();
    });
  });
});
