// SEO Helper Functions for JSON-LD Structured Data

export interface OrganizationSchema {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

export interface WebSiteSchema {
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface ProductSchema {
  name: string;
  description?: string;
  image?: string | string[];
  sku?: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  url?: string;
  brand?: string;
  category?: string;
}

export interface ItemListSchema {
  name: string;
  items: Array<{
    name: string;
    url: string;
    image?: string;
    position: number;
  }>;
}

// Generate Organization schema
export function generateOrganizationSchema(org: OrganizationSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: org.name,
    url: org.url,
    ...(org.logo && { logo: org.logo }),
    ...(org.description && { description: org.description }),
    ...(org.sameAs && { sameAs: org.sameAs }),
  };
}

// Generate WebSite schema with SearchAction
export function generateWebSiteSchema(site: WebSiteSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    ...(site.description && { description: site.description }),
    ...(site.potentialAction && {
      potentialAction: {
        '@type': 'SearchAction',
        target: site.potentialAction.target,
        'query-input': site.potentialAction.queryInput,
      },
    }),
  };
}

// Generate BreadcrumbList schema
export function generateBreadcrumbSchema(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Generate Product schema
export function generateProductSchema(product: ProductSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.description && { description: product.description }),
    ...(product.image && { image: product.image }),
    ...(product.sku && { sku: product.sku }),
    ...(product.brand && {
      brand: {
        '@type': 'Brand',
        name: product.brand,
      },
    }),
    ...(product.category && { category: product.category }),
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'ARS',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      ...(product.url && { url: product.url }),
    },
  };
}

// Generate ItemList schema (for category pages, search results)
export function generateItemListSchema(list: ItemListSchema): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: list.name,
    numberOfItems: list.items.length,
    itemListElement: list.items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
      ...(item.image && { image: item.image }),
    })),
  };
}

// Default organization data
export const defaultOrganization: OrganizationSchema = {
  name: 'Gemfolio',
  url: 'https://gemfolio.com',
  logo: 'https://gemfolio.com/logo.png',
  description: 'Tienda de joyería artesanal con piezas únicas hechas con pasión',
  sameAs: ['https://instagram.com/gemfolio', 'https://facebook.com/gemfolio'],
};

// Default website data
export const defaultWebSite: WebSiteSchema = {
  name: 'Gemfolio',
  url: 'https://gemfolio.com',
  description: 'Tienda de joyería artesanal',
  potentialAction: {
    target: 'https://gemfolio.com/buscar?q={search_term_string}',
    queryInput: 'required name=search_term_string',
  },
};
