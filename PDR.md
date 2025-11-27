# Gemfolio - Project Design Record (PDR)

> **Proyecto**: Gemfolio - Catálogo de Joyería
> **Versión**: 1.0.0
> **Fecha de inicio**: 2025-01-27
> **Estado**: En desarrollo

---

## 1. Visión General

### 1.1 Descripción del Proyecto

Gemfolio es una aplicación web de catálogo de productos de joyería que consta de dos partes principales:

1. **Web Pública (Astro)**: Catálogo de productos donde los clientes pueden navegar, buscar productos y realizar pedidos
2. **Panel de Administración (Next.js)**: Interfaz para gestionar productos, pedidos, usuarios y configuración del negocio

### 1.2 Objetivos del MVP

- Catálogo de productos con filtros avanzados y búsqueda
- Sistema de carrito de compras con checkout (sin pagos, solo notificación al admin)
- Panel de administración completo para gestión del negocio
- PWA instalable con notificaciones push
- Diseño elegante, moderno, minimalista y mobile-first

### 1.3 Características Diferenciadas

- **Bundles/Grupos**: Productos agrupados con precio especial
- **Variantes configurables**: Tallas, materiales, colores por producto
- **Guest checkout**: Compra sin registro obligatorio
- **Multi-idioma ready**: Preparado para internacionalización (MVP solo español)

---

## 2. Arquitectura Técnica

### 2.1 Stack Tecnológico

| Categoría | Tecnología | Versión | Justificación |
|-----------|------------|---------|---------------|
| **Monorepo** | Turborepo | ^2.x | Build system eficiente, caching |
| **Package Manager** | pnpm | ^9.x | Rápido, eficiente en espacio |
| **Web Pública** | Astro | ^5.x | SSG/SSR, excelente SEO, islands |
| **Admin Panel** | Next.js | ^15.x | App Router, React Server Components |
| **Lenguaje** | TypeScript | ^5.x | Type safety en todo el proyecto |
| **UI Components** | shadcn/ui | latest | Componentes accesibles, customizables |
| **Styling** | Tailwind CSS | ^4.x | Utility-first, design tokens |
| **Estado (Admin)** | Zustand | ^5.x | Simple, performante |
| **Estado (Web)** | Nanostores | ^0.11.x | Ligero, framework-agnostic |
| **Server State** | TanStack Query | ^5.x | Cache, mutations, optimistic updates |
| **ORM** | Drizzle ORM | ^0.38.x | Type-safe, SQL-like, ligero |
| **Base de Datos** | PostgreSQL | 16 | Via Neon (free tier) |
| **Autenticación** | Better Auth | ^1.x | Flexible, social providers |
| **Validación** | Zod | ^3.x | Schema validation, type inference |
| **API** | Hono | ^4.x | Ligero, edge-ready, tipado |
| **Email** | Resend | - | + React Email templates |
| **Storage** | Cloudflare R2 | - | S3-compatible, 10GB gratis |
| **Animaciones** | Framer Motion | ^11.x | Declarativo, performante |
| **Auto Animate** | @formkit/auto-animate | ^0.8.x | Animaciones automáticas |
| **i18n** | Paraglide JS | ^1.x | Type-safe, tree-shakeable |
| **PWA** | @vite-pwa/astro | ^0.4.x | Service worker, manifest |
| **Deploy** | Vercel | - | Edge functions, previews |

### 2.2 Estructura del Monorepo

```
gemfolio/
├── apps/
│   ├── web/                          # Astro 5 - Catálogo público
│   │   ├── public/
│   │   │   ├── fonts/
│   │   │   ├── icons/
│   │   │   └── images/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── astro/            # Componentes .astro
│   │   │   │   │   ├── layout/
│   │   │   │   │   ├── product/
│   │   │   │   │   ├── cart/
│   │   │   │   │   └── ui/
│   │   │   │   └── react/            # React islands
│   │   │   │       ├── cart/
│   │   │   │       ├── search/
│   │   │   │       ├── filters/
│   │   │   │       └── product/
│   │   │   ├── layouts/
│   │   │   │   ├── BaseLayout.astro
│   │   │   │   ├── CatalogLayout.astro
│   │   │   │   └── CheckoutLayout.astro
│   │   │   ├── pages/
│   │   │   │   ├── index.astro
│   │   │   │   ├── categoria/
│   │   │   │   │   └── [slug].astro
│   │   │   │   ├── producto/
│   │   │   │   │   └── [slug].astro
│   │   │   │   ├── bundle/
│   │   │   │   │   └── [slug].astro
│   │   │   │   ├── buscar.astro
│   │   │   │   ├── carrito.astro
│   │   │   │   ├── checkout.astro
│   │   │   │   ├── confirmacion/
│   │   │   │   │   └── [orderId].astro
│   │   │   │   └── [...slug].astro   # Páginas dinámicas (about, contacto, etc.)
│   │   │   ├── stores/
│   │   │   │   ├── cart.ts
│   │   │   │   ├── ui.ts
│   │   │   │   └── search.ts
│   │   │   ├── lib/
│   │   │   │   ├── api.ts
│   │   │   │   └── utils.ts
│   │   │   ├── styles/
│   │   │   │   └── global.css
│   │   │   └── env.d.ts
│   │   ├── astro.config.mjs
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── admin/                        # Next.js 15 - Panel de administración
│       ├── public/
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   ├── login/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── register/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── forgot-password/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── layout.tsx
│       │   │   ├── (dashboard)/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx              # Dashboard home
│       │   │   │   ├── productos/
│       │   │   │   │   ├── page.tsx          # Listado
│       │   │   │   │   ├── nuevo/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   └── [id]/
│       │   │   │   │       ├── page.tsx      # Editar
│       │   │   │   │       └── variantes/
│       │   │   │   │           └── page.tsx
│       │   │   │   ├── categorias/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── [id]/
│       │   │   │   │       └── page.tsx
│       │   │   │   ├── bundles/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── nuevo/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   └── [id]/
│       │   │   │   │       └── page.tsx
│       │   │   │   ├── pedidos/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── [id]/
│       │   │   │   │       └── page.tsx
│       │   │   │   ├── inventario/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── cupones/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── [id]/
│       │   │   │   │       └── page.tsx
│       │   │   │   ├── clientes/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── [id]/
│       │   │   │   │       └── page.tsx
│       │   │   │   ├── paginas/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   └── [id]/
│       │   │   │   │       └── page.tsx
│       │   │   │   └── configuracion/
│       │   │   │       ├── page.tsx
│       │   │   │       ├── general/
│       │   │   │       │   └── page.tsx
│       │   │   │       ├── branding/
│       │   │   │       │   └── page.tsx
│       │   │   │       ├── envio/
│       │   │   │       │   └── page.tsx
│       │   │   │       ├── notificaciones/
│       │   │   │       │   └── page.tsx
│       │   │   │       └── seo/
│       │   │   │           └── page.tsx
│       │   │   ├── api/
│       │   │   │   ├── [...route]/
│       │   │   │   │   └── route.ts   # Hono API mount
│       │   │   │   ├── auth/
│       │   │   │   │   └── [...betterauth]/
│       │   │   │   │       └── route.ts
│       │   │   │   └── upload/
│       │   │   │       └── route.ts
│       │   │   ├── layout.tsx
│       │   │   └── globals.css
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── Header.tsx
│       │   │   │   ├── Breadcrumbs.tsx
│       │   │   │   └── UserMenu.tsx
│       │   │   ├── products/
│       │   │   │   ├── ProductForm.tsx
│       │   │   │   ├── ProductList.tsx
│       │   │   │   ├── ProductCard.tsx
│       │   │   │   ├── VariantManager.tsx
│       │   │   │   └── ImageGallery.tsx
│       │   │   ├── orders/
│       │   │   │   ├── OrderList.tsx
│       │   │   │   ├── OrderDetail.tsx
│       │   │   │   └── OrderStatusBadge.tsx
│       │   │   ├── ui/                # shadcn components
│       │   │   └── shared/
│       │   │       ├── DataTable.tsx
│       │   │       ├── FileUpload.tsx
│       │   │       ├── RichTextEditor.tsx
│       │   │       ├── ConfirmDialog.tsx
│       │   │       └── EmptyState.tsx
│       │   ├── hooks/
│       │   │   ├── useProducts.ts
│       │   │   ├── useOrders.ts
│       │   │   ├── useUpload.ts
│       │   │   └── useDebounce.ts
│       │   ├── stores/
│       │   │   ├── ui.ts
│       │   │   └── filters.ts
│       │   ├── lib/
│       │   │   ├── api.ts
│       │   │   ├── auth.ts
│       │   │   └── utils.ts
│       │   └── types/
│       │       └── index.ts
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── db/                           # Base de datos y ORM
│   │   ├── src/
│   │   │   ├── schema/
│   │   │   │   ├── index.ts
│   │   │   │   ├── users.ts
│   │   │   │   ├── products.ts
│   │   │   │   ├── categories.ts
│   │   │   │   ├── variants.ts
│   │   │   │   ├── bundles.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── carts.ts
│   │   │   │   ├── coupons.ts
│   │   │   │   ├── pages.ts
│   │   │   │   ├── settings.ts
│   │   │   │   └── relations.ts
│   │   │   ├── queries/
│   │   │   │   ├── products.ts
│   │   │   │   ├── categories.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── carts.ts
│   │   │   │   └── users.ts
│   │   │   ├── migrations/
│   │   │   ├── seed/
│   │   │   │   ├── index.ts
│   │   │   │   ├── categories.ts
│   │   │   │   ├── products.ts
│   │   │   │   └── settings.ts
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   ├── drizzle.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/                          # API compartida (Hono)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── products.ts
│   │   │   │   ├── categories.ts
│   │   │   │   ├── bundles.ts
│   │   │   │   ├── cart.ts
│   │   │   │   ├── orders.ts
│   │   │   │   ├── coupons.ts
│   │   │   │   ├── pages.ts
│   │   │   │   ├── settings.ts
│   │   │   │   ├── upload.ts
│   │   │   │   └── search.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── admin.ts
│   │   │   │   └── cors.ts
│   │   │   ├── lib/
│   │   │   │   └── response.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── auth/                         # Configuración Better Auth
│   │   ├── src/
│   │   │   ├── config.ts
│   │   │   ├── client.ts
│   │   │   ├── middleware.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ui/                           # Componentes UI compartidos
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   └── ...
│   │   │   ├── primitives/
│   │   │   │   ├── price.tsx
│   │   │   │   ├── stock-badge.tsx
│   │   │   │   ├── rating.tsx
│   │   │   │   └── tag.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-toast.ts
│   │   │   ├── lib/
│   │   │   │   └── utils.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── validators/                   # Schemas Zod
│   │   ├── src/
│   │   │   ├── product.ts
│   │   │   ├── category.ts
│   │   │   ├── variant.ts
│   │   │   ├── bundle.ts
│   │   │   ├── order.ts
│   │   │   ├── cart.ts
│   │   │   ├── coupon.ts
│   │   │   ├── user.ts
│   │   │   ├── page.ts
│   │   │   ├── settings.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── email/                        # Templates de email
│   │   ├── src/
│   │   │   ├── templates/
│   │   │   │   ├── OrderConfirmation.tsx
│   │   │   │   ├── OrderStatusUpdate.tsx
│   │   │   │   ├── NewOrderAdmin.tsx
│   │   │   │   ├── WelcomeEmail.tsx
│   │   │   │   └── PasswordReset.tsx
│   │   │   ├── components/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Button.tsx
│   │   │   ├── send.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── storage/                      # Upload a Cloudflare R2
│   │   ├── src/
│   │   │   ├── client.ts
│   │   │   ├── upload.ts
│   │   │   ├── delete.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── i18n/                         # Internacionalización
│   │   ├── src/
│   │   │   ├── messages/
│   │   │   │   └── es.json
│   │   │   ├── paraglide/            # Generated
│   │   │   └── index.ts
│   │   ├── project.inlang/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── config/                       # Configuraciones compartidas
│       ├── eslint/
│       │   └── index.js
│       ├── typescript/
│       │   └── base.json
│       ├── tailwind/
│       │   ├── preset.ts
│       │   └── tokens.ts
│       └── package.json
│
├── docker/
│   └── docker-compose.yml
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── .vscode/
│   ├── settings.json
│   └── extensions.json
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
├── .gitignore
├── .env.example
├── PDR.md
├── TODO.md
└── README.md
```

### 2.3 Modelo de Datos Completo

#### 2.3.1 Diagrama ER (Entidades principales)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│   users     │     │  categories │     │    products     │
├─────────────┤     ├─────────────┤     ├─────────────────┤
│ id (PK)     │     │ id (PK)     │     │ id (PK)         │
│ email       │     │ name        │     │ name            │
│ name        │     │ slug        │     │ slug            │
│ role        │     │ parentId(FK)│◄────│ categoryId (FK) │
│ avatar      │     │ image       │     │ basePrice       │
│ ...         │     │ ...         │     │ hasVariants     │
└─────────────┘     └─────────────┘     │ ...             │
      │                                  └────────┬────────┘
      │                                           │
      │                                           │ 1:N
      │                                           ▼
      │                                  ┌─────────────────┐
      │                                  │ productVariants │
      │                                  ├─────────────────┤
      │                                  │ id (PK)         │
      │                                  │ productId (FK)  │
      │                                  │ sku             │
      │                                  │ price           │
      │                                  │ stock           │
      │                                  │ attributes      │
      │                                  └─────────────────┘
      │
      │  ┌─────────────┐     ┌─────────────┐
      │  │   orders    │     │ orderItems  │
      │  ├─────────────┤     ├─────────────┤
      └─►│ userId (FK) │     │ orderId(FK) │
         │ orderNumber │◄────│ productId   │
         │ status      │     │ variantId   │
         │ total       │     │ quantity    │
         │ ...         │     │ price       │
         └─────────────┘     └─────────────┘
```

#### 2.3.2 Schemas Drizzle Detallados

```typescript
// === USERS ===
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false),
  name: text('name').notNull(),
  image: text('image'),
  role: text('role', { enum: ['admin', 'customer'] }).default('customer'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// === CATEGORIES ===
export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  parentId: text('parent_id').references(() => categories.id, { onDelete: 'set null' }),
  order: integer('order').default(0),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// === PRODUCTS ===
export const products = pgTable('products', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  richDescription: text('rich_description'), // HTML/MDX
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  comparePrice: decimal('compare_price', { precision: 10, scale: 2 }), // Precio tachado
  cost: decimal('cost', { precision: 10, scale: 2 }), // Costo interno
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  status: text('status', { enum: ['draft', 'active', 'archived'] }).default('draft'),
  hasVariants: boolean('has_variants').default(false),
  trackInventory: boolean('track_inventory').default(true),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  seoImage: text('seo_image'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  categoryIdx: index('product_category_idx').on(table.categoryId),
  statusIdx: index('product_status_idx').on(table.status),
  slugIdx: index('product_slug_idx').on(table.slug),
}));

// === PRODUCT VARIANTS ===
export const productVariants = pgTable('product_variants', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  sku: text('sku').unique(),
  name: text('name'), // "Talla 7 - Oro", si es null usa el nombre del producto
  price: decimal('price', { precision: 10, scale: 2 }), // Si es null, usa basePrice del producto
  comparePrice: decimal('compare_price', { precision: 10, scale: 2 }),
  stock: integer('stock').default(0),
  lowStockThreshold: integer('low_stock_threshold').default(5),
  attributes: jsonb('attributes').$type<Record<string, string>>(), // { talla: "7", material: "oro" }
  image: text('image'), // Imagen específica de la variante
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  productIdx: index('variant_product_idx').on(table.productId),
  skuIdx: index('variant_sku_idx').on(table.sku),
}));

// === PRODUCT IMAGES ===
export const productImages = pgTable('product_images', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  alt: text('alt'),
  order: integer('order').default(0),
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  productIdx: index('image_product_idx').on(table.productId),
}));

// === PRODUCT VIDEOS ===
export const productVideos = pgTable('product_videos', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow(),
});

// === TAGS ===
export const tags = pgTable('tags', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  color: text('color').default('#6B7280'), // Color del badge
  type: text('type', { enum: ['system', 'custom'] }).default('custom'),
  // system tags: nuevo, oferta, agotado, exclusivo, destacado
  createdAt: timestamp('created_at').defaultNow(),
});

export const productTags = pgTable('product_tags', {
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.productId, table.tagId] }),
}));

// === ATTRIBUTES (para variantes configurables) ===
export const attributes = pgTable('attributes', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(), // "Talla", "Material", "Color"
  slug: text('slug').notNull().unique(),
  type: text('type', { enum: ['select', 'color', 'size'] }).default('select'),
  values: jsonb('values').$type<string[]>().notNull(), // ["S", "M", "L"] o ["oro", "plata"]
  createdAt: timestamp('created_at').defaultNow(),
});

export const categoryAttributes = pgTable('category_attributes', {
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  attributeId: text('attribute_id').notNull().references(() => attributes.id, { onDelete: 'cascade' }),
  required: boolean('required').default(false),
  order: integer('order').default(0),
}, (table) => ({
  pk: primaryKey({ columns: [table.categoryId, table.attributeId] }),
}));

// === BUNDLES ===
export const bundles = pgTable('bundles', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Precio del bundle
  comparePrice: decimal('compare_price', { precision: 10, scale: 2 }), // Suma de productos individuales
  status: text('status', { enum: ['draft', 'active', 'archived'] }).default('draft'),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

export const bundleItems = pgTable('bundle_items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  bundleId: text('bundle_id').notNull().references(() => bundles.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  quantity: integer('quantity').default(1),
}, (table) => ({
  bundleIdx: index('bundle_item_bundle_idx').on(table.bundleId),
}));

// === CARTS ===
export const carts = pgTable('carts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  visitorId: text('visitor_id'), // Para guest checkout
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  userIdx: index('cart_user_idx').on(table.userId),
  visitorIdx: index('cart_visitor_idx').on(table.visitorId),
}));

export const cartItems = pgTable('cart_items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  cartId: text('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id, { onDelete: 'cascade' }),
  variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  bundleId: text('bundle_id').references(() => bundles.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  cartIdx: index('cart_item_cart_idx').on(table.cartId),
}));

// === ORDERS ===
export const orders = pgTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  orderNumber: text('order_number').notNull().unique(), // GEM-0001
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  // Guest info
  guestEmail: text('guest_email'),
  guestName: text('guest_name'),
  guestPhone: text('guest_phone'),
  // Status
  status: text('status', {
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
  }).default('pending'),
  // Totals
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  shipping: decimal('shipping', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  // Addresses
  shippingAddress: jsonb('shipping_address').$type<AddressType>(),
  billingAddress: jsonb('billing_address').$type<AddressType>(),
  // Notes
  customerNotes: text('customer_notes'),
  adminNotes: text('admin_notes'),
  // Coupon
  couponId: text('coupon_id').references(() => coupons.id, { onDelete: 'set null' }),
  couponCode: text('coupon_code'),
  couponDiscount: decimal('coupon_discount', { precision: 10, scale: 2 }),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  userIdx: index('order_user_idx').on(table.userId),
  statusIdx: index('order_status_idx').on(table.status),
  orderNumberIdx: index('order_number_idx').on(table.orderNumber),
}));

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  variantId: text('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  bundleId: text('bundle_id').references(() => bundles.id, { onDelete: 'set null' }),
  // Snapshot data (para mantener historial)
  name: text('name').notNull(),
  sku: text('sku'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  quantity: integer('quantity').notNull(),
  attributes: jsonb('attributes').$type<Record<string, string>>(), // Snapshot de variante
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  orderIdx: index('order_item_order_idx').on(table.orderId),
}));

export const orderStatusHistory = pgTable('order_status_history', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  note: text('note'),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// === COUPONS ===
export const coupons = pgTable('coupons', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  code: text('code').notNull().unique(),
  description: text('description'),
  type: text('type', { enum: ['percentage', 'fixed', 'shipping'] }).notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(), // % o monto fijo
  minPurchase: decimal('min_purchase', { precision: 10, scale: 2 }),
  maxDiscount: decimal('max_discount', { precision: 10, scale: 2 }), // Tope para %
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').default(0),
  validFrom: timestamp('valid_from'),
  validUntil: timestamp('valid_until'),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  codeIdx: index('coupon_code_idx').on(table.code),
}));

// === PAGES ===
export const pages = pgTable('pages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  content: text('content'), // MDX content
  status: text('status', { enum: ['draft', 'published'] }).default('draft'),
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// === SETTINGS ===
export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value'),
  group: text('group', {
    enum: ['general', 'branding', 'shipping', 'notifications', 'seo', 'social']
  }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdate(() => new Date()),
});

// === INVENTORY MOVEMENTS ===
export const inventoryMovements = pgTable('inventory_movements', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  variantId: text('variant_id').notNull().references(() => productVariants.id, { onDelete: 'cascade' }),
  type: text('type', { enum: ['in', 'out', 'adjustment'] }).notNull(),
  quantity: integer('quantity').notNull(), // Puede ser negativo
  reason: text('reason'),
  orderId: text('order_id').references(() => orders.id, { onDelete: 'set null' }),
  createdBy: text('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  variantIdx: index('inventory_variant_idx').on(table.variantId),
}));
```

### 2.4 API Endpoints

#### 2.4.1 API Pública (para Web)

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Listar productos con filtros |
| GET | `/api/products/:slug` | Detalle de producto |
| GET | `/api/categories` | Árbol de categorías |
| GET | `/api/categories/:slug` | Categoría con productos |
| GET | `/api/bundles` | Listar bundles activos |
| GET | `/api/bundles/:slug` | Detalle de bundle |
| GET | `/api/search` | Búsqueda fuzzy |
| POST | `/api/cart` | Crear/obtener carrito |
| GET | `/api/cart/:id` | Obtener carrito |
| POST | `/api/cart/:id/items` | Agregar item |
| PATCH | `/api/cart/:id/items/:itemId` | Actualizar cantidad |
| DELETE | `/api/cart/:id/items/:itemId` | Eliminar item |
| POST | `/api/cart/:id/coupon` | Aplicar cupón |
| DELETE | `/api/cart/:id/coupon` | Remover cupón |
| POST | `/api/orders` | Crear orden (checkout) |
| GET | `/api/orders/:id` | Estado de orden |
| GET | `/api/pages/:slug` | Contenido de página |
| GET | `/api/settings/public` | Config pública (branding) |

#### 2.4.2 API Admin (protegida)

| Method | Endpoint | Descripción |
|--------|----------|-------------|
| **Productos** |||
| GET | `/api/admin/products` | Listar todos los productos |
| POST | `/api/admin/products` | Crear producto |
| GET | `/api/admin/products/:id` | Obtener producto |
| PATCH | `/api/admin/products/:id` | Actualizar producto |
| DELETE | `/api/admin/products/:id` | Eliminar producto |
| POST | `/api/admin/products/:id/variants` | Crear variante |
| PATCH | `/api/admin/products/:id/variants/:vid` | Actualizar variante |
| DELETE | `/api/admin/products/:id/variants/:vid` | Eliminar variante |
| POST | `/api/admin/products/:id/images` | Subir imágenes |
| DELETE | `/api/admin/products/:id/images/:iid` | Eliminar imagen |
| **Categorías** |||
| GET | `/api/admin/categories` | Listar categorías |
| POST | `/api/admin/categories` | Crear categoría |
| PATCH | `/api/admin/categories/:id` | Actualizar categoría |
| DELETE | `/api/admin/categories/:id` | Eliminar categoría |
| PATCH | `/api/admin/categories/reorder` | Reordenar |
| **Bundles** |||
| GET | `/api/admin/bundles` | Listar bundles |
| POST | `/api/admin/bundles` | Crear bundle |
| PATCH | `/api/admin/bundles/:id` | Actualizar bundle |
| DELETE | `/api/admin/bundles/:id` | Eliminar bundle |
| **Pedidos** |||
| GET | `/api/admin/orders` | Listar pedidos |
| GET | `/api/admin/orders/:id` | Detalle de pedido |
| PATCH | `/api/admin/orders/:id/status` | Cambiar estado |
| POST | `/api/admin/orders/:id/notes` | Agregar nota |
| **Inventario** |||
| GET | `/api/admin/inventory` | Vista de inventario |
| GET | `/api/admin/inventory/low-stock` | Alertas stock bajo |
| POST | `/api/admin/inventory/adjust` | Ajuste manual |
| **Cupones** |||
| GET | `/api/admin/coupons` | Listar cupones |
| POST | `/api/admin/coupons` | Crear cupón |
| PATCH | `/api/admin/coupons/:id` | Actualizar cupón |
| DELETE | `/api/admin/coupons/:id` | Eliminar cupón |
| **Usuarios** |||
| GET | `/api/admin/users` | Listar usuarios |
| GET | `/api/admin/users/:id` | Detalle usuario |
| PATCH | `/api/admin/users/:id` | Actualizar rol |
| **Páginas** |||
| GET | `/api/admin/pages` | Listar páginas |
| POST | `/api/admin/pages` | Crear página |
| PATCH | `/api/admin/pages/:id` | Actualizar página |
| DELETE | `/api/admin/pages/:id` | Eliminar página |
| **Settings** |||
| GET | `/api/admin/settings` | Obtener settings |
| PATCH | `/api/admin/settings` | Actualizar settings |
| **Upload** |||
| POST | `/api/admin/upload` | Subir archivo a R2 |
| DELETE | `/api/admin/upload/:key` | Eliminar archivo |
| **Dashboard** |||
| GET | `/api/admin/dashboard/stats` | Métricas generales |
| GET | `/api/admin/dashboard/recent-orders` | Últimos pedidos |

---

## 3. Diseño Visual

### 3.1 Sistema de Diseño

#### 3.1.1 Paleta de Colores

```css
/* Modo Claro */
:root {
  /* Backgrounds */
  --background: 0 0% 98%;           /* #FAFAFA - Stone 50 */
  --background-subtle: 0 0% 96%;    /* #F5F5F5 */
  --card: 0 0% 100%;                /* #FFFFFF */

  /* Foregrounds */
  --foreground: 24 10% 10%;         /* #1C1917 - Stone 900 */
  --foreground-muted: 24 6% 45%;    /* #78716C - Stone 500 */

  /* Primary - Dorado elegante */
  --primary: 43 74% 38%;            /* #B8860B - Dark Goldenrod */
  --primary-foreground: 0 0% 100%;
  --primary-hover: 43 74% 32%;

  /* Secondary */
  --secondary: 24 6% 83%;           /* #D6D3D1 - Stone 300 */
  --secondary-foreground: 24 10% 10%;

  /* Accent */
  --accent: 43 30% 90%;             /* Dorado muy suave */
  --accent-foreground: 43 74% 25%;

  /* Destructive */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  /* Success */
  --success: 142 76% 36%;
  --success-foreground: 0 0% 100%;

  /* Border & Input */
  --border: 24 6% 90%;
  --input: 24 6% 90%;
  --ring: 43 74% 38%;

  /* Radius */
  --radius: 0.5rem;
}

/* Modo Oscuro */
.dark {
  --background: 24 10% 10%;         /* #1C1917 */
  --background-subtle: 24 10% 14%;
  --card: 24 10% 12%;

  --foreground: 0 0% 98%;           /* #FAFAFA */
  --foreground-muted: 24 6% 63%;

  --primary: 43 80% 50%;            /* #D4AF37 - Dorado más brillante */
  --primary-hover: 43 80% 55%;

  --secondary: 24 10% 20%;
  --secondary-foreground: 0 0% 98%;

  --border: 24 10% 20%;
  --input: 24 10% 20%;
}
```

#### 3.1.2 Tipografía

```css
/* Fuentes */
--font-heading: 'Playfair Display', serif;  /* Elegante para títulos */
--font-body: 'Inter', sans-serif;           /* Legible para cuerpo */

/* Tamaños */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-5xl: 3rem;       /* 48px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

#### 3.1.3 Espaciado

```css
/* Basado en 4px */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

#### 3.1.4 Breakpoints

```css
/* Mobile First */
--screen-sm: 640px;   /* Landscape phones */
--screen-md: 768px;   /* Tablets */
--screen-lg: 1024px;  /* Laptops */
--screen-xl: 1280px;  /* Desktops */
--screen-2xl: 1536px; /* Large screens */
```

### 3.2 Componentes Clave

#### 3.2.1 Product Card

```
┌─────────────────────────────┐
│  ┌───────────────────────┐  │
│  │                       │  │
│  │       [IMAGEN]        │  │  ← Aspect ratio 1:1
│  │                       │  │
│  │   ♡  (hover)          │  │  ← Wishlist icon
│  └───────────────────────┘  │
│                             │
│  CATEGORÍA                  │  ← text-xs, uppercase, muted
│  Nombre del Producto        │  ← font-heading, text-lg
│  ★★★★☆ (4.5)               │  ← Rating (v1.1)
│                             │
│  $1,299.00  $1,599.00       │  ← Precio y tachado
│                             │
│  [NUEVO] [OFERTA]           │  ← Tags/badges
│                             │
└─────────────────────────────┘
```

#### 3.2.2 Product Detail Gallery

```
┌─────────────────────────────────────────────┐
│  ┌─────────────────────────────────────┐    │
│  │                                     │    │
│  │                                     │    │
│  │          [IMAGEN PRINCIPAL]         │    │  ← Con zoom on hover
│  │                                     │    │
│  │                                     │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐       │  ← Thumbnails
│  │    │ │    │ │    │ │    │ │ ▶️ │        │  ← Último es video
│  └────┘ └────┘ └────┘ └────┘ └────┘       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 4. Flujos de Usuario

### 4.1 Flujo de Compra (Guest)

```
[Home] → [Categoría] → [Producto] → [Agregar al carrito]
                                           ↓
                              [Drawer carrito se abre]
                                           ↓
                              [Continuar comprando] o [Ir al carrito]
                                           ↓
                                    [Página Carrito]
                                           ↓
                                [Aplicar cupón (opcional)]
                                           ↓
                                     [Checkout]
                                           ↓
                          [Formulario: nombre, email, teléfono]
                          [Dirección de envío]
                          [Notas (opcional)]
                                           ↓
                                  [Confirmar Pedido]
                                           ↓
                          [Página de confirmación + Email]
```

### 4.2 Flujo Admin - Crear Producto

```
[Dashboard] → [Productos] → [+ Nuevo Producto]
                                    ↓
                    ┌───────────────────────────────┐
                    │   INFORMACIÓN BÁSICA          │
                    │   - Nombre                    │
                    │   - Categoría                 │
                    │   - Descripción corta         │
                    │   - Descripción rica (editor) │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │   PRECIOS                     │
                    │   - Precio base               │
                    │   - Precio comparación        │
                    │   - Costo (interno)           │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │   MEDIA                       │
                    │   - Drag & drop imágenes      │
                    │   - Seleccionar principal     │
                    │   - Agregar video             │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │   VARIANTES (toggle)          │
                    │   - Atributos (talla, etc.)   │
                    │   - Generar combinaciones     │
                    │   - Precio/stock por variante │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │   INVENTARIO                  │
                    │   - Stock inicial             │
                    │   - Alerta stock bajo         │
                    │   - SKU                       │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │   SEO                         │
                    │   - Título SEO                │
                    │   - Meta descripción          │
                    │   - URL slug                  │
                    └───────────────────────────────┘
                                    ↓
                    ┌───────────────────────────────┐
                    │   ETIQUETAS                   │
                    │   - Nuevo, Oferta, etc.       │
                    │   - Tags personalizados       │
                    └───────────────────────────────┘
                                    ↓
                    [Guardar como borrador] o [Publicar]
```

---

## 5. Seguridad

### 5.1 Autenticación y Autorización

- **Better Auth** con sesiones en DB
- Providers: Email/Password, Google, GitHub
- Roles: `admin`, `customer`
- Middleware de protección en rutas `/admin/*`
- CSRF protection habilitado
- Rate limiting en endpoints sensibles

### 5.2 Validación

- Zod en frontend y backend
- Sanitización de inputs HTML (rich text)
- Validación de tipos de archivo en uploads
- Límites de tamaño de archivo

### 5.3 Headers de Seguridad

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
];
```

---

## 6. Performance

### 6.1 Estrategias

- **SSG** para páginas de catálogo (Astro)
- **ISR** para páginas dinámicas (revalidación cada 60s)
- **Image optimization** con Astro Image / Next Image
- **Lazy loading** de imágenes below the fold
- **Code splitting** automático
- **Prefetch** de links en hover
- **Service Worker** para cache de assets

### 6.2 Métricas Target (Core Web Vitals)

| Métrica | Target |
|---------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| TTFB | < 200ms |

---

## 7. Deployment

### 7.1 Environments

| Ambiente | URL | Branch |
|----------|-----|--------|
| Production | gemfolio.com | main |
| Staging | staging.gemfolio.com | develop |
| Preview | pr-*.vercel.app | PR branches |

### 7.2 Variables de Entorno

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
BETTER_AUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=...

# Email
RESEND_API_KEY=...

# App
NEXT_PUBLIC_APP_URL=...
NEXT_PUBLIC_WEB_URL=...
```

---

## 8. Versionado

### 8.1 MVP (v1.0.0)
- Catálogo completo con filtros y búsqueda
- Carrito y checkout (sin pagos)
- Panel admin completo
- PWA básico
- Email notifications

### 8.2 v1.1.0
- Wishlist/Favoritos
- Comparador de productos
- Reviews y valoraciones
- Dashboard con métricas
- Exportar/Importar datos
- Newsletter
- Abandono de carrito

### 8.3 v1.2.0
- Integración Mercado Pago
- Cálculo de envío
- Múltiples direcciones
- Push notifications avanzadas

---

## 9. Changelog

| Fecha | Versión | Cambios |
|-------|---------|---------|
| 2025-01-27 | 0.0.1 | Documento inicial creado |

