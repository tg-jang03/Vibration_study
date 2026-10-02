import { defineConfig } from 'vitest/config';

export default defineConfig({
  // 개발 서버 캐시(.vite)와 겹치지 않게 (I-017)
  cacheDir: 'node_modules/.vite-tasks',
  test: {
    include: ['src/**/*.test.ts'],
  },
});
