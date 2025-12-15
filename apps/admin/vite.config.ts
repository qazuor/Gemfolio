import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';
import viteTsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  // Load env file based on mode, from parent directories as well
  const env = loadEnv(mode, process.cwd(), '');

  return {
    server: {
      port: 3001,
    },
    preview: {
      port: 3001,
    },
    plugins: [
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      tailwindcss(),
      tanstackStart({
        srcDirectory: 'src',
      }),
      nitro({
        preset: 'vercel',
      }),
      viteReact(),
    ],
    optimizeDeps: {
      exclude: ['@tanstack/start-server-core', '@tanstack/react-start-server'],
    },
    ssr: {
      noExternal: ['zod'],
    },
    // Make server-side env vars available
    define: {
      'process.env.UPLOADTHING_TOKEN': JSON.stringify(env.UPLOADTHING_TOKEN),
    },
  };
});
