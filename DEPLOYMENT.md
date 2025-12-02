# Deployment Guide

Este documento describe cómo desplegar Gemfolio en producción.

## Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Base de datos PostgreSQL (recomendado: [Neon](https://neon.tech))
- Cuenta en [Cloudflare R2](https://www.cloudflare.com/products/r2/) para storage
- Cuenta en [Resend](https://resend.com) para emails
- Credenciales OAuth de Google y GitHub

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel                                │
│  ┌─────────────────┐       ┌─────────────────┐              │
│  │   Web (Astro)   │       │ Admin (TanStack)│              │
│  │  gemfolio.com   │       │ admin.gemfolio  │              │
│  └────────┬────────┘       └────────┬────────┘              │
│           │                         │                        │
│           └─────────┬───────────────┘                        │
│                     │                                        │
└─────────────────────┼────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   ┌────▼────┐  ┌─────▼────┐  ┌────▼────┐
   │  Neon   │  │    R2    │  │ Resend  │
   │   DB    │  │ Storage  │  │  Email  │
   └─────────┘  └──────────┘  └─────────┘
```

## Paso 1: Configurar Base de Datos (Neon)

1. Crear cuenta en [Neon](https://neon.tech)
2. Crear nuevo proyecto
3. Copiar la connection string (con `?sslmode=require`)
4. Guardar como `DATABASE_URL`

## Paso 2: Configurar Storage (Cloudflare R2)

1. Crear cuenta en Cloudflare
2. Ir a R2 > Create bucket
3. Nombre: `gemfolio`
4. Crear API Token con permisos de lectura/escritura
5. Configurar dominio público para el bucket
6. Guardar:
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`
   - `R2_PUBLIC_URL`

## Paso 3: Configurar Email (Resend)

1. Crear cuenta en [Resend](https://resend.com)
2. Verificar dominio
3. Crear API Key
4. Guardar como `RESEND_API_KEY`

## Paso 4: Configurar OAuth

### Google OAuth
1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear proyecto o seleccionar existente
3. APIs & Services > Credentials > Create OAuth Client ID
4. Authorized redirect URIs: `https://admin.gemfolio.com/api/auth/callback/google`
5. Guardar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`

### GitHub OAuth
1. Ir a GitHub > Settings > Developer settings > OAuth Apps
2. Crear nueva aplicación
3. Authorization callback URL: `https://admin.gemfolio.com/api/auth/callback/github`
4. Guardar `GITHUB_CLIENT_ID` y `GITHUB_CLIENT_SECRET`

## Paso 5: Desplegar en Vercel

### Web App (Astro)

1. Importar repositorio en Vercel
2. Root Directory: `apps/web`
3. Framework Preset: Astro
4. Variables de entorno:
   ```
   DATABASE_URL=<neon-connection-string>
   NEXT_PUBLIC_API_URL=https://admin.gemfolio.com/api
   NEXT_PUBLIC_WEB_URL=https://gemfolio.com
   ```

### Admin App (TanStack Start)

1. Importar repositorio en Vercel (nuevo proyecto)
2. Root Directory: `apps/admin`
3. Framework Preset: Other
4. Build Command: `pnpm build`
5. Output Directory: `.output`
6. Variables de entorno:
   ```
   DATABASE_URL=<neon-connection-string>
   BETTER_AUTH_SECRET=<random-32-char-string>
   BETTER_AUTH_URL=https://admin.gemfolio.com
   GOOGLE_CLIENT_ID=<google-client-id>
   GOOGLE_CLIENT_SECRET=<google-client-secret>
   GITHUB_CLIENT_ID=<github-client-id>
   GITHUB_CLIENT_SECRET=<github-client-secret>
   R2_ACCOUNT_ID=<cloudflare-account-id>
   R2_ACCESS_KEY_ID=<r2-access-key>
   R2_SECRET_ACCESS_KEY=<r2-secret-key>
   R2_BUCKET_NAME=gemfolio
   R2_PUBLIC_URL=https://storage.gemfolio.com
   RESEND_API_KEY=<resend-api-key>
   EMAIL_FROM=Gemfolio <noreply@gemfolio.com>
   NEXT_PUBLIC_ADMIN_URL=https://admin.gemfolio.com
   NEXT_PUBLIC_WEB_URL=https://gemfolio.com
   NITRO_PRESET=vercel
   ```

## Paso 6: Configurar Dominios

1. En Vercel, ir a cada proyecto > Settings > Domains
2. Agregar dominios personalizados:
   - Web: `gemfolio.com`, `www.gemfolio.com`
   - Admin: `admin.gemfolio.com`
3. Configurar DNS según instrucciones de Vercel

## Paso 7: Migrar Base de Datos

Desde tu máquina local con acceso a la DB de producción:

```bash
# Configurar DATABASE_URL de producción
export DATABASE_URL="postgresql://..."

# Ejecutar migraciones
pnpm db:push

# (Opcional) Seed inicial
pnpm db:seed
```

## Checklist de Producción

- [ ] Variables de entorno configuradas en ambos proyectos
- [ ] Base de datos migrada
- [ ] Dominios configurados y SSL activo
- [ ] OAuth callbacks apuntando a URLs de producción
- [ ] Storage R2 configurado y accesible
- [ ] Email funcionando (verificar enviando test)
- [ ] PWA manifest y service worker funcionando
- [ ] Analytics configurado (opcional)
- [ ] Error tracking configurado (opcional)

## Monitoreo

### Logs
- Vercel Dashboard > Project > Logs

### Base de Datos
- Neon Dashboard > Project > Monitoring

### Uptime
- Considerar usar [Uptime Robot](https://uptimerobot.com) o similar

## Troubleshooting

### Error: Cannot find module
Verificar que el `Root Directory` está correctamente configurado.

### Error: Database connection failed
1. Verificar que `DATABASE_URL` incluye `?sslmode=require`
2. Verificar IP allowlist en Neon (permitir todas: `0.0.0.0/0`)

### Error: OAuth redirect mismatch
Verificar que las URLs de callback coinciden exactamente con las configuradas en Google/GitHub.

### Error: R2 upload failed
Verificar permisos del API token y que el bucket existe.
