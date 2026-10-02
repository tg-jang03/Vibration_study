// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// GitHub Pages: https://taegyu10732.github.io/Vibration_study/ (D-018)
export default defineConfig({
  site: 'https://taegyu10732.github.io',
  base: '/Vibration_study',
  integrations: [react(), mdx()],
});