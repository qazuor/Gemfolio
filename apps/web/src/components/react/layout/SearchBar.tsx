import { Loader2, Search, X } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: string;
  image?: string;
  category?: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.data || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      window.location.href = `/buscar?q=${encodeURIComponent(query.trim())}`;
    }
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  return (
    <div ref={containerRef} className="relative w-full md:w-72">
      <form onSubmit={handleSubmit}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Buscar productos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
        {!isLoading && query && (
          <button
            type="button"
            onClick={clearQuery}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border bg-background shadow-lg">
          {results.length > 0 ? (
            <>
              <ul className="max-h-80 overflow-y-auto">
                {results.map((product) => (
                  <li key={product.id}>
                    <a
                      href={`/producto/${product.slug}`}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-muted-foreground">
                          <Search className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        {product.category && (
                          <p className="truncate text-xs text-muted-foreground">
                            {product.category}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={`/buscar?q=${encodeURIComponent(query)}`}
                className="block border-t px-3 py-2 text-center text-sm text-primary hover:bg-accent"
                onClick={() => setIsOpen(false)}
              >
                Ver todos los resultados
              </a>
            </>
          ) : (
            <p className="px-3 py-4 text-center text-sm text-muted-foreground">
              No se encontraron productos
            </p>
          )}
        </div>
      )}
    </div>
  );
}
