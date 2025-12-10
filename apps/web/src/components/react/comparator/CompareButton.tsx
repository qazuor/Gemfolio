import { useStore } from '@nanostores/react';
import { Check, Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  $canAddToCompare,
  $comparator,
  type CompareProduct,
  MAX_COMPARE_ITEMS,
  toggleCompare,
} from '@/stores/comparator';

interface CompareButtonProps {
  product: CompareProduct;
  variant?: 'icon' | 'button' | 'icon-sm';
  className?: string;
}

export default function CompareButton({
  product,
  variant = 'icon',
  className = '',
}: CompareButtonProps) {
  const comparator = useStore($comparator);
  const canAdd = useStore($canAddToCompare);
  const [isInComparator, setIsInComparator] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setIsInComparator(comparator.some((p) => p.id === product.id));
  }, [comparator, product.id]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product is not in comparator and we're at max, show tooltip
    if (!isInComparator && !canAdd) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 3000);
      return;
    }

    setIsAnimating(true);
    const added = toggleCompare(product);
    setIsInComparator(added);

    // Dispatch event for analytics or other components
    window.dispatchEvent(
      new CustomEvent('comparator-updated', {
        detail: { productId: product.id, added },
      })
    );

    setTimeout(() => setIsAnimating(false), 300);
  };

  if (variant === 'icon-sm') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          className={`group flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-all hover:bg-white hover:scale-110 ${className}`}
          aria-label={isInComparator ? 'Quitar de comparar' : 'Agregar para comparar'}
          title={isInComparator ? 'Quitar de comparar' : 'Agregar para comparar'}
        >
          {isInComparator ? (
            <Check
              className={`h-4 w-4 text-primary transition-all ${isAnimating ? 'scale-125' : ''}`}
            />
          ) : (
            <Scale
              className={`h-4 w-4 text-gray-600 group-hover:text-primary transition-all ${
                isAnimating ? 'scale-125' : ''
              }`}
            />
          )}
        </button>
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-50">
            Máximo {MAX_COMPARE_ITEMS} productos
          </div>
        )}
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          className={`group flex h-10 w-10 items-center justify-center rounded-full border bg-background transition-all hover:border-primary hover:scale-105 ${
            isInComparator ? 'border-primary' : 'border-border'
          } ${className}`}
          aria-label={isInComparator ? 'Quitar de comparar' : 'Agregar para comparar'}
          title={isInComparator ? 'Quitar de comparar' : 'Agregar para comparar'}
        >
          {isInComparator ? (
            <Check
              className={`h-5 w-5 text-primary transition-all ${isAnimating ? 'scale-125' : ''}`}
            />
          ) : (
            <Scale
              className={`h-5 w-5 text-muted-foreground group-hover:text-primary transition-all ${
                isAnimating ? 'scale-125' : ''
              }`}
            />
          )}
        </button>
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-50">
            Máximo {MAX_COMPARE_ITEMS} productos
          </div>
        )}
      </div>
    );
  }

  // variant === 'button'
  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleToggle}
        className={`group flex h-12 items-center justify-center gap-2 rounded-lg border px-4 transition-all hover:border-primary ${
          isInComparator ? 'border-primary bg-primary/5' : 'border-border bg-background'
        } ${className}`}
        aria-label={isInComparator ? 'Quitar de comparar' : 'Agregar para comparar'}
      >
        {isInComparator ? (
          <Check
            className={`h-5 w-5 text-primary transition-all ${isAnimating ? 'scale-125' : ''}`}
          />
        ) : (
          <Scale
            className={`h-5 w-5 text-muted-foreground group-hover:text-primary transition-all ${
              isAnimating ? 'scale-125' : ''
            }`}
          />
        )}
        <span
          className={`font-medium ${
            isInComparator ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
          }`}
        >
          {isInComparator ? 'En comparador' : 'Comparar'}
        </span>
      </button>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-50">
          Máximo {MAX_COMPARE_ITEMS} productos
        </div>
      )}
    </div>
  );
}
