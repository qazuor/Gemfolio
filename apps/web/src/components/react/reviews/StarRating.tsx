import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (newRating: number) => {
    if (interactive && onChange) {
      onChange(newRating);
    }
  };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }).map((_, index) => {
        const starNumber = index + 1;
        const isFilled = starNumber <= rating;
        const isHalfFilled = !isFilled && starNumber - 0.5 <= rating;

        return (
          <button
            key={`star-${starNumber}`}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starNumber)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
            aria-label={`${starNumber} ${starNumber === 1 ? 'estrella' : 'estrellas'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : isHalfFilled
                    ? 'fill-yellow-400/50 text-yellow-400'
                    : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
