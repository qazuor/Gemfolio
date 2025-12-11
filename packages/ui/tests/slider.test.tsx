import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from '../src/components/slider';

describe('Slider', () => {
  describe('rendering', () => {
    it('should render slider', () => {
      render(<Slider />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('should have default classes', () => {
      render(<Slider data-testid="slider" />);
      const slider = screen.getByTestId('slider');
      expect(slider).toHaveClass('relative');
      expect(slider).toHaveClass('flex');
      expect(slider).toHaveClass('w-full');
    });
  });

  describe('value', () => {
    it('should set aria-valuenow based on value prop', () => {
      render(<Slider value={[50]} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '50');
    });

    it('should set defaultValue', () => {
      render(<Slider defaultValue={[25]} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '25');
    });

    it('should handle value of 0', () => {
      render(<Slider value={[0]} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0');
    });

    it('should handle value of 100', () => {
      render(<Slider value={[100]} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('min and max', () => {
    it('should set aria-valuemin', () => {
      render(<Slider min={10} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemin', '10');
    });

    it('should set aria-valuemax', () => {
      render(<Slider max={200} />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemax', '200');
    });

    it('should have default min of 0', () => {
      render(<Slider />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemin', '0');
    });

    it('should have default max of 100', () => {
      render(<Slider />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('step', () => {
    it('should support step prop', () => {
      render(<Slider step={10} />);
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should merge custom className', () => {
      render(<Slider className="custom-slider" data-testid="slider" />);
      expect(screen.getByTestId('slider')).toHaveClass('custom-slider');
    });
  });

  describe('disabled state', () => {
    it('should disable slider', () => {
      render(<Slider disabled />);
      expect(screen.getByRole('slider')).toHaveAttribute('data-disabled', '');
    });

    it('should have disabled attribute when disabled', () => {
      render(<Slider disabled data-testid="slider" />);
      expect(screen.getByTestId('slider')).toHaveAttribute('data-disabled', '');
    });
  });

  describe('events', () => {
    it('should call onValueChange when value changes', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      render(<Slider defaultValue={[50]} onValueChange={handleValueChange} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{ArrowRight}');

      expect(handleValueChange).toHaveBeenCalled();
    });

    it('should call onValueCommit when value is committed', async () => {
      const user = userEvent.setup();
      const handleValueCommit = vi.fn();
      render(<Slider defaultValue={[50]} onValueCommit={handleValueCommit} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{ArrowRight}');

      expect(handleValueCommit).toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('should increase value with ArrowRight', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      render(<Slider defaultValue={[50]} onValueChange={handleValueChange} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{ArrowRight}');

      expect(handleValueChange).toHaveBeenCalledWith([51]);
    });

    it('should decrease value with ArrowLeft', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      render(<Slider defaultValue={[50]} onValueChange={handleValueChange} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{ArrowLeft}');

      expect(handleValueChange).toHaveBeenCalledWith([49]);
    });

    it('should increase value with ArrowUp', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      render(<Slider defaultValue={[50]} onValueChange={handleValueChange} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{ArrowUp}');

      expect(handleValueChange).toHaveBeenCalledWith([51]);
    });

    it('should decrease value with ArrowDown', async () => {
      const user = userEvent.setup();
      const handleValueChange = vi.fn();
      render(<Slider defaultValue={[50]} onValueChange={handleValueChange} />);

      const slider = screen.getByRole('slider');
      slider.focus();
      await user.keyboard('{ArrowDown}');

      expect(handleValueChange).toHaveBeenCalledWith([49]);
    });
  });

  describe('orientation', () => {
    it('should support horizontal orientation by default', () => {
      render(<Slider />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should support vertical orientation', () => {
      render(<Slider orientation="vertical" />);
      expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical');
    });
  });
});
