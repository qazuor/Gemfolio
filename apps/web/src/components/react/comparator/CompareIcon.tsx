import { useStore } from '@nanostores/react';
import { Scale } from 'lucide-react';
import { useEffect, useState } from 'react';
import { $compareCount } from '@/stores/comparator';

interface CompareIconProps {
  href?: string;
}

export default function CompareIcon({ href = '/comparar' }: CompareIconProps) {
  const compareCount = useStore($compareCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <a
      href={href}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-primary"
      aria-label="Ver comparador"
      title="Comparar productos"
    >
      <Scale className="h-4 w-4" />
      {mounted && compareCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {compareCount}
        </span>
      )}
    </a>
  );
}
