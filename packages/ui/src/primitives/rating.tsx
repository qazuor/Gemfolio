import { Star } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils';

export interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'default' | 'lg';
  showValue?: boolean;
  readonly?: boolean;
  onValueChange?: (value: number) => void;
}

const sizeClasses = {
  sm: 'h-3 w-3',
  default: 'h-4 w-4',
  lg: 'h-5 w-5',
};

interface StarItem {
  key: string;
  position: number;
}

function Rating({
  value,
  max = 5,
  size = 'default',
  showValue = false,
  readonly = true,
  onValueChange,
  className,
  ...props
}: RatingProps) {
  const id = React.useId();
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const displayValue = hoverValue ?? value;

  const stars = React.useMemo<StarItem[]>(
    () =>
      Array.from({ length: max }, (_, i) => ({
        key: `${id}-star-${i}`,
        position: i,
      })),
    [id, max]
  );

  const handleClick = (position: number) => {
    if (!readonly && onValueChange) {
      onValueChange(position + 1);
    }
  };

  const handleMouseEnter = (position: number) => {
    if (!readonly) {
      setHoverValue(position + 1);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} {...props}>
      {stars.map((star) => {
        const isFilled = star.position < displayValue;
        const isHalf = !isFilled && star.position < displayValue + 0.5;

        return (
          <button
            key={star.key}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star.position)}
            onMouseEnter={() => handleMouseEnter(star.position)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              'focus:outline-none',
              !readonly && 'cursor-pointer hover:scale-110 transition-transform'
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : isHalf
                    ? 'fill-yellow-400/50 text-yellow-400'
                    : 'fill-transparent text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        );
      })}
      {showValue && <span className="ml-1 text-sm text-muted-foreground">{value.toFixed(1)}</span>}
    </div>
  );
}

export { Rating };
