import { Minus, Plus } from 'lucide-react';
import type * as React from 'react';
import { Button } from '../components/button';
import { Input } from '../components/input';
import { cn } from '../lib/utils';

export interface QuantitySelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const sizeClasses = {
  sm: {
    button: 'h-7 w-7',
    input: 'h-7 w-12 text-sm',
    icon: 'h-3 w-3',
  },
  default: {
    button: 'h-9 w-9',
    input: 'h-9 w-14',
    icon: 'h-4 w-4',
  },
  lg: {
    button: 'h-11 w-11',
    input: 'h-11 w-16 text-lg',
    icon: 'h-5 w-5',
  },
};

function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  size = 'default',
  className,
  ...props
}: QuantitySelectorProps) {
  const sizes = sizeClasses[size];

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(e.target.value, 10);
    if (!Number.isNaN(inputValue)) {
      const newValue = Math.max(min, Math.min(max, inputValue));
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    if (value < min) {
      onChange(min);
    } else if (value > max) {
      onChange(max);
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-1', className)} {...props}>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled || value <= min}
        onClick={handleDecrement}
        className={sizes.button}
        aria-label="Decrease quantity"
      >
        <Minus className={sizes.icon} />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={disabled}
        min={min}
        max={max}
        className={cn(
          sizes.input,
          'text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
        )}
        aria-label="Quantity"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled || value >= max}
        onClick={handleIncrement}
        className={sizes.button}
        aria-label="Increase quantity"
      >
        <Plus className={sizes.icon} />
      </Button>
    </div>
  );
}

export { QuantitySelector };
