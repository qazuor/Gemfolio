import preset from '@gemfolio/config/tailwind';
import type { Config } from 'tailwindcss';

const config: Config = {
  presets: [preset],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
};

export default config;
