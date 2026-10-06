import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LABS } from './labs';

const root = join(__dirname, '..');
const slugPage = readFileSync(join(root, 'pages/lab/[slug].astro'), 'utf8');
const pages = readdirSync(join(root, 'pages')).filter((f) => /^p\d+-\d+\.mdx$/.test(f));
const used = new Set(pages.flatMap((f) => [...readFileSync(join(root, 'pages', f), 'utf8').matchAll(/^<([A-Z][A-Za-z0-9]*Lab)[\s/>]/gm)].map((m) => m[1])));

describe('랩 모음 목록 (D-037)', () => {
  it('slug가 겹치지 않고, 컴포넌트 파일이 있다', () => {
    expect(new Set(LABS.map((l) => l.slug)).size).toBe(LABS.length);
    for (const l of LABS) expect(existsSync(join(root, 'components/labs', `${l.component}.tsx`)), l.component).toBe(true);
  });

  it('목록의 랩마다 /lab/[slug] 페이지에 렌더 줄이 있다', () => {
    for (const l of LABS) expect(slugPage.includes(`c === '${l.component}'`), l.component).toBe(true);
  });

  it('절 페이지에서 쓰는 랩은 모두 목록에 있다', () => {
    for (const c of used) expect(LABS.some((l) => l.component === c), c).toBe(true);
  });
});
