import preset from '@gemfolio/config/tailwind';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [preset],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
};

export default config;
