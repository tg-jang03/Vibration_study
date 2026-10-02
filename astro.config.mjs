// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// GitHub Pages: https://tg-jang03.github.io/Vibration_study/ (D-018)
export default defineConfig({
  site: 'https://tg-jang03.github.io',
  base: '/Vibration_study',
  integrations: [react(), mdx()],
  markdown: {
    // 본문 수식 $...$, $$...$$ → KaTeX (D-008). MDX도 이 처리기를 그대로 쓴다.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
