import { describe, expect, it } from 'vitest';
import { FIGURE_EN } from './figures';
import { hasHangul, translateDeep } from './translate';

/**
 * 영어 절 페이지가 쓰는 그림 모듈의 한국어(제목·라벨·캡션)가 모두 그림 사전(src/i18n/en/figures/*)에 있다 (D-054).
 * 실패하면 빠진 원문 목록이 나온다 — 그대로 사전 키로 옮겨 번역한다.
 */
const enPages = import.meta.glob('../pages/en/p*.mdx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const figureModules = import.meta.glob<Record<string, unknown>>('../figures/p*.ts', { eager: true });

const isFigure = (v: unknown): v is { id: string; caption: string; panels: unknown[] } =>
  !!v && typeof v === 'object' && 'panels' in v && 'caption' in v;

describe('영어 페이지의 그림 사전', () => {
  for (const [file, text] of Object.entries(enPages)) {
    const used = [...text.matchAll(/from '\.\.\/\.\.\/figures\/(p[\d-]+)'/g)].map((m) => m[1]);
    for (const mod of used) {
      it(`${file} → figures/${mod}: 한국어가 모두 사전에 있다`, () => {
        const exports = figureModules[`../figures/${mod}.ts`];
        expect(exports, mod).toBeDefined();
        const missing = new Set<string>();
        for (const v of Object.values(exports ?? {})) if (isFigure(v)) translateDeep({ caption: v.caption, panels: v.panels }, FIGURE_EN, missing);
        expect([...missing]).toEqual([]);
        expect([...missing].some(hasHangul)).toBe(false);
      });
    }
  }
});
