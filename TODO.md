# Gemfolio - TODO List

> **Última actualización**: 2025-11-27
> **Progreso total**: ~200/500+ tareas completadas (Fase 1, 2, 3, 4 y 5 completas)

---

## Leyenda

- [ ] Pendiente
- [x] Completado
- [~] En progreso
- [!] Bloqueado

---

## FASE 1: SETUP E INFRAESTRUCTURA

### 1.1 Inicialización del Monorepo

#### 1.1.1 Estructura Base
- [x] Crear archivo `pnpm-workspace.yaml` con workspaces para apps y packages
- [x] Crear archivo `turbo.json` con pipelines para build, dev, lint, typecheck
- [x] Crear `package.json` raíz con scripts de desarrollo
- [x] Configurar `.npmrc` para pnpm (shamefully-hoist, strict-peer-deps)
- [x] Crear estructura de carpetas `apps/` y `packages/`
- [x] Crear archivo `.gitignore` completo para el monorepo
- [x] Crear archivo `.env.example` con todas las variables necesarias

#### 1.1.2 Configuraciones Compartidas (packages/config)
- [x] Crear `packages/config/package.json`
- [x] Crear `packages/config/typescript/base.json` con configuración TS estricta
- [x] Crear `packages/config/typescript/nextjs.json` extendiendo base
- [x] Crear `packages/config/typescript/astro.json` extendiendo base
- [x] Crear `packages/config/typescript/library.json` para packages
- [x] Crear `packages/config/eslint/index.js` con reglas compartidas
- [x] Crear `packages/config/eslint/next.js` para Next.js
- [x] Crear `packages/config/eslint/astro.js` para Astro
- [x] Crear `packages/config/prettier/index.js` con configuración (usando .prettierrc en raíz)
- [x] Crear `packages/config/tailwind/preset.ts` con tema personalizado
- [x] Crear `packages/config/tailwind/tokens.ts` con design tokens (colores, tipografía, espaciado)

#### 1.1.3 VSCode Configuration
- [x] Crear `.vscode/settings.json` con configuración del editor
- [x] Crear `.vscode/extensions.json` con extensiones recomendadas
- [x] Configurar formateo automático al guardar
- [x] Configurar Tailwind CSS IntelliSense

### 1.2 App Web (Astro)

#### 1.2.1 Inicialización
- [x] Ejecutar `pnpm create astro@latest` en `apps/web` (creado manualmente)
- [x] Seleccionar template vacío con TypeScript estricto
- [x] Instalar integración `@astrojs/react`
- [x] Instalar integración `@astrojs/tailwind`
- [x] Instalar integración `@astrojs/sitemap`
- [x] Configurar `astro.config.mjs` con integraciones
- [x] Configurar output hybrid (SSG + SSR donde necesario)
- [x] Configurar adapter para Vercel

#### 1.2.2 Configuración de Tailwind en Web
- [x] Crear `apps/web/tailwind.config.ts`
- [x] Importar preset desde `@gemfolio/config/tailwind`
- [x] Configurar paths de content
- [x] Crear `apps/web/src/styles/global.css` con imports de Tailwind
- [x] Agregar fuentes Playfair Display e Inter (Google Fonts o local)
- [x] Configurar variables CSS para theming

#### 1.2.3 Estructura de Carpetas Web
- [x] Crear `apps/web/src/components/astro/` para componentes Astro
- [x] Crear `apps/web/src/components/react/` para React islands
- [x] Crear `apps/web/src/layouts/` para layouts
- [x] Crear `apps/web/src/pages/` para páginas
- [x] Crear `apps/web/src/stores/` para Nanostores
- [x] Crear `apps/web/src/lib/` para utilidades
- [x] Crear `apps/web/public/` para assets estáticos

#### 1.2.4 Layout Base Web
- [x] Crear `apps/web/src/layouts/BaseLayout.astro`
- [x] Implementar `<html>` con lang="es"
- [x] Implementar `<head>` con meta tags básicos
- [x] Importar fuentes y estilos globales
- [x] Implementar slot para contenido
- [x] Agregar ViewTransitions de Astro
- [ ] Crear componente `SEO.astro` para meta tags dinámicos (integrado en BaseLayout)

### 1.3 App Admin (Next.js)

#### 1.3.1 Inicialización
- [x] Ejecutar `pnpm create next-app@latest` en `apps/admin` (creado manualmente)
- [x] Seleccionar TypeScript, ESLint, Tailwind, App Router, src/, import alias
- [x] Actualizar `next.config.ts` con transpilePackages para packages internos
- [x] Configurar output standalone para deployment optimizado
- [x] Instalar `@tanstack/react-query` para server state
- [x] Instalar `zustand` para estado cliente

#### 1.3.2 Configuración de Tailwind en Admin
- [x] Actualizar `apps/admin/tailwind.config.ts`
- [x] Importar preset desde `@gemfolio/config/tailwind`
- [x] Configurar paths de content incluyendo packages/ui
- [x] Actualizar `apps/admin/src/app/globals.css`
- [x] Agregar fuentes Playfair Display e Inter

#### 1.3.3 Estructura de Carpetas Admin
- [x] Crear estructura `apps/admin/src/app/(auth)/` para páginas de auth
- [x] Crear estructura `apps/admin/src/app/(dashboard)/` para panel
- [x] Crear `apps/admin/src/components/` para componentes
- [ ] Crear `apps/admin/src/hooks/` para hooks personalizados
- [x] Crear `apps/admin/src/stores/` para Zustand stores
- [x] Crear `apps/admin/src/lib/` para utilidades
- [ ] Crear `apps/admin/src/types/` para tipos

#### 1.3.4 Setup TanStack Query
- [x] Crear `apps/admin/src/lib/query-client.ts` (integrado en providers)
- [x] Crear `apps/admin/src/components/providers/QueryProvider.tsx`
- [x] Configurar QueryClientProvider en layout raíz
- [ ] Configurar devtools en desarrollo

### 1.4 Docker para Desarrollo Local

#### 1.4.1 PostgreSQL
- [x] Crear `docker/docker-compose.yml`
- [x] Configurar servicio PostgreSQL 16
- [x] Configurar volumen persistente para datos
- [x] Configurar healthcheck
- [x] Exponer puerto 5432
- [x] Agregar credenciales de desarrollo en `.env.example`

#### 1.4.2 Scripts de Desarrollo
- [x] Agregar script `db:start` en package.json raíz
- [x] Agregar script `db:stop` en package.json raíz
- [x] Agregar script `db:reset` para reiniciar base de datos
- [ ] Documentar uso en README.md

---

## FASE 2: BASE DE DATOS Y ORM

### 2.1 Package de Base de Datos (packages/db)

#### 2.1.1 Inicialización
- [x] Crear `packages/db/package.json` con dependencias
- [x] Instalar `drizzle-orm` y `drizzle-kit`
- [x] Instalar `@neondatabase/serverless` para producción
- [x] Instalar `postgres` para desarrollo local
- [x] Instalar `@paralleldrive/cuid2` para IDs
- [x] Crear `packages/db/tsconfig.json` extendiendo config library
- [x] Crear `packages/db/drizzle.config.ts`

#### 2.1.2 Cliente de Base de Datos
- [x] Crear `packages/db/src/client.ts`
- [x] Implementar conexión para desarrollo (postgres local)
- [x] Implementar conexión para producción (Neon serverless)
- [x] Exportar instancia de db tipada
- [x] Manejar conexión singleton

### 2.2 Schema de Base de Datos

#### 2.2.1 Schema de Usuarios
- [x] Crear `packages/db/src/schema/users.ts`
- [x] Definir tabla `users` con campos: id, email, emailVerified, name, image, role, createdAt, updatedAt
- [x] Definir tabla `sessions` para Better Auth
- [x] Definir tabla `accounts` para OAuth providers
- [x] Definir tabla `verifications` para tokens
- [x] Agregar índices necesarios
- [x] Exportar tipos inferidos

#### 2.2.2 Schema de Categorías
- [x] Crear `packages/db/src/schema/categories.ts`
- [x] Definir tabla `categories` con campos: id, name, slug, description, image, parentId, order, status, seoTitle, seoDescription, createdAt, updatedAt
- [x] Agregar self-reference para parentId (categorías anidadas)
- [x] Agregar índices en slug y parentId
- [x] Exportar tipos inferidos

#### 2.2.3 Schema de Productos
- [x] Crear `packages/db/src/schema/products.ts`
- [x] Definir tabla `products` con todos los campos especificados en PDR
- [x] Agregar foreign key a categories
- [x] Agregar índices en categoryId, status, slug
- [x] Exportar tipos inferidos

#### 2.2.4 Schema de Variantes
- [x] Crear `packages/db/src/schema/variants.ts` (incluido en products.ts)
- [x] Definir tabla `productVariants` con campos: id, productId, sku, name, price, comparePrice, stock, lowStockThreshold, attributes (jsonb), image, isDefault, createdAt, updatedAt
- [x] Agregar foreign key a products con cascade delete
- [x] Agregar índices en productId y sku
- [x] Exportar tipos inferidos

#### 2.2.5 Schema de Imágenes y Videos
- [x] Crear `packages/db/src/schema/media.ts` (incluido en products.ts)
- [x] Definir tabla `productImages` con campos: id, productId, variantId, url, alt, order, isPrimary, createdAt
- [x] Definir tabla `productVideos` con campos: id, productId, url, thumbnailUrl, title, createdAt
- [x] Agregar foreign keys con cascade delete
- [x] Agregar índices
- [x] Exportar tipos inferidos

#### 2.2.6 Schema de Tags
- [x] Crear `packages/db/src/schema/tags.ts`
- [x] Definir tabla `tags` con campos: id, name, slug, color, type (system/custom), createdAt
- [x] Definir tabla `productTags` (many-to-many) con primary key compuesta
- [x] Agregar foreign keys con cascade delete
- [x] Exportar tipos inferidos

#### 2.2.7 Schema de Atributos
- [x] Crear `packages/db/src/schema/attributes.ts`
- [x] Definir tabla `attributes` con campos: id, name, slug, type (select/color/size), values (jsonb), createdAt
- [x] Definir tabla `categoryAttributes` (many-to-many) con campos adicionales: required, order
- [x] Agregar foreign keys
- [x] Exportar tipos inferidos

#### 2.2.8 Schema de Bundles
- [x] Crear `packages/db/src/schema/bundles.ts`
- [x] Definir tabla `bundles` con campos: id, name, slug, description, image, price, comparePrice, status, validFrom, validUntil, createdAt, updatedAt
- [x] Definir tabla `bundleItems` con campos: id, bundleId, productId, variantId, quantity
- [x] Agregar foreign keys
- [x] Agregar índices
- [x] Exportar tipos inferidos

#### 2.2.9 Schema de Carrito
- [x] Crear `packages/db/src/schema/carts.ts`
- [x] Definir tabla `carts` con campos: id, userId, visitorId, expiresAt, createdAt, updatedAt
- [x] Definir tabla `cartItems` con campos: id, cartId, productId, variantId, bundleId, quantity, createdAt
- [x] Agregar foreign keys
- [x] Agregar índices en userId y visitorId
- [x] Exportar tipos inferidos

#### 2.2.10 Schema de Pedidos
- [x] Crear `packages/db/src/schema/orders.ts`
- [x] Definir tabla `orders` con todos los campos especificados en PDR
- [x] Definir tabla `orderItems` con snapshot de datos
- [x] Definir tabla `orderStatusHistory` para tracking de estados
- [x] Agregar foreign keys
- [x] Agregar índices en userId, status, orderNumber
- [x] Exportar tipos inferidos
- [x] Definir tipo AddressType para jsonb

#### 2.2.11 Schema de Cupones
- [x] Crear `packages/db/src/schema/coupons.ts`
- [x] Definir tabla `coupons` con todos los campos especificados en PDR
- [x] Agregar índice en code
- [x] Exportar tipos inferidos

#### 2.2.12 Schema de Páginas
- [x] Crear `packages/db/src/schema/pages.ts`
- [x] Definir tabla `pages` con campos: id, slug, title, content, status, seoTitle, seoDescription, createdAt, updatedAt
- [x] Agregar índice en slug
- [x] Exportar tipos inferidos

#### 2.2.13 Schema de Settings
- [x] Crear `packages/db/src/schema/settings.ts`
- [x] Definir tabla `settings` con campos: key (PK), value (jsonb), group, updatedAt
- [x] Exportar tipos inferidos
- [x] Definir tipos para cada grupo de settings

#### 2.2.14 Schema de Inventario
- [x] Crear `packages/db/src/schema/inventory.ts`
- [x] Definir tabla `inventoryMovements` con campos: id, variantId, type (in/out/adjustment), quantity, reason, orderId, createdBy, createdAt
- [x] Agregar foreign keys
- [x] Agregar índice en variantId
- [x] Exportar tipos inferidos

#### 2.2.15 Relaciones
- [x] Crear `packages/db/src/schema/relations.ts` (relaciones definidas inline en cada schema)
- [x] Definir todas las relaciones entre tablas usando `relations()` de Drizzle
- [x] Configurar relaciones de users
- [x] Configurar relaciones de categories (self-reference)
- [x] Configurar relaciones de products
- [x] Configurar relaciones de variants
- [x] Configurar relaciones de orders
- [x] Configurar relaciones de carts
- [x] Configurar relaciones de bundles

#### 2.2.16 Index de Schema
- [x] Crear `packages/db/src/schema/index.ts`
- [x] Exportar todas las tablas
- [x] Exportar todas las relaciones
- [x] Exportar todos los tipos inferidos

### 2.3 Migraciones

#### 2.3.1 Setup de Migraciones
- [x] Agregar script `db:generate` para generar migraciones
- [x] Agregar script `db:migrate` para ejecutar migraciones
- [x] Agregar script `db:push` para desarrollo rápido (sin migraciones)
- [x] Agregar script `db:studio` para Drizzle Studio
- [x] Generar migración inicial con todo el schema
- [x] Ejecutar migración inicial en DB local

### 2.4 Seed de Datos

#### 2.4.1 Seeds de Desarrollo
- [x] Crear `packages/db/src/seed/index.ts` con runner de seeds
- [x] Crear `packages/db/src/seed/settings.ts` con settings por defecto
- [x] Crear `packages/db/src/seed/categories.ts` con categorías de ejemplo (Anillos, Collares, Pulseras, Aretes, Relojes)
- [x] Crear `packages/db/src/seed/tags.ts` con tags del sistema (nuevo, oferta, agotado, exclusivo, destacado)
- [x] Crear `packages/db/src/seed/attributes.ts` con atributos base (Talla, Material, Color)
- [x] Crear `packages/db/src/seed/products.ts` con productos de ejemplo (10-20 productos variados)
- [x] Crear `packages/db/src/seed/users.ts` con usuario admin por defecto
- [x] Agregar script `db:seed` en package.json

### 2.5 Queries Helpers

#### 2.5.1 Queries de Productos
- [x] Crear `packages/db/src/queries/products.ts`
- [x] Implementar `getProducts` con filtros, paginación, ordenamiento
- [x] Implementar `getProductBySlug` con variantes e imágenes
- [x] Implementar `getProductById` para admin
- [x] Implementar `getRelatedProducts` por categoría
- [x] Implementar `searchProducts` con fuzzy search
- [x] Implementar `createProduct`
- [x] Implementar `updateProduct`
- [x] Implementar `deleteProduct`
- [x] Implementar `addProductImages`
- [x] Implementar `addProductVariants`
- [x] Implementar `addProductTags`
- [x] Implementar `getFeaturedProducts`
- [x] Implementar `getProductsByTag`

#### 2.5.2 Queries de Categorías
- [x] Crear `packages/db/src/queries/categories.ts`
- [x] Implementar `getCategoryTree` (árbol jerárquico)
- [x] Implementar `getCategoryTreeWithCounts` con conteo de productos
- [x] Implementar `getCategoryBySlug` con productos
- [x] Implementar `getCategoryById`
- [x] Implementar `getSubcategories`
- [x] Implementar `getRootCategories`
- [x] Implementar `createCategory`
- [x] Implementar `updateCategory`
- [x] Implementar `deleteCategory`
- [x] Implementar `reorderCategories`
- [x] Implementar `getCategoryBreadcrumb`
- [x] Implementar `categoryHasChildren`
- [x] Implementar `categoryHasProducts`

#### 2.5.3 Queries de Pedidos
- [x] Crear `packages/db/src/queries/orders.ts`
- [x] Implementar `getOrders` con filtros y paginación
- [x] Implementar `getOrderById` con items e historial
- [x] Implementar `getOrderByNumber`
- [x] Implementar `getUserOrders`
- [x] Implementar `createOrder` (desde carrito)
- [x] Implementar `updateOrderStatus`
- [x] Implementar `updatePaymentStatus`
- [x] Implementar `updateOrder`
- [x] Implementar `addOrderAdminNotes`
- [x] Implementar `getOrderStatusHistory`
- [x] Implementar `getOrderStats`
- [x] Implementar `cancelOrder`
- [x] Implementar `searchOrders`
- [x] Implementar `generateOrderNumber` (automático en schema)

#### 2.5.4 Queries de Carrito
- [x] Crear `packages/db/src/queries/carts.ts`
- [x] Implementar `getCartById` con items populados
- [x] Implementar `getCartByUserId`
- [x] Implementar `getCartByVisitorId`
- [x] Implementar `getOrCreateUserCart`
- [x] Implementar `getOrCreateVisitorCart`
- [x] Implementar `createCart`
- [x] Implementar `addCartItem`
- [x] Implementar `updateCartItemQuantity`
- [x] Implementar `removeCartItem`
- [x] Implementar `clearCart`
- [x] Implementar `deleteCart`
- [x] Implementar `applyCouponToCart`
- [x] Implementar `removeCouponFromCart`
- [x] Implementar `mergeGuestCart`
- [x] Implementar `cleanupExpiredCarts`
- [x] Implementar `getCartItemCount`

#### 2.5.5 Queries de Usuarios
- [ ] Crear `packages/db/src/queries/users.ts`
- [ ] Implementar `getUsers` con paginación
- [ ] Implementar `getUserById`
- [ ] Implementar `getUserByEmail`
- [ ] Implementar `updateUserRole`
- [ ] Implementar `getUserOrders`

#### 2.5.6 Index de Queries
- [x] Crear `packages/db/src/queries/index.ts`
- [x] Exportar todas las queries

### 2.6 Export Principal

- [x] Crear `packages/db/src/index.ts`
- [x] Exportar cliente de DB
- [x] Exportar schemas
- [x] Exportar queries
- [x] Exportar tipos
- [x] Verificar que el package compila correctamente
- [x] Agregar package como dependencia en apps/admin (apps/web pendiente)

---

## FASE 3: AUTENTICACIÓN

### 3.1 Package de Auth (packages/auth)

#### 3.1.1 Inicialización
- [x] Crear `packages/auth/package.json`
- [x] Instalar `better-auth`
- [x] Instalar `@better-auth/drizzle-adapter` (o configurar adapter manual)
- [x] Crear `packages/auth/tsconfig.json`

#### 3.1.2 Configuración de Better Auth
- [x] Crear `packages/auth/src/config.ts` (implementado en server.ts)
- [x] Configurar adapter de Drizzle con schema de users/sessions/accounts
- [x] Configurar provider de Email/Password
- [ ] Configurar provider de Google OAuth (pendiente - requiere credenciales)
- [ ] Configurar provider de GitHub OAuth (pendiente - requiere credenciales)
- [x] Configurar callbacks para roles
- [x] Configurar session strategy
- [x] Configurar cookies
- [x] Exportar instancia de auth configurada

#### 3.1.3 Cliente de Auth
- [x] Crear `packages/auth/src/client.ts`
- [x] Configurar cliente para usar en frontend
- [x] Exportar hooks: useSession, signIn, signOut, signUp
- [x] Configurar base URL dinámico

#### 3.1.4 Middleware
- [x] Crear `packages/auth/src/middleware.ts`
- [x] Implementar middleware para proteger rutas
- [x] Implementar helper `requireAuth` para server components
- [x] Implementar helper `requireAdmin` para rutas admin
- [x] Exportar middleware

#### 3.1.5 Export Principal
- [x] Crear `packages/auth/src/index.ts`
- [x] Exportar configuración, cliente, middleware
- [x] Exportar tipos de session y user

### 3.2 Integración en Admin

#### 3.2.1 API Routes de Auth
- [x] Crear `apps/admin/src/app/api/auth/[...all]/route.ts`
- [x] Montar handler de Better Auth
- [x] Configurar CORS si es necesario (trustedOrigins en config)

#### 3.2.2 Middleware de Next.js
- [x] Crear/actualizar `apps/admin/src/middleware.ts`
- [x] Proteger rutas `/dashboard/*`
- [x] Redirigir a login si no autenticado
- [ ] Verificar rol admin (implementado en middleware helpers, pendiente en Next.js middleware)

#### 3.2.3 Páginas de Auth
- [x] Crear `apps/admin/src/app/(auth)/layout.tsx` con diseño centrado
- [x] Crear `apps/admin/src/app/(auth)/login/page.tsx`
- [x] Crear componente `LoginForm.tsx` con email/password
- [ ] Agregar botones de OAuth (Google, GitHub) - pendiente credenciales
- [x] Implementar manejo de errores
- [x] Implementar redirect después de login
- [ ] Crear `apps/admin/src/app/(auth)/register/page.tsx` (para crear primer admin)
- [ ] Crear `apps/admin/src/app/(auth)/forgot-password/page.tsx`

#### 3.2.4 Provider de Session
- [x] Crear `apps/admin/src/components/auth/AuthProvider.tsx`
- [x] Implementar contexto de session
- [ ] Agregar al layout raíz (opcional, usar useSession directamente)

#### 3.2.5 Componente UserMenu
- [x] Crear `apps/admin/src/components/auth/UserNav.tsx`
- [x] Mostrar avatar y nombre del usuario
- [x] Dropdown con opciones: perfil, logout
- [x] Implementar logout

### 3.3 Integración en Web (Público)

#### 3.3.1 API para Auth (si necesario)
- [ ] Evaluar si web necesita auth propio o usa API de admin
- [ ] Configurar endpoint de auth si es necesario

#### 3.3.2 Store de Session
- [ ] Crear `apps/web/src/stores/auth.ts` con Nanostore
- [ ] Implementar estado de usuario (para carrito persistente)
- [ ] Implementar login/logout client-side

---

## FASE 4: PACKAGE DE UI COMPARTIDO

### 4.1 Inicialización (packages/ui)

#### 4.1.1 Setup
- [x] Crear `packages/ui/package.json`
- [x] Instalar dependencias: react, tailwind-merge, clsx, class-variance-authority
- [x] Instalar `@radix-ui/*` primitives necesarios
- [x] Instalar `lucide-react` para iconos
- [x] Crear `packages/ui/tsconfig.json`
- [x] Crear `packages/ui/src/lib/utils.ts` con helper `cn()`

#### 4.1.2 Componentes Base (shadcn)
- [x] Crear `packages/ui/src/components/button.tsx`
- [x] Crear `packages/ui/src/components/input.tsx`
- [x] Crear `packages/ui/src/components/label.tsx`
- [x] Crear `packages/ui/src/components/textarea.tsx`
- [x] Crear `packages/ui/src/components/select.tsx`
- [x] Crear `packages/ui/src/components/checkbox.tsx`
- [x] Crear `packages/ui/src/components/radio-group.tsx`
- [x] Crear `packages/ui/src/components/switch.tsx`
- [x] Crear `packages/ui/src/components/slider.tsx`

#### 4.1.3 Componentes de Layout
- [x] Crear `packages/ui/src/components/card.tsx`
- [x] Crear `packages/ui/src/components/separator.tsx`
- [x] Crear `packages/ui/src/components/scroll-area.tsx`
- [x] Crear `packages/ui/src/components/aspect-ratio.tsx`

#### 4.1.4 Componentes de Feedback
- [x] Crear `packages/ui/src/components/alert.tsx`
- [x] Crear `packages/ui/src/components/badge.tsx`
- [x] Crear `packages/ui/src/components/toast.tsx` (con Sonner - sonner.tsx)
- [x] Crear `packages/ui/src/components/skeleton.tsx`
- [x] Crear `packages/ui/src/components/spinner.tsx`
- [x] Crear `packages/ui/src/components/progress.tsx`

#### 4.1.5 Componentes de Overlay
- [x] Crear `packages/ui/src/components/dialog.tsx`
- [x] Crear `packages/ui/src/components/sheet.tsx` (drawer)
- [x] Crear `packages/ui/src/components/dropdown-menu.tsx`
- [x] Crear `packages/ui/src/components/popover.tsx`
- [x] Crear `packages/ui/src/components/tooltip.tsx`
- [x] Crear `packages/ui/src/components/alert-dialog.tsx`

#### 4.1.6 Componentes de Navegacion
- [x] Crear `packages/ui/src/components/tabs.tsx`
- [x] Crear `packages/ui/src/components/breadcrumb.tsx`
- [x] Crear `packages/ui/src/components/pagination.tsx`
- [x] Crear `packages/ui/src/components/navigation-menu.tsx`

#### 4.1.7 Componentes de Data Display
- [x] Crear `packages/ui/src/components/table.tsx`
- [x] Crear `packages/ui/src/components/avatar.tsx`
- [x] Crear `packages/ui/src/components/accordion.tsx`
- [x] Crear `packages/ui/src/components/collapsible.tsx`

#### 4.1.8 Componentes de Form
- [x] Crear `packages/ui/src/components/form.tsx` (react-hook-form integration)
- [x] Crear `packages/ui/src/components/calendar.tsx`
- [x] Crear `packages/ui/src/components/date-picker.tsx`
- [x] Crear `packages/ui/src/components/combobox.tsx`
- [x] Crear `packages/ui/src/components/command.tsx` (cmdk)

### 4.2 Componentes de Dominio

#### 4.2.1 Primitivos de Negocio
- [x] Crear `packages/ui/src/primitives/price.tsx` (formato de moneda)
- [x] Crear `packages/ui/src/primitives/stock-badge.tsx` (en stock, pocas unidades, agotado)
- [x] Crear `packages/ui/src/primitives/tag.tsx` (nuevo, oferta, etc.)
- [x] Crear `packages/ui/src/primitives/rating.tsx` (estrellas, para v1.1)
- [x] Crear `packages/ui/src/primitives/quantity-selector.tsx`

#### 4.2.2 Hooks Compartidos
- [x] Crear `packages/ui/src/hooks/use-toast.ts`
- [x] Crear `packages/ui/src/hooks/use-media-query.ts`
- [x] Crear `packages/ui/src/hooks/use-debounce.ts`
- [x] Crear `packages/ui/src/hooks/use-local-storage.ts`

### 4.3 Export Principal

- [x] Crear `packages/ui/src/index.ts`
- [x] Exportar todos los componentes
- [x] Exportar primitivos
- [x] Exportar hooks
- [x] Exportar utils
- [x] Verificar que compila correctamente

---

## FASE 5: PACKAGE DE VALIDADORES

### 5.1 Inicialización (packages/validators)

#### 5.1.1 Setup
- [x] Crear `packages/validators/package.json`
- [x] Instalar `zod`
- [x] Crear `packages/validators/tsconfig.json`

#### 5.1.2 Schemas de Producto
- [x] Crear `packages/validators/src/product.ts`
- [x] Schema `createProductSchema` con validaciones
- [x] Schema `updateProductSchema` (partial)
- [x] Schema `productFiltersSchema` para queries
- [x] Schema `productVariantSchema`
- [x] Exportar tipos inferidos

#### 5.1.3 Schemas de Categoría
- [x] Crear `packages/validators/src/category.ts`
- [x] Schema `createCategorySchema`
- [x] Schema `updateCategorySchema`
- [x] Schema `reorderCategoriesSchema`
- [x] Exportar tipos inferidos

#### 5.1.4 Schemas de Bundle
- [x] Crear `packages/validators/src/bundle.ts`
- [x] Schema `createBundleSchema`
- [x] Schema `updateBundleSchema`
- [x] Schema `bundleItemSchema`
- [x] Exportar tipos inferidos

#### 5.1.5 Schemas de Pedido
- [x] Crear `packages/validators/src/order.ts`
- [x] Schema `createOrderSchema` (checkout)
- [x] Schema `updateOrderStatusSchema`
- [x] Schema `addressSchema`
- [x] Schema `orderFiltersSchema`
- [x] Exportar tipos inferidos

#### 5.1.6 Schemas de Carrito
- [x] Crear `packages/validators/src/cart.ts`
- [x] Schema `addToCartSchema`
- [x] Schema `updateCartItemSchema`
- [x] Schema `applyCouponSchema`
- [x] Exportar tipos inferidos

#### 5.1.7 Schemas de Cupón
- [x] Crear `packages/validators/src/coupon.ts`
- [x] Schema `createCouponSchema`
- [x] Schema `updateCouponSchema`
- [x] Schema `validateCouponSchema`
- [x] Exportar tipos inferidos

#### 5.1.8 Schemas de Usuario
- [x] Crear `packages/validators/src/user.ts`
- [x] Schema `loginSchema`
- [x] Schema `registerSchema`
- [x] Schema `updateProfileSchema`
- [x] Schema `changePasswordSchema`
- [x] Exportar tipos inferidos

#### 5.1.9 Schemas de Página
- [x] Crear `packages/validators/src/page.ts`
- [x] Schema `createPageSchema`
- [x] Schema `updatePageSchema`
- [x] Exportar tipos inferidos

#### 5.1.10 Schemas de Settings
- [x] Crear `packages/validators/src/settings.ts`
- [x] Schema `generalSettingsSchema`
- [x] Schema `brandingSettingsSchema`
- [x] Schema `shippingSettingsSchema`
- [x] Schema `notificationSettingsSchema`
- [x] Schema `seoSettingsSchema`
- [x] Exportar tipos inferidos

### 5.2 Export Principal

- [x] Crear `packages/validators/src/index.ts`
- [x] Exportar todos los schemas
- [x] Exportar todos los tipos

---

## FASE 6: API COMPARTIDA (HONO)

### 6.1 Inicialización (packages/api)

#### 6.1.1 Setup
- [ ] Crear `packages/api/package.json`
- [ ] Instalar `hono`
- [ ] Instalar `@hono/zod-validator`
- [ ] Crear `packages/api/tsconfig.json`

#### 6.1.2 Estructura Base
- [ ] Crear `packages/api/src/index.ts` con app Hono base
- [ ] Crear `packages/api/src/lib/response.ts` con helpers de respuesta
- [ ] Crear `packages/api/src/middleware/cors.ts`
- [ ] Crear `packages/api/src/middleware/auth.ts` (verificar session)
- [ ] Crear `packages/api/src/middleware/admin.ts` (verificar rol admin)

### 6.2 Rutas Públicas

#### 6.2.1 Productos
- [ ] Crear `packages/api/src/routes/products.ts`
- [ ] GET `/products` - listar con filtros
- [ ] GET `/products/:slug` - detalle
- [ ] GET `/products/:slug/related` - relacionados
- [ ] Implementar validación de query params con Zod
- [ ] Implementar paginación

#### 6.2.2 Categorías
- [ ] Crear `packages/api/src/routes/categories.ts`
- [ ] GET `/categories` - árbol completo
- [ ] GET `/categories/:slug` - categoría con productos

#### 6.2.3 Bundles
- [ ] Crear `packages/api/src/routes/bundles.ts`
- [ ] GET `/bundles` - listar activos
- [ ] GET `/bundles/:slug` - detalle

#### 6.2.4 Búsqueda
- [ ] Crear `packages/api/src/routes/search.ts`
- [ ] GET `/search` - búsqueda fuzzy en productos
- [ ] Implementar autocompletado

#### 6.2.5 Carrito
- [ ] Crear `packages/api/src/routes/cart.ts`
- [ ] POST `/cart` - crear/obtener carrito
- [ ] GET `/cart/:id` - obtener carrito
- [ ] POST `/cart/:id/items` - agregar item
- [ ] PATCH `/cart/:id/items/:itemId` - actualizar cantidad
- [ ] DELETE `/cart/:id/items/:itemId` - eliminar item
- [ ] POST `/cart/:id/coupon` - aplicar cupón
- [ ] DELETE `/cart/:id/coupon` - remover cupón

#### 6.2.6 Pedidos (Público)
- [ ] Crear `packages/api/src/routes/orders.ts`
- [ ] POST `/orders` - crear orden (checkout)
- [ ] GET `/orders/:id` - estado de orden (con token)

#### 6.2.7 Páginas
- [ ] Crear `packages/api/src/routes/pages.ts`
- [ ] GET `/pages/:slug` - contenido de página

#### 6.2.8 Settings
- [ ] Crear `packages/api/src/routes/settings.ts`
- [ ] GET `/settings/public` - config pública (branding, social)

### 6.3 Rutas Admin

#### 6.3.1 Productos Admin
- [ ] Crear `packages/api/src/routes/admin/products.ts`
- [ ] GET `/admin/products` - listar todos
- [ ] POST `/admin/products` - crear
- [ ] GET `/admin/products/:id` - obtener
- [ ] PATCH `/admin/products/:id` - actualizar
- [ ] DELETE `/admin/products/:id` - eliminar
- [ ] POST `/admin/products/:id/variants` - crear variante
- [ ] PATCH `/admin/products/:id/variants/:vid` - actualizar variante
- [ ] DELETE `/admin/products/:id/variants/:vid` - eliminar variante
- [ ] POST `/admin/products/:id/images` - subir imágenes
- [ ] PATCH `/admin/products/:id/images/reorder` - reordenar
- [ ] DELETE `/admin/products/:id/images/:iid` - eliminar imagen

#### 6.3.2 Categorías Admin
- [ ] Crear `packages/api/src/routes/admin/categories.ts`
- [ ] GET `/admin/categories` - listar
- [ ] POST `/admin/categories` - crear
- [ ] PATCH `/admin/categories/:id` - actualizar
- [ ] DELETE `/admin/categories/:id` - eliminar
- [ ] PATCH `/admin/categories/reorder` - reordenar

#### 6.3.3 Bundles Admin
- [ ] Crear `packages/api/src/routes/admin/bundles.ts`
- [ ] GET `/admin/bundles` - listar
- [ ] POST `/admin/bundles` - crear
- [ ] PATCH `/admin/bundles/:id` - actualizar
- [ ] DELETE `/admin/bundles/:id` - eliminar

#### 6.3.4 Pedidos Admin
- [ ] Crear `packages/api/src/routes/admin/orders.ts`
- [ ] GET `/admin/orders` - listar con filtros
- [ ] GET `/admin/orders/:id` - detalle
- [ ] PATCH `/admin/orders/:id/status` - cambiar estado
- [ ] POST `/admin/orders/:id/notes` - agregar nota

#### 6.3.5 Inventario Admin
- [ ] Crear `packages/api/src/routes/admin/inventory.ts`
- [ ] GET `/admin/inventory` - vista de stock
- [ ] GET `/admin/inventory/low-stock` - alertas
- [ ] POST `/admin/inventory/adjust` - ajuste manual

#### 6.3.6 Cupones Admin
- [ ] Crear `packages/api/src/routes/admin/coupons.ts`
- [ ] GET `/admin/coupons` - listar
- [ ] POST `/admin/coupons` - crear
- [ ] PATCH `/admin/coupons/:id` - actualizar
- [ ] DELETE `/admin/coupons/:id` - eliminar

#### 6.3.7 Usuarios Admin
- [ ] Crear `packages/api/src/routes/admin/users.ts`
- [ ] GET `/admin/users` - listar
- [ ] GET `/admin/users/:id` - detalle
- [ ] PATCH `/admin/users/:id` - actualizar rol

#### 6.3.8 Páginas Admin
- [ ] Crear `packages/api/src/routes/admin/pages.ts`
- [ ] GET `/admin/pages` - listar
- [ ] POST `/admin/pages` - crear
- [ ] PATCH `/admin/pages/:id` - actualizar
- [ ] DELETE `/admin/pages/:id` - eliminar

#### 6.3.9 Settings Admin
- [ ] Crear `packages/api/src/routes/admin/settings.ts`
- [ ] GET `/admin/settings` - obtener todos
- [ ] PATCH `/admin/settings` - actualizar

#### 6.3.10 Dashboard Admin
- [ ] Crear `packages/api/src/routes/admin/dashboard.ts`
- [ ] GET `/admin/dashboard/stats` - métricas (pedidos, ventas, productos)
- [ ] GET `/admin/dashboard/recent-orders` - últimos 10 pedidos

### 6.4 Montar API en Apps

#### 6.4.1 Montar en Admin (Next.js)
- [ ] Crear `apps/admin/src/app/api/[...route]/route.ts`
- [ ] Importar y montar app Hono
- [ ] Configurar handlers GET, POST, PATCH, DELETE

#### 6.4.2 Montar en Web (Astro) - Si necesario
- [ ] Evaluar si web consume API de admin o necesita su propia
- [ ] Configurar endpoint si es necesario

---

## FASE 7: STORAGE (CLOUDFLARE R2)

### 7.1 Package de Storage (packages/storage)

#### 7.1.1 Setup
- [ ] Crear `packages/storage/package.json`
- [ ] Instalar `@aws-sdk/client-s3` (compatible con R2)
- [ ] Instalar `@aws-sdk/s3-request-presigner`
- [ ] Crear `packages/storage/tsconfig.json`

#### 7.1.2 Cliente R2
- [ ] Crear `packages/storage/src/client.ts`
- [ ] Configurar S3Client con credenciales R2
- [ ] Exportar cliente configurado

#### 7.1.3 Funciones de Upload
- [ ] Crear `packages/storage/src/upload.ts`
- [ ] Implementar `uploadFile` (buffer/stream a R2)
- [ ] Implementar `generatePresignedUploadUrl` (para upload directo)
- [ ] Implementar validación de tipo de archivo (imágenes, videos)
- [ ] Implementar generación de nombres únicos
- [ ] Implementar organización en carpetas (products/, categories/, etc.)

#### 7.1.4 Funciones de Delete
- [ ] Crear `packages/storage/src/delete.ts`
- [ ] Implementar `deleteFile`
- [ ] Implementar `deleteFiles` (batch)

#### 7.1.5 Funciones de URL
- [ ] Crear `packages/storage/src/url.ts`
- [ ] Implementar `getPublicUrl`
- [ ] Configurar dominio público de R2

### 7.2 Endpoint de Upload en Admin

- [ ] Crear `apps/admin/src/app/api/upload/route.ts`
- [ ] Implementar POST para upload de archivos
- [ ] Validar tipo y tamaño de archivo
- [ ] Retornar URL pública
- [ ] Implementar DELETE para eliminar archivo

---

## FASE 8: EMAIL (RESEND)

### 8.1 Package de Email (packages/email)

#### 8.1.1 Setup
- [ ] Crear `packages/email/package.json`
- [ ] Instalar `resend`
- [ ] Instalar `@react-email/components`
- [ ] Crear `packages/email/tsconfig.json`

#### 8.1.2 Componentes Base
- [ ] Crear `packages/email/src/components/Layout.tsx`
- [ ] Crear `packages/email/src/components/Header.tsx` (logo, branding)
- [ ] Crear `packages/email/src/components/Footer.tsx`
- [ ] Crear `packages/email/src/components/Button.tsx`

#### 8.1.3 Templates
- [ ] Crear `packages/email/src/templates/OrderConfirmation.tsx` (cliente)
- [ ] Crear `packages/email/src/templates/NewOrderAdmin.tsx` (admin)
- [ ] Crear `packages/email/src/templates/OrderStatusUpdate.tsx`
- [ ] Crear `packages/email/src/templates/WelcomeEmail.tsx`
- [ ] Crear `packages/email/src/templates/PasswordReset.tsx`

#### 8.1.4 Función de Envío
- [ ] Crear `packages/email/src/send.ts`
- [ ] Configurar cliente Resend
- [ ] Implementar `sendEmail` genérico
- [ ] Implementar `sendOrderConfirmation`
- [ ] Implementar `sendNewOrderNotification`
- [ ] Implementar `sendOrderStatusUpdate`
- [ ] Implementar `sendWelcomeEmail`

### 8.2 Integración

- [ ] Llamar `sendOrderConfirmation` al crear orden
- [ ] Llamar `sendNewOrderNotification` al crear orden
- [ ] Llamar `sendOrderStatusUpdate` al cambiar estado
- [ ] Llamar `sendWelcomeEmail` al registrar usuario

---

## FASE 9: INTERNACIONALIZACIÓN

### 9.1 Package i18n (packages/i18n)

#### 9.1.1 Setup
- [ ] Crear `packages/i18n/package.json`
- [ ] Instalar `@inlang/paraglide-js`
- [ ] Crear `packages/i18n/project.inlang/settings.json`
- [ ] Crear `packages/i18n/tsconfig.json`

#### 9.1.2 Mensajes en Español
- [ ] Crear `packages/i18n/src/messages/es.json`
- [ ] Agregar traducciones para navegación
- [ ] Agregar traducciones para productos
- [ ] Agregar traducciones para carrito
- [ ] Agregar traducciones para checkout
- [ ] Agregar traducciones para formularios
- [ ] Agregar traducciones para errores
- [ ] Agregar traducciones para admin

#### 9.1.3 Integración
- [ ] Configurar Paraglide en Astro
- [ ] Configurar Paraglide en Next.js
- [ ] Crear helper para formateo de moneda (ARS/USD)
- [ ] Crear helper para formateo de fechas

---

## FASE 10: ADMIN - LAYOUT Y NAVEGACIÓN

### 10.1 Layout Principal

#### 10.1.1 Sidebar
- [ ] Crear `apps/admin/src/components/layout/Sidebar.tsx`
- [ ] Implementar logo/branding en header del sidebar
- [ ] Implementar navegación con iconos (Lucide)
- [ ] Secciones: Dashboard, Catálogo (productos, categorías, bundles), Ventas (pedidos, cupones), Clientes, Contenido (páginas), Configuración
- [ ] Implementar indicador de sección activa
- [ ] Implementar colapso del sidebar (mobile y toggle)
- [ ] Persistir estado colapsado en localStorage

#### 10.1.2 Header
- [ ] Crear `apps/admin/src/components/layout/Header.tsx`
- [ ] Implementar toggle de sidebar (hamburger)
- [ ] Implementar breadcrumbs dinámicos
- [ ] Implementar búsqueda global (opcional MVP)
- [ ] Implementar toggle de tema (dark/light)
- [ ] Implementar UserMenu (avatar, dropdown)

#### 10.1.3 Breadcrumbs
- [ ] Crear `apps/admin/src/components/layout/Breadcrumbs.tsx`
- [ ] Implementar generación automática desde ruta
- [ ] Implementar navegación clickeable

#### 10.1.4 Layout Dashboard
- [ ] Crear `apps/admin/src/app/(dashboard)/layout.tsx`
- [ ] Integrar Sidebar, Header
- [ ] Implementar área de contenido con scroll
- [ ] Implementar responsive (sidebar drawer en mobile)

### 10.2 Componentes Compartidos Admin

#### 10.2.1 Data Table
- [ ] Crear `apps/admin/src/components/shared/DataTable.tsx`
- [ ] Implementar con TanStack Table
- [ ] Implementar ordenamiento por columnas
- [ ] Implementar paginación
- [ ] Implementar selección de filas
- [ ] Implementar búsqueda/filtros
- [ ] Implementar acciones por fila
- [ ] Implementar skeleton loading
- [ ] Implementar empty state

#### 10.2.2 Page Header
- [ ] Crear `apps/admin/src/components/shared/PageHeader.tsx`
- [ ] Implementar título de página
- [ ] Implementar descripción opcional
- [ ] Implementar acciones (botones)
- [ ] Implementar tabs si aplica

#### 10.2.3 Confirm Dialog
- [ ] Crear `apps/admin/src/components/shared/ConfirmDialog.tsx`
- [ ] Implementar con AlertDialog de shadcn
- [ ] Props: título, mensaje, onConfirm, variant (danger/warning)

#### 10.2.4 Empty State
- [ ] Crear `apps/admin/src/components/shared/EmptyState.tsx`
- [ ] Implementar ilustración/icono
- [ ] Implementar título y descripción
- [ ] Implementar acción (botón)

#### 10.2.5 File Upload
- [ ] Crear `apps/admin/src/components/shared/FileUpload.tsx`
- [ ] Implementar drag & drop
- [ ] Implementar preview de imágenes
- [ ] Implementar progress de upload
- [ ] Implementar validación de tipo/tamaño
- [ ] Implementar múltiples archivos

#### 10.2.6 Rich Text Editor
- [ ] Crear `apps/admin/src/components/shared/RichTextEditor.tsx`
- [ ] Evaluar: Tiptap, Plate, o similar
- [ ] Implementar toolbar básico (bold, italic, lists, links)
- [ ] Implementar output HTML

### 10.3 Sistema de Notificaciones

#### 10.3.1 Toast
- [ ] Configurar Sonner en layout admin
- [ ] Crear helpers: `toast.success()`, `toast.error()`, etc.
- [ ] Estilizar según design system

---

## FASE 11: ADMIN - GESTIÓN DE PRODUCTOS

### 11.1 Listado de Productos

#### 11.1.1 Página de Listado
- [ ] Crear `apps/admin/src/app/(dashboard)/productos/page.tsx`
- [ ] Implementar PageHeader con título y botón "Nuevo producto"
- [ ] Implementar filtros: estado, categoría, búsqueda
- [ ] Implementar DataTable con columnas: imagen, nombre, categoría, precio, stock, estado, acciones
- [ ] Implementar paginación
- [ ] Implementar acciones: editar, duplicar, eliminar
- [ ] Implementar selección múltiple y acciones batch

#### 11.1.2 Hooks de Productos
- [ ] Crear `apps/admin/src/hooks/useProducts.ts`
- [ ] Implementar `useProducts` (listado con TanStack Query)
- [ ] Implementar `useProduct` (detalle)
- [ ] Implementar `useCreateProduct` (mutation)
- [ ] Implementar `useUpdateProduct` (mutation)
- [ ] Implementar `useDeleteProduct` (mutation)

### 11.2 Formulario de Producto

#### 11.2.1 Página Nuevo Producto
- [ ] Crear `apps/admin/src/app/(dashboard)/productos/nuevo/page.tsx`
- [ ] Implementar breadcrumb
- [ ] Renderizar ProductForm

#### 11.2.2 Página Editar Producto
- [ ] Crear `apps/admin/src/app/(dashboard)/productos/[id]/page.tsx`
- [ ] Cargar datos del producto
- [ ] Renderizar ProductForm con datos

#### 11.2.3 Componente ProductForm
- [ ] Crear `apps/admin/src/components/products/ProductForm.tsx`
- [ ] Implementar con react-hook-form + zod resolver
- [ ] Implementar tabs: General, Media, Variantes, Inventario, SEO
- [ ] Implementar autosave (opcional)
- [ ] Implementar preview

#### 11.2.4 Tab General
- [ ] Campo: Nombre (input)
- [ ] Campo: Slug (auto-generado, editable)
- [ ] Campo: Categoría (select con árbol)
- [ ] Campo: Descripción corta (textarea)
- [ ] Campo: Descripción rica (RichTextEditor)
- [ ] Campo: Tags (multi-select/combobox)
- [ ] Campo: Estado (select: borrador, activo, archivado)

#### 11.2.5 Tab Precios
- [ ] Campo: Precio base (input number con formato moneda)
- [ ] Campo: Precio de comparación (tachado)
- [ ] Campo: Costo (interno, para márgenes)
- [ ] Mostrar margen calculado

#### 11.2.6 Tab Media
- [ ] Crear `apps/admin/src/components/products/ImageGallery.tsx`
- [ ] Implementar upload múltiple de imágenes
- [ ] Implementar drag & drop para reordenar
- [ ] Implementar selección de imagen principal
- [ ] Implementar eliminación de imagen
- [ ] Implementar upload de video (URL o archivo)
- [ ] Mostrar preview de video

#### 11.2.7 Tab Variantes
- [ ] Crear `apps/admin/src/components/products/VariantManager.tsx`
- [ ] Toggle: "Este producto tiene variantes"
- [ ] Si no tiene variantes: campos de stock y SKU simples
- [ ] Si tiene variantes:
  - [ ] Selector de atributos (de los definidos en categoría)
  - [ ] Agregar valores de atributos
  - [ ] Generar combinaciones automáticamente
  - [ ] Tabla de variantes con: SKU, precio, stock, imagen
  - [ ] Edición inline de cada variante
  - [ ] Eliminar variante

#### 11.2.8 Tab Inventario
- [ ] Toggle: "Rastrear inventario"
- [ ] Si tiene variantes: mostrar resumen de stock por variante
- [ ] Si no tiene variantes: campo de stock directo
- [ ] Campo: Umbral de stock bajo (alerta)
- [ ] Campo: SKU (si no tiene variantes)

#### 11.2.9 Tab SEO
- [ ] Campo: Título SEO (con contador de caracteres)
- [ ] Campo: Meta descripción (con contador)
- [ ] Campo: Imagen OG (upload o seleccionar de galería)
- [ ] Preview de cómo se ve en Google

#### 11.2.10 Acciones del Formulario
- [ ] Botón: Guardar como borrador
- [ ] Botón: Publicar
- [ ] Botón: Cancelar (con confirmación si hay cambios)
- [ ] Botón: Eliminar (en edición, con confirmación)

### 11.3 Gestión de Categorías

#### 11.3.1 Página de Categorías
- [ ] Crear `apps/admin/src/app/(dashboard)/categorias/page.tsx`
- [ ] Implementar PageHeader
- [ ] Implementar árbol de categorías (expandible)
- [ ] Implementar drag & drop para reordenar
- [ ] Implementar acciones: editar, agregar subcategoría, eliminar

#### 11.3.2 Modal/Drawer de Categoría
- [ ] Crear `apps/admin/src/components/categories/CategoryForm.tsx`
- [ ] Campo: Nombre
- [ ] Campo: Slug
- [ ] Campo: Descripción
- [ ] Campo: Imagen (upload)
- [ ] Campo: Categoría padre (select)
- [ ] Campo: Estado
- [ ] Campo: SEO (título, descripción)
- [ ] Selector de atributos para esta categoría

#### 11.3.3 Hooks de Categorías
- [ ] Crear `apps/admin/src/hooks/useCategories.ts`
- [ ] Implementar `useCategories` (árbol)
- [ ] Implementar `useCreateCategory`
- [ ] Implementar `useUpdateCategory`
- [ ] Implementar `useDeleteCategory`
- [ ] Implementar `useReorderCategories`

### 11.4 Gestión de Bundles

#### 11.4.1 Página de Bundles
- [ ] Crear `apps/admin/src/app/(dashboard)/bundles/page.tsx`
- [ ] Implementar listado con DataTable
- [ ] Columnas: imagen, nombre, productos incluidos, precio, ahorro, estado

#### 11.4.2 Formulario de Bundle
- [ ] Crear `apps/admin/src/app/(dashboard)/bundles/nuevo/page.tsx`
- [ ] Crear `apps/admin/src/app/(dashboard)/bundles/[id]/page.tsx`
- [ ] Crear `apps/admin/src/components/bundles/BundleForm.tsx`
- [ ] Campo: Nombre
- [ ] Campo: Slug
- [ ] Campo: Descripción
- [ ] Campo: Imagen
- [ ] Selector de productos (con búsqueda)
- [ ] Para cada producto: seleccionar variante (si aplica), cantidad
- [ ] Mostrar precio total de productos individuales
- [ ] Campo: Precio del bundle (debe ser menor)
- [ ] Mostrar ahorro calculado
- [ ] Campo: Vigencia (desde/hasta)
- [ ] Campo: Estado

---

## FASE 12: ADMIN - GESTIÓN DE PEDIDOS

### 12.1 Listado de Pedidos

#### 12.1.1 Página de Pedidos
- [ ] Crear `apps/admin/src/app/(dashboard)/pedidos/page.tsx`
- [ ] Implementar PageHeader
- [ ] Implementar filtros: estado, fecha, búsqueda (número, email)
- [ ] Implementar DataTable con columnas: número, cliente, fecha, items, total, estado, acciones
- [ ] Implementar badge de estado con colores
- [ ] Implementar paginación

#### 12.1.2 Hooks de Pedidos
- [ ] Crear `apps/admin/src/hooks/useOrders.ts`
- [ ] Implementar `useOrders` (listado)
- [ ] Implementar `useOrder` (detalle)
- [ ] Implementar `useUpdateOrderStatus`
- [ ] Implementar `useAddOrderNote`

### 12.2 Detalle de Pedido

#### 12.2.1 Página de Detalle
- [ ] Crear `apps/admin/src/app/(dashboard)/pedidos/[id]/page.tsx`
- [ ] Mostrar número de pedido y estado prominente
- [ ] Mostrar información del cliente (nombre, email, teléfono)
- [ ] Mostrar dirección de envío
- [ ] Mostrar listado de items con imagen, nombre, variante, cantidad, precio
- [ ] Mostrar resumen: subtotal, descuento, envío, total
- [ ] Mostrar cupón aplicado si existe

#### 12.2.2 Cambio de Estado
- [ ] Crear `apps/admin/src/components/orders/OrderStatusSelect.tsx`
- [ ] Implementar select con estados disponibles
- [ ] Mostrar historial de estados con fechas
- [ ] Al cambiar estado: confirmar y enviar email al cliente

#### 12.2.3 Notas del Pedido
- [ ] Crear `apps/admin/src/components/orders/OrderNotes.tsx`
- [ ] Mostrar notas del cliente
- [ ] Área para notas internas (admin)
- [ ] Historial de notas con autor y fecha

#### 12.2.4 Acciones
- [ ] Botón: Imprimir pedido
- [ ] Botón: Reenviar email de confirmación
- [ ] Botón: Cancelar pedido (con confirmación)

---

## FASE 13: ADMIN - INVENTARIO

### 13.1 Vista de Inventario

#### 13.1.1 Página de Inventario
- [ ] Crear `apps/admin/src/app/(dashboard)/inventario/page.tsx`
- [ ] Implementar vista de todos los productos/variantes con stock
- [ ] Columnas: SKU, producto, variante, stock actual, umbral, estado
- [ ] Filtros: stock bajo, agotado, todos
- [ ] Búsqueda por SKU o nombre

#### 13.1.2 Alertas de Stock Bajo
- [ ] Destacar visualmente productos con stock bajo
- [ ] Mostrar contador de alertas en sidebar
- [ ] Implementar notificación en dashboard

### 13.2 Ajustes de Inventario

#### 13.2.1 Modal de Ajuste
- [ ] Crear `apps/admin/src/components/inventory/AdjustStockModal.tsx`
- [ ] Campo: Tipo (entrada, salida, ajuste)
- [ ] Campo: Cantidad
- [ ] Campo: Razón/Motivo
- [ ] Mostrar stock actual y nuevo stock calculado

#### 13.2.2 Historial de Movimientos
- [ ] Mostrar historial de movimientos por producto/variante
- [ ] Columnas: fecha, tipo, cantidad, razón, usuario

---

## FASE 14: ADMIN - CUPONES

### 14.1 Gestión de Cupones

#### 14.1.1 Página de Cupones
- [ ] Crear `apps/admin/src/app/(dashboard)/cupones/page.tsx`
- [ ] Implementar listado con DataTable
- [ ] Columnas: código, tipo, valor, uso, vigencia, estado

#### 14.1.2 Formulario de Cupón
- [ ] Crear `apps/admin/src/app/(dashboard)/cupones/[id]/page.tsx`
- [ ] Crear `apps/admin/src/components/coupons/CouponForm.tsx`
- [ ] Campo: Código (auto-generar o manual)
- [ ] Campo: Descripción
- [ ] Campo: Tipo (porcentaje, monto fijo, envío gratis)
- [ ] Campo: Valor
- [ ] Campo: Compra mínima
- [ ] Campo: Descuento máximo (para porcentaje)
- [ ] Campo: Límite de uso (total)
- [ ] Campo: Vigencia (desde/hasta)
- [ ] Campo: Estado

---

## FASE 15: ADMIN - CLIENTES

### 15.1 Gestión de Clientes

#### 15.1.1 Página de Clientes
- [ ] Crear `apps/admin/src/app/(dashboard)/clientes/page.tsx`
- [ ] Implementar listado con DataTable
- [ ] Columnas: nombre, email, pedidos, total gastado, registro
- [ ] Filtros: rol, con pedidos, sin pedidos

#### 15.1.2 Detalle de Cliente
- [ ] Crear `apps/admin/src/app/(dashboard)/clientes/[id]/page.tsx`
- [ ] Mostrar información del cliente
- [ ] Mostrar historial de pedidos
- [ ] Mostrar total gastado
- [ ] Opción para cambiar rol (customer/admin)

---

## FASE 16: ADMIN - PÁGINAS Y CONTENIDO

### 16.1 Editor de Páginas

#### 16.1.1 Página de Páginas
- [ ] Crear `apps/admin/src/app/(dashboard)/paginas/page.tsx`
- [ ] Listado de páginas: about, contacto, términos, privacidad, etc.
- [ ] Estado: borrador, publicado

#### 16.1.2 Editor de Página
- [ ] Crear `apps/admin/src/app/(dashboard)/paginas/[id]/page.tsx`
- [ ] Campo: Título
- [ ] Campo: Slug
- [ ] Campo: Contenido (RichTextEditor o MDX)
- [ ] Campo: SEO
- [ ] Campo: Estado
- [ ] Preview de la página

---

## FASE 17: ADMIN - CONFIGURACIÓN

### 17.1 Settings Generales

#### 17.1.1 Página de Configuración
- [ ] Crear `apps/admin/src/app/(dashboard)/configuracion/page.tsx`
- [ ] Implementar navegación con tabs o links a subsecciones

#### 17.1.2 General
- [ ] Crear `apps/admin/src/app/(dashboard)/configuracion/general/page.tsx`
- [ ] Campo: Nombre del negocio
- [ ] Campo: Email de contacto
- [ ] Campo: Teléfono
- [ ] Campo: Dirección
- [ ] Campo: Moneda (ARS, USD)
- [ ] Campo: Zona horaria

#### 17.1.3 Branding
- [ ] Crear `apps/admin/src/app/(dashboard)/configuracion/branding/page.tsx`
- [ ] Upload: Logo principal
- [ ] Upload: Logo para modo oscuro
- [ ] Upload: Favicon
- [ ] Selector: Color primario
- [ ] Selector: Color secundario

#### 17.1.4 Envío
- [ ] Crear `apps/admin/src/app/(dashboard)/configuracion/envio/page.tsx`
- [ ] Campo: Costo de envío fijo (MVP)
- [ ] Campo: Envío gratis a partir de (monto)
- [ ] Texto: Información de envío (tiempos, zonas)

#### 17.1.5 Notificaciones
- [ ] Crear `apps/admin/src/app/(dashboard)/configuracion/notificaciones/page.tsx`
- [ ] Campo: Email para notificaciones de pedidos
- [ ] Toggle: Notificar nuevo pedido
- [ ] Toggle: Notificar stock bajo

#### 17.1.6 SEO
- [ ] Crear `apps/admin/src/app/(dashboard)/configuracion/seo/page.tsx`
- [ ] Campo: Título por defecto del sitio
- [ ] Campo: Meta descripción por defecto
- [ ] Upload: Imagen OG por defecto
- [ ] Campo: Google Analytics ID (opcional)

#### 17.1.7 Redes Sociales
- [ ] Campo: Instagram URL
- [ ] Campo: Facebook URL
- [ ] Campo: WhatsApp número
- [ ] Campo: TikTok URL

### 17.2 Hooks de Settings

- [ ] Crear `apps/admin/src/hooks/useSettings.ts`
- [ ] Implementar `useSettings` (obtener por grupo)
- [ ] Implementar `useUpdateSettings`

---

## FASE 18: ADMIN - DASHBOARD

### 18.1 Página Principal

#### 18.1.1 Dashboard
- [ ] Crear `apps/admin/src/app/(dashboard)/page.tsx`
- [ ] Implementar grid de stats cards
- [ ] Card: Pedidos hoy (número y comparación con ayer)
- [ ] Card: Ventas hoy (monto)
- [ ] Card: Productos activos
- [ ] Card: Stock bajo (contador con link)

#### 18.1.2 Gráficos (Opcional MVP)
- [ ] Gráfico: Ventas últimos 7 días
- [ ] Gráfico: Pedidos por estado

#### 18.1.3 Actividad Reciente
- [ ] Lista: Últimos 5 pedidos con link a detalle
- [ ] Lista: Productos con stock bajo

---

## FASE 19: WEB PÚBLICA - LAYOUT

### 19.1 Layout Base

#### 19.1.1 Header
- [ ] Crear `apps/web/src/components/astro/layout/Header.astro`
- [ ] Implementar logo (desde settings)
- [ ] Implementar navegación principal (categorías)
- [ ] Implementar mega menu para categorías (desktop)
- [ ] Implementar barra de búsqueda
- [ ] Implementar iconos: favoritos (v1.1), carrito con contador
- [ ] Implementar toggle tema (dark/light)
- [ ] Implementar versión mobile (hamburger menu)

#### 19.1.2 Mobile Menu
- [ ] Crear `apps/web/src/components/react/layout/MobileMenu.tsx` (React island)
- [ ] Implementar drawer desde la izquierda
- [ ] Implementar navegación de categorías acordeón
- [ ] Implementar links a páginas

#### 19.1.3 Footer
- [ ] Crear `apps/web/src/components/astro/layout/Footer.astro`
- [ ] Sección: Links rápidos (categorías principales)
- [ ] Sección: Información (about, contacto, políticas)
- [ ] Sección: Redes sociales
- [ ] Sección: Newsletter (v1.1)
- [ ] Copyright y créditos

#### 19.1.4 Layouts
- [ ] Actualizar `apps/web/src/layouts/BaseLayout.astro`
- [ ] Integrar Header y Footer
- [ ] Implementar slot para contenido
- [ ] Crear `apps/web/src/layouts/CatalogLayout.astro` (con sidebar de filtros)
- [ ] Crear `apps/web/src/layouts/CheckoutLayout.astro` (simplificado)

### 19.2 Componentes Globales

#### 19.2.1 Theme Toggle
- [ ] Crear `apps/web/src/components/react/ThemeToggle.tsx`
- [ ] Implementar con Nanostores para persistir preferencia
- [ ] Integrar con sistema de Tailwind dark mode

#### 19.2.2 Cart Icon
- [ ] Crear `apps/web/src/components/react/cart/CartIcon.tsx`
- [ ] Mostrar contador de items
- [ ] Animación al agregar producto
- [ ] Click abre drawer de carrito

---

## FASE 20: WEB PÚBLICA - CATÁLOGO

### 20.1 Página de Inicio

#### 20.1.1 Home Page
- [ ] Crear `apps/web/src/pages/index.astro`
- [ ] Sección: Hero banner (configurable desde admin)
- [ ] Sección: Categorías destacadas (grid con imágenes)
- [ ] Sección: Productos destacados (tag "destacado")
- [ ] Sección: Nuevos productos (tag "nuevo")
- [ ] Sección: Ofertas (tag "oferta")
- [ ] Sección: Bundles activos

### 20.2 Listado de Productos

#### 20.2.1 Página de Categoría
- [ ] Crear `apps/web/src/pages/categoria/[slug].astro`
- [ ] Obtener categoría y productos de API
- [ ] Implementar breadcrumbs
- [ ] Implementar título y descripción de categoría
- [ ] Implementar subcategorías (si existen)
- [ ] Renderizar grid de productos
- [ ] Implementar paginación o infinite scroll

#### 20.2.2 Filtros
- [ ] Crear `apps/web/src/components/react/filters/ProductFilters.tsx` (React island)
- [ ] Filtro: Precio (range slider)
- [ ] Filtro: Material (checkboxes dinámicos de atributos)
- [ ] Filtro: Talla (checkboxes)
- [ ] Filtro: Tags (nuevo, oferta)
- [ ] Filtro: En stock
- [ ] Botón: Limpiar filtros
- [ ] Sincronizar con URL params

#### 20.2.3 Ordenamiento
- [ ] Crear `apps/web/src/components/react/filters/SortSelect.tsx`
- [ ] Opciones: Relevancia, Precio menor, Precio mayor, Más nuevos
- [ ] Sincronizar con URL params

#### 20.2.4 Grid de Productos
- [ ] Crear `apps/web/src/components/astro/product/ProductGrid.astro`
- [ ] Implementar grid responsive (2 cols mobile, 3 tablet, 4 desktop)
- [ ] Renderizar ProductCard para cada producto
- [ ] Implementar skeleton loading

#### 20.2.5 Product Card
- [ ] Crear `apps/web/src/components/astro/product/ProductCard.astro`
- [ ] Imagen con aspect-ratio 1:1
- [ ] Hover: mostrar segunda imagen (si existe)
- [ ] Hover: botón de quick view
- [ ] Categoría (link)
- [ ] Nombre del producto
- [ ] Precio y precio tachado
- [ ] Tags/badges (nuevo, oferta, agotado)
- [ ] Animación con Framer Motion

### 20.3 Quick View

#### 20.3.1 Modal Quick View
- [ ] Crear `apps/web/src/components/react/product/QuickView.tsx` (React island)
- [ ] Implementar modal/dialog
- [ ] Mostrar imagen principal
- [ ] Mostrar nombre, precio, descripción corta
- [ ] Selector de variante (si aplica)
- [ ] Selector de cantidad
- [ ] Botón: Agregar al carrito
- [ ] Link: Ver detalles completos

---

## FASE 21: WEB PÚBLICA - DETALLE DE PRODUCTO

### 21.1 Página de Producto

#### 21.1.1 Page
- [ ] Crear `apps/web/src/pages/producto/[slug].astro`
- [ ] Obtener producto completo de API
- [ ] Implementar breadcrumbs
- [ ] Implementar SEO meta tags
- [ ] Implementar structured data (JSON-LD Product)

#### 21.1.2 Galería de Imágenes
- [ ] Crear `apps/web/src/components/react/product/ProductGallery.tsx`
- [ ] Imagen principal grande
- [ ] Thumbnails debajo (horizontal scroll en mobile)
- [ ] Click en thumbnail cambia principal
- [ ] Zoom on hover (lupa)
- [ ] Click abre lightbox fullscreen
- [ ] Soporte para video (thumbnail con play icon)

#### 21.1.3 Información del Producto
- [ ] Crear `apps/web/src/components/react/product/ProductInfo.tsx`
- [ ] Nombre del producto (heading)
- [ ] Categoría (link)
- [ ] Precio y precio tachado
- [ ] Tags/badges
- [ ] Descripción corta
- [ ] Stock status badge

#### 21.1.4 Selector de Variantes
- [ ] Crear `apps/web/src/components/react/product/VariantSelector.tsx`
- [ ] Para cada atributo: mostrar opciones
- [ ] Para color: mostrar swatches de color
- [ ] Para talla: mostrar botones
- [ ] Mostrar disponibilidad por variante
- [ ] Deshabilitar variantes agotadas
- [ ] Actualizar precio si variante tiene precio diferente
- [ ] Actualizar imagen si variante tiene imagen

#### 21.1.5 Agregar al Carrito
- [ ] Crear `apps/web/src/components/react/product/AddToCart.tsx`
- [ ] Selector de cantidad
- [ ] Botón: Agregar al carrito
- [ ] Mostrar error si no hay stock
- [ ] Animación de confirmación
- [ ] Abrir drawer de carrito después de agregar

#### 21.1.6 Descripción Completa
- [ ] Renderizar rich description (HTML seguro)
- [ ] Implementar tabs si hay mucho contenido
- [ ] Tab: Descripción
- [ ] Tab: Especificaciones (atributos)
- [ ] Tab: Envío y devoluciones (desde settings)

#### 21.1.7 Productos Relacionados
- [ ] Crear `apps/web/src/components/astro/product/RelatedProducts.astro`
- [ ] Obtener productos de misma categoría
- [ ] Renderizar carousel/grid de ProductCards
- [ ] Título: "También te puede gustar"

#### 21.1.8 Share Social
- [ ] Crear `apps/web/src/components/react/product/ShareButtons.tsx`
- [ ] Botones: WhatsApp, Facebook, Twitter, Copiar link
- [ ] Implementar Web Share API en mobile

---

## FASE 22: WEB PÚBLICA - BUNDLES

### 22.1 Listado de Bundles

#### 22.1.1 Sección en Home
- [ ] Mostrar bundles activos en home
- [ ] Card especial para bundles (mostrar ahorro)

### 22.2 Detalle de Bundle

#### 22.2.1 Página
- [ ] Crear `apps/web/src/pages/bundle/[slug].astro`
- [ ] Mostrar imagen del bundle
- [ ] Mostrar nombre y descripción
- [ ] Listar productos incluidos con imagen y link
- [ ] Mostrar precio original (suma) vs precio bundle
- [ ] Mostrar ahorro destacado
- [ ] Botón: Agregar bundle al carrito

---

## FASE 23: WEB PÚBLICA - BÚSQUEDA

### 23.1 Barra de Búsqueda

#### 23.1.1 Search Input
- [ ] Crear `apps/web/src/components/react/search/SearchInput.tsx`
- [ ] Input con icono de lupa
- [ ] Implementar debounce (300ms)
- [ ] Mostrar dropdown de sugerencias (autocompletado)
- [ ] Mostrar productos coincidentes con imagen
- [ ] Mostrar categorías coincidentes
- [ ] Enter navega a página de resultados

### 23.2 Página de Resultados

#### 23.2.1 Search Page
- [ ] Crear `apps/web/src/pages/buscar.astro`
- [ ] Obtener query de URL params
- [ ] Mostrar término buscado
- [ ] Mostrar cantidad de resultados
- [ ] Reutilizar grid y filtros de categoría
- [ ] Empty state si no hay resultados (sugerencias)

---

## FASE 24: WEB PÚBLICA - CARRITO

### 24.1 Store del Carrito

#### 24.1.1 Nanostore
- [ ] Crear `apps/web/src/stores/cart.ts`
- [ ] Estado: items, total, itemCount
- [ ] Persistir en localStorage
- [ ] Acción: addItem
- [ ] Acción: updateQuantity
- [ ] Acción: removeItem
- [ ] Acción: clearCart
- [ ] Acción: applyCoupon
- [ ] Acción: removeCoupon
- [ ] Sincronizar con servidor (para usuarios logueados)

### 24.2 Drawer de Carrito

#### 24.2.1 Cart Drawer
- [ ] Crear `apps/web/src/components/react/cart/CartDrawer.tsx`
- [ ] Implementar Sheet/Drawer desde la derecha
- [ ] Header: "Tu carrito" + botón cerrar
- [ ] Lista de items con: imagen, nombre, variante, precio, cantidad, eliminar
- [ ] Actualizar cantidad inline
- [ ] Subtotal
- [ ] Botón: Ver carrito
- [ ] Botón: Checkout
- [ ] Empty state si carrito vacío

### 24.3 Página de Carrito

#### 24.3.1 Cart Page
- [ ] Crear `apps/web/src/pages/carrito.astro`
- [ ] Implementar tabla/lista de items
- [ ] Columnas: producto (imagen, nombre, variante), precio unitario, cantidad, subtotal, eliminar
- [ ] Actualizar cantidades
- [ ] Campo: Código de cupón + aplicar
- [ ] Mostrar descuento si cupón aplicado
- [ ] Resumen: subtotal, descuento, envío (estimado), total
- [ ] Botón: Continuar comprando
- [ ] Botón: Proceder al checkout
- [ ] Empty state con link a productos

---

## FASE 25: WEB PÚBLICA - CHECKOUT

### 25.1 Página de Checkout

#### 25.1.1 Checkout Page
- [ ] Crear `apps/web/src/pages/checkout.astro`
- [ ] Usar CheckoutLayout (simplificado)
- [ ] Verificar que hay items en carrito (redirect si vacío)
- [ ] Implementar formulario multi-step o single page

#### 25.1.2 Formulario de Contacto
- [ ] Campo: Nombre completo (requerido)
- [ ] Campo: Email (requerido, validación)
- [ ] Campo: Teléfono (requerido para contacto)

#### 25.1.3 Formulario de Envío
- [ ] Campo: Dirección
- [ ] Campo: Ciudad
- [ ] Campo: Provincia/Estado
- [ ] Campo: Código postal
- [ ] Campo: País (select, default Argentina)
- [ ] Checkbox: Dirección de facturación igual a envío

#### 25.1.4 Notas del Pedido
- [ ] Campo: Notas adicionales (opcional, textarea)

#### 25.1.5 Resumen del Pedido
- [ ] Mostrar items del carrito (colapsable en mobile)
- [ ] Mostrar subtotal
- [ ] Mostrar descuento (cupón)
- [ ] Mostrar envío
- [ ] Mostrar total

#### 25.1.6 Confirmar Pedido
- [ ] Validar formulario con Zod
- [ ] Botón: Confirmar pedido
- [ ] Mostrar loading durante procesamiento
- [ ] Crear orden via API
- [ ] Limpiar carrito
- [ ] Redirect a página de confirmación

### 25.2 Confirmación

#### 25.2.1 Página de Confirmación
- [ ] Crear `apps/web/src/pages/confirmacion/[orderId].astro`
- [ ] Obtener orden por ID
- [ ] Mostrar mensaje de éxito
- [ ] Mostrar número de pedido
- [ ] Mostrar resumen del pedido
- [ ] Mensaje: "Te enviamos un email de confirmación"
- [ ] Link: Volver a la tienda

---

## FASE 26: WEB PÚBLICA - PÁGINAS ESTÁTICAS

### 26.1 Páginas de Contenido

#### 26.1.1 Dynamic Pages
- [ ] Crear `apps/web/src/pages/[...slug].astro`
- [ ] Obtener página por slug de API
- [ ] Renderizar contenido (MDX/HTML)
- [ ] 404 si no existe

#### 26.1.2 Páginas Predefinidas
- [ ] Crear contenido: "Sobre nosotros"
- [ ] Crear contenido: "Contacto"
- [ ] Crear contenido: "Términos y condiciones"
- [ ] Crear contenido: "Política de privacidad"
- [ ] Crear contenido: "Envíos y devoluciones"

---

## FASE 27: PWA

### 27.1 Configuración PWA

#### 27.1.1 Manifest
- [ ] Instalar `@vite-pwa/astro`
- [ ] Configurar en `astro.config.mjs`
- [ ] Crear `manifest.json` con:
  - [ ] name, short_name
  - [ ] description
  - [ ] theme_color, background_color
  - [ ] icons (múltiples tamaños)
  - [ ] start_url
  - [ ] display: standalone

#### 27.1.2 Service Worker
- [ ] Configurar estrategia de caching
- [ ] Cache: assets estáticos (CSS, JS, fonts)
- [ ] Cache: imágenes de productos
- [ ] Network first: API calls
- [ ] Offline fallback page

#### 27.1.3 Install Prompt
- [ ] Crear `apps/web/src/components/react/pwa/InstallPrompt.tsx`
- [ ] Detectar `beforeinstallprompt` event
- [ ] Mostrar banner/modal sugiriendo instalación
- [ ] Guardar preferencia si usuario descarta

### 27.2 App Icons

- [ ] Generar iconos en múltiples tamaños (16, 32, 192, 512)
- [ ] Generar apple-touch-icon
- [ ] Generar favicon.ico
- [ ] Configurar en manifest y HTML

---

## FASE 28: SEO

### 28.1 Meta Tags

#### 28.1.1 Componente SEO
- [ ] Actualizar `apps/web/src/components/astro/SEO.astro`
- [ ] Title tag dinámico
- [ ] Meta description
- [ ] Canonical URL
- [ ] Open Graph tags (og:title, og:description, og:image, og:url)
- [ ] Twitter cards (twitter:card, twitter:title, etc.)
- [ ] Robots meta (noindex para páginas internas)

#### 28.1.2 Implementar en Páginas
- [ ] Home: SEO desde settings
- [ ] Categoría: SEO de la categoría
- [ ] Producto: SEO del producto
- [ ] Páginas: SEO de cada página

### 28.2 Structured Data

#### 28.2.1 JSON-LD
- [ ] Crear helpers para generar JSON-LD
- [ ] Schema: Organization (en todas las páginas)
- [ ] Schema: WebSite (en home)
- [ ] Schema: BreadcrumbList (en todas las páginas)
- [ ] Schema: Product (en página de producto)
- [ ] Schema: ItemList (en listados de productos)

### 28.3 Sitemap y Robots

#### 28.3.1 Sitemap
- [ ] Configurar `@astrojs/sitemap`
- [ ] Incluir: home, categorías, productos, páginas
- [ ] Excluir: carrito, checkout, confirmación

#### 28.3.2 Robots.txt
- [ ] Crear `apps/web/public/robots.txt`
- [ ] Allow all para Googlebot
- [ ] Disallow: /carrito, /checkout, /confirmacion
- [ ] Sitemap reference

---

## FASE 29: ANIMACIONES

### 29.1 Page Transitions

#### 29.1.1 View Transitions (Astro)
- [ ] Habilitar View Transitions en Astro
- [ ] Configurar transiciones entre páginas
- [ ] Animación de fade para contenido
- [ ] Mantener header/footer estables

### 29.2 Micro-interacciones

#### 29.2.1 Framer Motion
- [ ] Instalar `framer-motion`
- [ ] Animar entrada de ProductCards (stagger)
- [ ] Animar hover de ProductCards (scale, shadow)
- [ ] Animar botón de agregar al carrito
- [ ] Animar contador del carrito
- [ ] Animar apertura de modales/drawers

#### 29.2.2 AutoAnimate
- [ ] Instalar `@formkit/auto-animate`
- [ ] Aplicar a lista de items del carrito
- [ ] Aplicar a lista de filtros activos
- [ ] Aplicar a lista de productos (on filter change)

### 29.3 Loading States

#### 29.3.1 Skeletons
- [ ] Crear skeleton para ProductCard
- [ ] Crear skeleton para ProductGrid
- [ ] Crear skeleton para ProductDetail
- [ ] Crear skeleton para CartDrawer

---

## FASE 30: THEMING

### 30.1 Dark/Light Mode

#### 30.1.1 Sistema de Temas
- [ ] Configurar Tailwind dark mode (class strategy)
- [ ] Crear store para preferencia de tema
- [ ] Persistir en localStorage
- [ ] Respetar preferencia del sistema (prefers-color-scheme)
- [ ] Implementar toggle en Header

#### 30.1.2 Estilos por Tema
- [ ] Verificar contraste en modo oscuro
- [ ] Ajustar colores de cards
- [ ] Ajustar colores de inputs
- [ ] Ajustar imágenes/iconos si necesario

---

## FASE 31: TESTING

### 31.1 Setup de Testing

#### 31.1.1 Unit Tests
- [ ] Instalar Vitest
- [ ] Configurar para packages y apps
- [ ] Escribir tests para validators
- [ ] Escribir tests para queries de DB
- [ ] Escribir tests para utils

#### 31.1.2 E2E Tests
- [ ] Instalar Playwright
- [ ] Configurar para web app
- [ ] Test: Navegar catálogo
- [ ] Test: Agregar producto al carrito
- [ ] Test: Completar checkout
- [ ] Test: Login admin
- [ ] Test: Crear producto

### 31.2 CI/CD

#### 31.2.1 GitHub Actions
- [ ] Crear `.github/workflows/ci.yml`
- [ ] Job: Lint
- [ ] Job: Type check
- [ ] Job: Unit tests
- [ ] Job: Build
- [ ] Job: E2E tests (opcional, en PR)

---

## FASE 32: DEPLOYMENT

### 32.1 Preparación

#### 32.1.1 Variables de Entorno
- [ ] Configurar variables en Vercel (web)
- [ ] Configurar variables en Vercel (admin)
- [ ] Configurar Neon (producción DB)
- [ ] Configurar Cloudflare R2 (producción)
- [ ] Configurar Resend (producción)

#### 32.1.2 Builds
- [ ] Verificar build de web sin errores
- [ ] Verificar build de admin sin errores
- [ ] Optimizar bundle size

### 32.2 Deploy

#### 32.2.1 Vercel Setup
- [ ] Crear proyecto Vercel para web
- [ ] Crear proyecto Vercel para admin
- [ ] Configurar dominios
- [ ] Configurar preview deployments

#### 32.2.2 Migraciones Producción
- [ ] Ejecutar migraciones en Neon
- [ ] Ejecutar seeds iniciales (settings, tags, admin user)

---

## FASE 33: DOCUMENTACIÓN

### 33.1 README

#### 33.1.1 Documentación Principal
- [ ] Actualizar README.md con descripción del proyecto
- [ ] Documentar requisitos (Node, pnpm, Docker)
- [ ] Documentar setup local
- [ ] Documentar estructura del proyecto
- [ ] Documentar comandos disponibles
- [ ] Documentar variables de entorno
- [ ] Documentar deployment

### 33.2 Documentación Técnica

- [ ] Documentar arquitectura en PDR.md
- [ ] Documentar API endpoints
- [ ] Documentar modelo de datos
- [ ] Documentar flujos de usuario

---

## BACKLOG (Post-MVP / v1.1)

### Wishlist/Favoritos
- [ ] Schema de wishlist
- [ ] API de wishlist
- [ ] UI de favoritos (corazón en productos)
- [ ] Página de favoritos

### Reviews/Valoraciones
- [ ] Schema de reviews
- [ ] API de reviews
- [ ] UI de estrellas en productos
- [ ] Formulario de review
- [ ] Moderación de reviews (admin)

### Comparador de Productos
- [ ] Store de comparación
- [ ] Botón comparar en productos
- [ ] Página de comparación (tabla)

### Dashboard Métricas
- [ ] Gráficos de ventas
- [ ] Productos más vendidos
- [ ] Clientes más frecuentes
- [ ] Exportar reportes

### Newsletter
- [ ] Schema de suscriptores
- [ ] Formulario de suscripción
- [ ] Integración con Resend
- [ ] Gestión de suscriptores (admin)

### Abandono de Carrito
- [ ] Job programado para detectar carritos abandonados
- [ ] Email de recordatorio
- [ ] Tracking de recuperación

### Mercado Pago
- [ ] Integración SDK
- [ ] Checkout Pro
- [ ] Webhooks de pago
- [ ] Estados de pago en pedidos

### Cálculo de Envío
- [ ] Integración con API de correo
- [ ] Cálculo por zona/peso
- [ ] Múltiples opciones de envío

---

## Notas

- Marcar tareas completadas con [x] inmediatamente después de terminarlas
- Actualizar fecha de "Última actualización" al modificar este archivo
- Agregar nuevas tareas que surjan durante el desarrollo
- Mover tareas bloqueadas a sección de Bloqueados con motivo

