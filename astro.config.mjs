// @ts-check
import process from 'node:process';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypePageLinks from './src/lib/pageLinks.mjs';

// GitHub Pages: https://tg-jang03.github.io/Vibration_study/ (D-018)
export default defineConfig({
  site: 'https://tg-jang03.github.io',
  base: '/Vibration_study',
  // sitemap: 검색엔진에 직접 제출한다 (루트 robots.txt를 둘 수 없음, D-054). 개발용 /dev/는 뺀다.
  // i18n: 한국어(접두어 없음)와 /en/이 둘 다 있는 주소끼리 xhtml:link로 잇는다
  integrations: [react(), mdx(), sitemap({
      filter: (page) => !page.includes('/dev/'),
      i18n: { defaultLocale: 'ko', locales: { ko: 'ko', en: 'en' } },
    })],
  vite: {
    // 개발 서버와 build/check가 같은 의존성 캐시를 덮어쓰지 않게 폴더를 나눈다 (I-017)
    cacheDir: process.argv.includes('dev') ? 'node_modules/.vite' : 'node_modules/.vite-tasks',
    optimizeDeps: {
      // 동적 import(plotly)와 katex를 개발 서버 시작 때 미리 번들한다.
      // 실행 중에 새로 발견되면 재최적화가 일어나 랩 hydration이 504로 실패한다 (I-017).
      include: ['katex', 'plotly.js-cartesian-dist-min'],
    },
  },
  markdown: {
    // 본문 수식 $...$, $$...$$ → KaTeX (D-008). MDX도 이 처리기를 그대로 쓴다.
    processor: unified({
      remarkPlugins: [remarkMath],
      // 본문의 'P7-2 6절'·'6절'·'Part 7' 표기 → 사이트 안 링크 (src/lib/pageLinks.mjs)
      rehypePlugins: [rehypeKatex, [rehypePageLinks, { base: '/Vibration_study', pagesDir: 'src/pages' }]],
    }),
  },
});
