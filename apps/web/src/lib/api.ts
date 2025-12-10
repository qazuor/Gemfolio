const API_BASE = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  categoryId: string | null;
  price: string;
  comparePrice: string | null;
  cost: string | null;
  sku: string | null;
  stock: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  status: 'draft' | 'active' | 'archived';
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category | null;
  images?: ProductImage[];
  tags?: Tag[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
  isPrimary: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  order: number;
  status: 'active' | 'inactive';
  productCount?: number;
  children?: Category[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  color: string | null;
}

export interface Bundle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: string;
  comparePrice: string | null;
  status: 'draft' | 'active' | 'archived';
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
  updatedAt: string;
  items?: BundleItem[];
}

export interface BundleItem {
  id: string;
  bundleId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  product?: Product;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Page {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  status: 'draft' | 'published';
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  tag?: string;
  search?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortDirection?: 'asc' | 'desc';
}

// API Functions
export async function getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();

  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.categoryId) params.set('categoryId', filters.categoryId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters?.maxPrice) params.set('maxPrice', String(filters.maxPrice));
  if (filters?.inStock !== undefined) params.set('inStock', String(filters.inStock));
  if (filters?.tag) params.set('tag', filters.tag);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.sortBy) params.set('sortBy', filters.sortBy);
  if (filters?.sortDirection) params.set('sortDirection', filters.sortDirection);

  const response = await fetch(`${API_BASE}/products?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar productos');
  }
  const result = await response.json();
  // Map API response structure to expected interface
  return {
    data: result.data,
    pagination: result.meta || result.pagination,
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const response = await fetch(`${API_BASE}/products/${slug}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Error al cargar producto');
  }
  const result = await response.json();
  return result.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE}/categories`);
  if (!response.ok) {
    throw new Error('Error al cargar categorías');
  }
  const result = await response.json();
  return result.data;
}

export async function getCategoryBySlug(
  slug: string
): Promise<{ category: Category; products: PaginatedResponse<Product> } | null> {
  const response = await fetch(`${API_BASE}/categories/${slug}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Error al cargar categoría');
  }
  const result = await response.json();
  const categoryData = result.data;

  // Transform API response to expected format
  const products = categoryData.products || [];
  return {
    category: {
      ...categoryData,
      children: categoryData.children || [],
    },
    products: {
      data: products,
      pagination: {
        page: 1,
        limit: products.length,
        total: products.length,
        totalPages: 1,
      },
    },
  };
}

export async function searchProducts(query: string, limit = 10): Promise<Product[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const response = await fetch(`${API_BASE}/search?${params}`);
  if (!response.ok) {
    throw new Error('Error en búsqueda');
  }
  const result = await response.json();
  return result.data;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const response = await getProducts({
    tag: 'destacado',
    status: 'active',
    limit,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  return response.data;
}

export async function getNewProducts(limit = 8): Promise<Product[]> {
  const response = await getProducts({
    tag: 'nuevo',
    status: 'active',
    limit,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  return response.data;
}

export async function getOfferProducts(limit = 8): Promise<Product[]> {
  const response = await getProducts({
    tag: 'oferta',
    status: 'active',
    limit,
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  return response.data;
}

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 4
): Promise<Product[]> {
  const response = await getProducts({
    categoryId,
    status: 'active',
    limit: limit + 1, // Get one extra in case we need to filter
    sortBy: 'createdAt',
    sortDirection: 'desc',
  });
  return response.data.filter((p) => p.id !== excludeProductId).slice(0, limit);
}

export async function getBundles(limit = 10): Promise<Bundle[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const response = await fetch(`${API_BASE}/bundles?${params}`);
  if (!response.ok) {
    throw new Error('Error al cargar bundles');
  }
  const result = await response.json();
  return result.data;
}

export async function getBundleBySlug(slug: string): Promise<Bundle | null> {
  const response = await fetch(`${API_BASE}/bundles/${slug}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Error al cargar bundle');
  }
  const result = await response.json();
  return result.data;
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const response = await fetch(`${API_BASE}/pages/${slug}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Error al cargar página');
  }
  const result = await response.json();
  return result.data;
}

// Settings Types
export interface BrandingSettings {
  logo: string;
  logoDark: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: 'playfair' | 'cormorant' | 'libre-baskerville' | 'lora' | 'merriweather' | 'inter';
  bodyFont: 'inter' | 'open-sans' | 'roboto' | 'lato' | 'source-sans';
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full';
  headerStyle: 'transparent' | 'solid' | 'gradient';
  buttonStyle: 'solid' | 'outline' | 'soft';
  cardStyle: 'minimal' | 'bordered' | 'elevated' | 'glass';
  heroStyle: 'full' | 'split' | 'minimal';
  showFeaturedCategories: boolean;
  showTestimonials: boolean;
  showNewsletter: boolean;
}

export interface GeneralSettings {
  businessName: string;
  email: string;
  phone: string;
  address: string;
  currency: 'ARS' | 'USD';
  timezone: string;
}

export interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  ogImage: string;
  googleAnalyticsId?: string;
}

export interface SocialSettings {
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  tiktok?: string;
}

export interface PublicSettings {
  general?: GeneralSettings;
  branding?: BrandingSettings;
  seo?: SeoSettings;
  social?: SocialSettings;
}

// Default settings (fallback values)
export const defaultBrandingSettings: BrandingSettings = {
  logo: '',
  logoDark: '',
  favicon: '',
  primaryColor: '#B8860B',
  secondaryColor: '#1A1A1A',
  accentColor: '#D4AF37',
  headingFont: 'playfair',
  bodyFont: 'inter',
  borderRadius: 'medium',
  headerStyle: 'solid',
  buttonStyle: 'solid',
  cardStyle: 'elevated',
  heroStyle: 'full',
  showFeaturedCategories: true,
  showTestimonials: true,
  showNewsletter: true,
};

export const defaultGeneralSettings: GeneralSettings = {
  businessName: 'Gemfolio',
  email: 'contacto@gemfolio.com',
  phone: '+54 11 1234-5678',
  address: 'Buenos Aires, Argentina',
  currency: 'ARS',
  timezone: 'America/Argentina/Buenos_Aires',
};

export const defaultSeoSettings: SeoSettings = {
  siteTitle: 'Gemfolio - Joyería Fina',
  siteDescription: 'Descubre nuestra colección exclusiva de joyería fina.',
  ogImage: '',
  googleAnalyticsId: '',
};

export const defaultSocialSettings: SocialSettings = {
  instagram: '',
  facebook: '',
  whatsapp: '',
  tiktok: '',
};

let cachedSettings: PublicSettings | null = null;

export async function getPublicSettings(): Promise<PublicSettings> {
  // Return cached settings if available (for SSR)
  if (cachedSettings) {
    return cachedSettings;
  }

  try {
    const response = await fetch(`${API_BASE}/settings/public`);
    if (!response.ok) {
      console.warn('Failed to fetch settings, using defaults');
      return {
        general: defaultGeneralSettings,
        branding: defaultBrandingSettings,
        seo: defaultSeoSettings,
        social: defaultSocialSettings,
      };
    }
    const result = await response.json();
    cachedSettings = result.data;
    return cachedSettings!;
  } catch (error) {
    console.warn('Error fetching settings:', error);
    return {
      general: defaultGeneralSettings,
      branding: defaultBrandingSettings,
      seo: defaultSeoSettings,
      social: defaultSocialSettings,
    };
  }
}

// Helper to generate CSS variables from branding settings
export function generateCssVariables(branding: BrandingSettings): string {
  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 0%';

    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const borderRadiusValues: Record<string, string> = {
    none: '0px',
    small: '0.25rem',
    medium: '0.5rem',
    large: '1rem',
    full: '9999px',
  };

  return `
    --primary: ${hexToHsl(branding.primaryColor)};
    --primary-foreground: 0 0% 100%;
    --secondary: ${hexToHsl(branding.secondaryColor)};
    --accent: ${hexToHsl(branding.accentColor)};
    --radius: ${borderRadiusValues[branding.borderRadius] || '0.5rem'};
  `;
}

// Helper to get Google Fonts URL
export function getGoogleFontsUrl(branding: BrandingSettings): string {
  const fontMap: Record<string, string> = {
    playfair: 'Playfair+Display:wght@400;500;600;700',
    cormorant: 'Cormorant+Garamond:wght@400;500;600;700',
    'libre-baskerville': 'Libre+Baskerville:wght@400;700',
    lora: 'Lora:wght@400;500;600;700',
    merriweather: 'Merriweather:wght@400;700',
    inter: 'Inter:wght@400;500;600;700',
    'open-sans': 'Open+Sans:wght@400;500;600;700',
    roboto: 'Roboto:wght@400;500;700',
    lato: 'Lato:wght@400;700',
    'source-sans': 'Source+Sans+3:wght@400;500;600;700',
  };

  const fonts = new Set<string>();
  fonts.add(fontMap[branding.headingFont] || fontMap.playfair);
  fonts.add(fontMap[branding.bodyFont] || fontMap.inter);

  return `https://fonts.googleapis.com/css2?family=${Array.from(fonts).join('&family=')}&display=swap`;
}

// Helper to get font family CSS
export function getFontFamilyCss(branding: BrandingSettings): { heading: string; body: string } {
  const fontFamilyMap: Record<string, string> = {
    playfair: '"Playfair Display", serif',
    cormorant: '"Cormorant Garamond", serif',
    'libre-baskerville': '"Libre Baskerville", serif',
    lora: '"Lora", serif',
    merriweather: '"Merriweather", serif',
    inter: '"Inter", sans-serif',
    'open-sans': '"Open Sans", sans-serif',
    roboto: '"Roboto", sans-serif',
    lato: '"Lato", sans-serif',
    'source-sans': '"Source Sans 3", sans-serif',
  };

  return {
    heading: fontFamilyMap[branding.headingFont] || fontFamilyMap.playfair,
    body: fontFamilyMap[branding.bodyFont] || fontFamilyMap.inter,
  };
}
