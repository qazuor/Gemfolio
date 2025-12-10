import { useStore } from '@nanostores/react';
import { Check, Minus, Scale, ShoppingCart, X } from 'lucide-react';
import { addToCart } from '@/stores/cart';
import {
  $comparator,
  clearComparator,
  getComparisonData,
  MAX_COMPARE_ITEMS,
  removeFromCompare,
} from '@/stores/comparator';
import { openCartDrawer } from '@/stores/ui';

export default function ComparatorPage() {
  const comparator = useStore($comparator);
  const comparisonData = getComparisonData();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  };

  const formatAttributeValue = (value: string | number | boolean | null): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }
    return String(value);
  };

  const handleRemove = (productId: string) => {
    removeFromCompare(productId);
  };

  const handleClearAll = () => {
    if (confirm('¿Estás seguro de eliminar todos los productos del comparador?')) {
      clearComparator();
    }
  };

  const handleAddToCart = (product: (typeof comparator)[0]) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      maxQuantity: 10, // Default max
    });
    openCartDrawer();
  };

  // Attribute label mapping for better display
  const attributeLabels: Record<string, string> = {
    material: 'Material',
    weight: 'Peso',
    dimensions: 'Dimensiones',
    color: 'Color',
    size: 'Tamaño',
    warranty: 'Garantía',
    brand: 'Marca',
    origin: 'Origen',
    certification: 'Certificación',
    purity: 'Pureza',
    carats: 'Quilates',
    cut: 'Corte',
    clarity: 'Claridad',
    stone_type: 'Tipo de piedra',
  };

  const getAttributeLabel = (key: string): string => {
    return attributeLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (comparator.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Scale className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-xl font-semibold mb-2">El comparador está vacío</h2>
        <p className="text-muted-foreground mb-6">
          Agrega productos para compararlos y encontrar el ideal para ti
        </p>
        <a
          href="/catalogo"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          Explorar productos
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          {comparator.length} de {MAX_COMPARE_ITEMS} productos
        </p>
        <div className="flex gap-2">
          <a
            href="/catalogo"
            className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors ${
              comparator.length >= MAX_COMPARE_ITEMS ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            Agregar más
          </a>
          <button
            type="button"
            onClick={handleClearAll}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            Limpiar todo
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          {/* Products Row */}
          <thead>
            <tr>
              <th className="w-40 p-4 text-left text-sm font-medium text-muted-foreground border-b">
                Producto
              </th>
              {comparisonData.products.map((product) => (
                <th key={product.id} className="p-4 border-b min-w-[200px]">
                  <div className="relative">
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(product.id)}
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      aria-label="Quitar del comparador"
                    >
                      <X className="h-3 w-3" />
                    </button>

                    {/* Product Image */}
                    <a href={`/producto/${product.slug}`} className="block">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="mx-auto h-32 w-32 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-lg bg-muted">
                          <Scale className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </a>

                    {/* Product Name */}
                    <a
                      href={`/producto/${product.slug}`}
                      className="mt-3 block text-sm font-medium hover:text-primary transition-colors line-clamp-2"
                    >
                      {product.name}
                    </a>

                    {/* Category */}
                    {product.category && (
                      <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
                    )}
                  </div>
                </th>
              ))}
              {/* Empty Slots */}
              {Array.from({ length: MAX_COMPARE_ITEMS - comparator.length }).map((_, i) => (
                <th
                  key={`empty-slot-${MAX_COMPARE_ITEMS - comparator.length - i}`}
                  className="p-4 border-b min-w-[200px]"
                >
                  <a
                    href="/catalogo"
                    className="flex flex-col items-center justify-center h-32 rounded-lg border-2 border-dashed border-muted hover:border-primary transition-colors"
                  >
                    <Scale className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 text-sm text-muted-foreground">Agregar producto</span>
                  </a>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Price Row */}
            <tr className="bg-muted/30">
              <td className="p-4 text-sm font-medium border-b">Precio</td>
              {comparisonData.products.map((product) => (
                <td key={product.id} className="p-4 text-center border-b">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.comparePrice)}
                      </span>
                    )}
                    {product.comparePrice && product.comparePrice > product.price && (
                      <span className="text-xs text-green-600 font-medium">
                        {Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                      </span>
                    )}
                  </div>
                </td>
              ))}
              {Array.from({ length: MAX_COMPARE_ITEMS - comparator.length }).map((_, i) => (
                <td
                  key={`empty-price-slot-${MAX_COMPARE_ITEMS - comparator.length - i}`}
                  className="p-4 border-b"
                />
              ))}
            </tr>

            {/* Attribute Rows */}
            {comparisonData.attributes.map((attr, index) => (
              <tr key={attr.name} className={index % 2 === 0 ? '' : 'bg-muted/30'}>
                <td className="p-4 text-sm font-medium border-b">{getAttributeLabel(attr.name)}</td>
                {attr.values.map((item) => {
                  const displayValue = formatAttributeValue(item.value);
                  const isBoolean = typeof item.value === 'boolean';

                  return (
                    <td key={item.productId} className="p-4 text-center text-sm border-b">
                      {isBoolean ? (
                        item.value ? (
                          <Check className="mx-auto h-5 w-5 text-green-600" />
                        ) : (
                          <Minus className="mx-auto h-5 w-5 text-muted-foreground" />
                        )
                      ) : (
                        <span className={displayValue === '-' ? 'text-muted-foreground' : ''}>
                          {displayValue}
                        </span>
                      )}
                    </td>
                  );
                })}
                {Array.from({ length: MAX_COMPARE_ITEMS - comparator.length }).map((_, i) => (
                  <td
                    key={`empty-attr-${attr.name}-slot-${MAX_COMPARE_ITEMS - comparator.length - i}`}
                    className="p-4 border-b"
                  />
                ))}
              </tr>
            ))}

            {/* Add to Cart Row */}
            <tr>
              <td className="p-4 text-sm font-medium">Acción</td>
              {comparisonData.products.map((product) => (
                <td key={product.id} className="p-4 text-center">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Agregar
                  </button>
                </td>
              ))}
              {Array.from({ length: MAX_COMPARE_ITEMS - comparator.length }).map((_, i) => (
                <td
                  key={`empty-action-slot-${MAX_COMPARE_ITEMS - comparator.length - i}`}
                  className="p-4"
                />
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View (hidden on desktop) */}
      <div className="md:hidden space-y-4">
        {comparisonData.products.map((product) => (
          <div key={product.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start gap-4">
              {/* Image */}
              <a href={`/producto/${product.slug}`} className="shrink-0">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted">
                    <Scale className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </a>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={`/producto/${product.slug}`}
                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                  >
                    {product.name}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemove(product.id)}
                    className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    aria-label="Quitar del comparador"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-lg font-bold mt-1">{formatCurrency(product.price)}</p>
              </div>
            </div>

            {/* Attributes */}
            <div className="mt-4 space-y-2">
              {comparisonData.attributes.slice(0, 5).map((attr) => {
                const item = attr.values.find((v) => v.productId === product.id);
                const displayValue = formatAttributeValue(item?.value ?? null);

                return (
                  <div key={attr.name} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{getAttributeLabel(attr.name)}</span>
                    <span className={displayValue === '-' ? 'text-muted-foreground' : ''}>
                      {displayValue}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              onClick={() => handleAddToCart(product)}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Agregar al carrito
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
