# Gemfolio

> Plataforma e-commerce de joyería artesanal con catálogo público y panel de administración.

[![CI](https://github.com/your-org/gemfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/gemfolio/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-5.8-purple.svg)](https://astro.build/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Características

### Catálogo Público (Web)
- Catálogo de productos con imágenes HD y zoom
- Búsqueda con autocompletado
- Filtros por categoría, precio y tags
- Carrito de compras con persistencia local
- Checkout con formulario de contacto y envío
- PWA instalable con soporte offline
- SEO optimizado con structured data (JSON-LD)
- Modo claro/oscuro con preferencia del sistema
- View Transitions para navegación fluida
- 100% responsive (mobile-first)

### Panel de Administración
- Dashboard con métricas
- Gestión de productos con variantes
- Gestión de categorías y tags
- Bundles/Combos de productos
- Gestión de pedidos
- Gestión de clientes
- Cupones de descuento
- Páginas CMS dinámicas
- Autenticación con OAuth (Google, GitHub)

## Stack Tecnológico

### Frontend
| Tecnología | Uso |
|------------|-----|
| [Astro](https://astro.build/) | Web pública (SSG/SSR) |
| [TanStack Start](https://tanstack.com/start) | Panel admin (SPA con SSR) |
| [React 19](https://react.dev/) | Componentes interactivos |
| [Tailwind CSS v4](https://tailwindcss.com/) | Estilos |
| [Nanostores](https://github.com/nanostores/nanostores) | Estado cliente (web) |
| [Zustand](https://zustand-demo.pmnd.rs/) | Estado cliente (admin) |
| [TanStack Query](https://tanstack.com/query) | Server state |
| [TanStack Router](https://tanstack.com/router) | Routing (admin) |

### Backend
| Tecnología | Uso |
|------------|-----|
| [Drizzle ORM](https://orm.drizzle.team/) | ORM type-safe |
| [PostgreSQL](https://www.postgresql.org/) | Base de datos |
| [Better Auth](https://better-auth.com/) | Autenticación |
| [Zod](https://zod.dev/) | Validación |
| [Hono](https://hono.dev/) | API routes |

### Infraestructura
| Servicio | Uso |
|----------|-----|
| [Vercel](https://vercel.com/) | Hosting |
| [Neon](https://neon.tech/) | PostgreSQL serverless |
| [Cloudflare R2](https://www.cloudflare.com/r2/) | Storage de imágenes |
| [Resend](https://resend.com/) | Emails transaccionales |
| [UploadThing](https://uploadthing.com/) | Upload de archivos |

## Requisitos

- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker (para PostgreSQL local)

## Instalación

```bash
# Clonar repositorio
git clone https://github.com/your-org/gemfolio.git
cd gemfolio

# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example .env

# Iniciar base de datos (Docker)
pnpm db:start

# Ejecutar migraciones y seeds
pnpm db:push
pnpm db:seed

# Iniciar desarrollo
pnpm dev
```

## Scripts Disponibles

### Desarrollo
```bash
pnpm dev          # Inicia todos los servicios
pnpm dev:web      # Solo web (puerto 4321)
pnpm dev:admin    # Solo admin (puerto 3001)
```

### Base de Datos
```bash
pnpm db:start     # Inicia PostgreSQL en Docker
pnpm db:stop      # Detiene PostgreSQL
pnpm db:push      # Aplica schema a la DB
pnpm db:seed      # Inserta datos de ejemplo
pnpm db:studio    # Abre Drizzle Studio
pnpm db:generate  # Genera migraciones
```

### Calidad de Código
```bash
pnpm lint         # Ejecuta Biome lint
pnpm format       # Formatea código
pnpm typecheck    # Verifica tipos TypeScript
pnpm check        # Lint + format check
```

### Testing
```bash
pnpm test         # Tests unitarios (watch)
pnpm test:run     # Tests unitarios (una vez)
pnpm test:coverage # Tests con coverage
pnpm e2e          # Tests E2E con Playwright
pnpm e2e:ui       # Tests E2E con UI
```

### Build
```bash
pnpm build        # Build de producción
```

## Estructura del Proyecto

```
gemfolio/
├── apps/
│   ├── web/                    # Catálogo público (Astro)
│   │   ├── src/
│   │   │   ├── components/     # Componentes Astro y React
│   │   │   ├── layouts/        # Layouts base
│   │   │   ├── pages/          # Rutas del sitio
│   │   │   ├── stores/         # Nanostores (cart, ui)
│   │   │   └── lib/            # Utilidades
│   │   └── public/             # Assets estáticos
│   │
│   └── admin/                  # Panel de administración (TanStack Start)
│       ├── src/
│       │   ├── components/     # Componentes React
│       │   ├── routes/         # Rutas (file-based)
│       │   ├── hooks/          # Custom hooks
│       │   └── lib/            # Utilidades
│       └── app.config.ts       # Configuración TanStack
│
├── packages/
│   ├── api/                    # API compartida (Hono)
│   ├── auth/                   # Autenticación (Better Auth)
│   ├── db/                     # Schema y queries (Drizzle)
│   ├── email/                  # Templates de email (React Email)
│   ├── storage/                # Upload de archivos (R2)
│   ├── ui/                     # Componentes UI compartidos
│   ├── validators/             # Schemas Zod
│   └── config/                 # Configs compartidas
│
├── e2e/                        # Tests E2E (Playwright)
├── docker/                     # Docker compose para desarrollo
└── .github/                    # GitHub Actions
```

## Variables de Entorno

Ver `.env.example` para la lista completa. Las principales son:

```bash
# Base de datos
DATABASE_URL="postgresql://..."

# Autenticación
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:3001"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Storage
R2_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."

# Email
RESEND_API_KEY="..."
```

## API Endpoints

### Productos
- `GET /api/products` - Lista productos (con paginación y filtros)
- `GET /api/products/:slug` - Obtener producto por slug
- `POST /api/products` - Crear producto (admin)
- `PATCH /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Categorías
- `GET /api/categories` - Lista categorías
- `POST /api/categories` - Crear categoría (admin)

### Pedidos
- `GET /api/orders` - Lista pedidos (admin)
- `POST /api/orders` - Crear pedido
- `PATCH /api/orders/:id/status` - Actualizar estado (admin)

### Cupones
- `GET /api/coupons/validate/:code` - Validar cupón
- `POST /api/coupons` - Crear cupón (admin)

## Deployment

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones detalladas de deployment en Vercel.

## Testing

### Unit Tests
Los tests unitarios usan Vitest y Testing Library:
```bash
pnpm test:run
```

### E2E Tests
Los tests E2E usan Playwright:
```bash
pnpm e2e
```

## Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Convenciones de Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formato (no afecta código)
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Tareas de mantenimiento

## Licencia

MIT - ver [LICENSE](./LICENSE)
