# Arquitectura de Gemfolio

## Visión General

Gemfolio es una plataforma e-commerce construida como un monorepo con dos aplicaciones principales y múltiples paquetes compartidos.

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENTES                                    │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐     │
│   │   Browser   │    │   Mobile    │    │      PWA Instalada      │     │
│   └──────┬──────┘    └──────┬──────┘    └────────────┬────────────┘     │
└──────────┼──────────────────┼───────────────────────┼───────────────────┘
           │                  │                       │
           └──────────────────┼───────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────────────┐
│                          VERCEL                                          │
│  ┌──────────────────────────┴─────────────────────────────────────┐     │
│  │                                                                 │     │
│  │   ┌─────────────────────┐      ┌─────────────────────────┐     │     │
│  │   │    Web App (Astro)  │      │  Admin App (TanStack)   │     │     │
│  │   │    gemfolio.com     │      │   admin.gemfolio.com    │     │     │
│  │   │                     │      │                         │     │     │
│  │   │  • Catálogo         │      │  • Dashboard            │     │     │
│  │   │  • Carrito          │      │  • CRUD Productos       │     │     │
│  │   │  • Checkout         │      │  • Gestión Pedidos      │     │     │
│  │   │  • PWA              │      │  • Autenticación        │     │     │
│  │   └──────────┬──────────┘      └───────────┬─────────────┘     │     │
│  │              │                              │                   │     │
│  │              └──────────────┬───────────────┘                   │     │
│  │                             │                                   │     │
│  │              ┌──────────────┴──────────────┐                   │     │
│  │              │         API (Hono)          │                   │     │
│  │              │    /api/* endpoints         │                   │     │
│  │              └──────────────┬──────────────┘                   │     │
│  │                             │                                   │     │
│  └─────────────────────────────┼───────────────────────────────────┘     │
└─────────────────────────────────┼───────────────────────────────────────┘
                                  │
┌─────────────────────────────────┼───────────────────────────────────────┐
│                        SERVICIOS EXTERNOS                                │
│                                 │                                        │
│    ┌────────────────────────────┼────────────────────────────────┐      │
│    │                            │                                │      │
│    ▼                            ▼                                ▼      │
│ ┌──────────┐            ┌─────────────┐              ┌──────────────┐   │
│ │   Neon   │            │ Cloudflare  │              │   Resend     │   │
│ │PostgreSQL│            │     R2      │              │   (Email)    │   │
│ │          │            │  (Storage)  │              │              │   │
│ └──────────┘            └─────────────┘              └──────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Estructura del Monorepo

```
gemfolio/
├── apps/
│   ├── web/          # Astro + React (catálogo público)
│   └── admin/        # TanStack Start + React (panel admin)
│
├── packages/
│   ├── api/          # API compartida (Hono routes)
│   ├── auth/         # Better Auth config
│   ├── db/           # Drizzle schema + queries
│   ├── email/        # React Email templates
│   ├── storage/      # R2/UploadThing helpers
│   ├── ui/           # Componentes compartidos
│   ├── validators/   # Zod schemas
│   └── config/       # Configs compartidas
│
├── e2e/              # Tests Playwright
└── docker/           # Docker compose
```

## Modelo de Datos

### Diagrama ER

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │    products     │       │   categories    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       │ id (PK)         │
│ email           │       │ name            │◄──────│ name            │
│ name            │       │ slug            │       │ slug            │
│ role            │       │ category_id(FK) │       │ description     │
│ ...             │       │ price           │       │ image           │
└─────────────────┘       │ stock           │       │ parent_id (FK)  │
                          │ status          │       └─────────────────┘
                          │ ...             │
                          └────────┬────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│product_variants │     │ product_images  │     │  product_tags   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ product_id (FK) │
│ product_id (FK) │     │ product_id (FK) │     │ tag_id (FK)     │
│ sku             │     │ url             │     └─────────────────┘
│ name            │     │ alt             │              │
│ price           │     │ order           │              ▼
│ stock           │     │ is_primary      │     ┌─────────────────┐
│ attributes      │     └─────────────────┘     │      tags       │
└─────────────────┘                             ├─────────────────┤
                                                │ id (PK)         │
                                                │ name            │
┌─────────────────┐     ┌─────────────────┐     │ slug            │
│     orders      │     │   order_items   │     │ color           │
├─────────────────┤     ├─────────────────┤     └─────────────────┘
│ id (PK)         │     │ id (PK)         │
│ customer_id(FK) │◄────│ order_id (FK)   │
│ status          │     │ product_id (FK) │
│ total           │     │ variant_id (FK) │
│ shipping_*      │     │ quantity        │
│ ...             │     │ price           │
└─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│    customers    │     │     coupons     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │
│ email           │     │ code            │
│ name            │     │ discount_type   │
│ phone           │     │ discount_value  │
│ address_*       │     │ min_purchase    │
│ ...             │     │ max_uses        │
└─────────────────┘     │ expires_at      │
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│     bundles     │     │  bundle_items   │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │◄────│ bundle_id (FK)  │
│ name            │     │ product_id (FK) │
│ slug            │     │ variant_id (FK) │
│ price           │     │ quantity        │
│ status          │     └─────────────────┘
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│     pages       │     │    settings     │
├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ key (PK)        │
│ title           │     │ value           │
│ slug            │     │ type            │
│ content         │     └─────────────────┘
│ status          │
└─────────────────┘
```

### Tablas Principales

#### products
Productos del catálogo con soporte para variantes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | text | ID único (CUID) |
| name | varchar(255) | Nombre del producto |
| slug | varchar(255) | URL amigable (único) |
| category_id | text | FK a categories |
| price | decimal(10,2) | Precio base |
| compare_price | decimal(10,2) | Precio tachado |
| stock | integer | Stock disponible |
| status | enum | draft, active, archived |
| has_variants | boolean | Si tiene variantes |

#### product_variants
Variantes de producto (talla, color, etc.)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | text | ID único |
| product_id | text | FK a products |
| sku | varchar(100) | SKU único |
| name | varchar(255) | Nombre de variante |
| price | decimal(10,2) | Precio de variante |
| stock | integer | Stock de variante |
| attributes | jsonb | {size: "M", color: "gold"} |

#### orders
Pedidos de clientes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | text | ID único |
| order_number | varchar(50) | Número de pedido |
| customer_id | text | FK a customers |
| status | enum | pending, confirmed, shipped, delivered, cancelled |
| subtotal | decimal(10,2) | Subtotal |
| discount | decimal(10,2) | Descuento aplicado |
| shipping_cost | decimal(10,2) | Costo de envío |
| total | decimal(10,2) | Total final |

#### categories
Categorías con soporte para jerarquía.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | text | ID único |
| name | varchar(255) | Nombre |
| slug | varchar(255) | URL amigable |
| parent_id | text | FK a categories (padre) |
| image | text | URL de imagen |

## Flujos de Usuario

### Flujo de Compra

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Catálogo   │────▶│  Producto   │────▶│   Carrito   │────▶│  Checkout   │
│             │     │   Detalle   │     │   (local)   │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └──────┬──────┘
                                                                    │
                                                                    ▼
┌─────────────┐     ┌─────────────┐                        ┌─────────────┐
│   Email     │◀────│   Pedido    │◀───────────────────────│  Crear      │
│ Confirmación│     │   Creado    │                        │  Pedido     │
└─────────────┘     └─────────────┘                        └─────────────┘
```

### Flujo de Administración

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Login     │────▶│  Dashboard  │────▶│   Gestión   │
│   OAuth     │     │   Métricas  │     │  Productos  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌───────────┐ ┌───────────┐ ┌───────────┐
       │  Pedidos  │ │  Clientes │ │  Cupones  │
       └───────────┘ └───────────┘ └───────────┘
```

## Autenticación

### Flujo OAuth

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Admin   │────▶│  Better  │────▶│  Google/ │────▶│ Callback │
│  Login   │     │   Auth   │     │  GitHub  │     │  /api/   │
└──────────┘     └──────────┘     └──────────┘     └────┬─────┘
                                                        │
                      ┌─────────────────────────────────┘
                      ▼
               ┌──────────────┐
               │   Session    │
               │   Cookie     │
               │   Created    │
               └──────────────┘
```

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| admin | Acceso completo |
| staff | CRUD productos, ver pedidos |
| viewer | Solo lectura |

## Caching y Performance

### Estrategia de Caching

```
┌─────────────────────────────────────────────────────────────────┐
│                        CACHING LAYERS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Browser    │    │   CDN Edge   │    │  DB Query    │       │
│  │    Cache     │    │   (Vercel)   │    │   Cache      │       │
│  │              │    │              │    │              │       │
│  │  • Assets    │    │  • Static    │    │  • Products  │       │
│  │  • SW Cache  │    │  • ISR       │    │  • Categories│       │
│  │              │    │              │    │              │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Service Worker (PWA)

- Precache de assets estáticos
- Cache de imágenes de productos
- Fallback offline para páginas clave

## Seguridad

### Medidas Implementadas

1. **Autenticación**: OAuth 2.0 con Better Auth
2. **Autorización**: Middleware de roles en API
3. **CSRF**: Tokens en formularios
4. **XSS**: Sanitización de inputs
5. **SQL Injection**: Drizzle ORM con queries parametrizadas
6. **Rate Limiting**: Por IP en endpoints sensibles

### Headers de Seguridad

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Monitoring y Logging

### Métricas Recomendadas

- Response time por endpoint
- Error rate
- Database query time
- Cache hit ratio

### Logging

- Requests HTTP (Vercel logs)
- Errores de aplicación
- Eventos de autenticación
- Cambios de inventario
