import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseGlossary, sortGlossary, splitSectionIds } from '../lib/glossary';
import { citedIds, REF_BY_ID, REFERENCES, refLink } from './references';

const PAGES = join(process.cwd(), 'src', 'pages');
const pages = readdirSync(PAGES)
  .filter((f) => /^p\d+-\d+\.mdx$/.test(f))
  .map((f) => ({ f, text: readFileSync(join(PAGES, f), 'utf8') }));

describe('참고 문헌 단일 기준 (D-046)', () => {
  it('ID는 R-두 자리, 겹치지 않고, 머리 주석의 다음 번호와 맞는다', () => {
    const ids = REFERENCES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^R-\d{2}$/);
    const next = Math.max(...ids.map((i) => Number(i.slice(2)))) + 1;
    expect(readFileSync(join(process.cwd(), 'src', 'data', 'references.ts'), 'utf8')).toContain(`다음 번호: R-${next}`);
  });

  it('주소는 https, 없으면 검색 링크로 대신한다', () => {
    for (const r of REFERENCES) {
      if (r.url) expect(r.url).toMatch(/^https:\/\//);
      expect(refLink(r).href).toMatch(/^https:\/\//);
      expect(r.about.length).toBeGreaterThan(4);
    }
  });

  it('모든 절 페이지 끝에 "## 참고자료" + <References>가 하나씩 있고, 인용한 ID는 모두 목록에 있다', () => {
    expect(pages.length).toBeGreaterThan(40);
    for (const { f, text } of pages) {
      expect(text.match(/^## 참고자료$/gm)?.length, f).toBe(1);
      expect(text, f).toContain("import References from '../components/content/References.astro';");
      const ids = citedIds(text);
      expect(ids.length, f).toBeGreaterThan(0);
      for (const id of ids) expect(REF_BY_ID[id], `${f}: ${id}`).toBeDefined();
    }
  });

  it('본문의 참고 번호는 <Cite>로만 쓰고, 그 번호는 같은 페이지 참고자료에 있다', () => {
    for (const { f, text } of pages) {
      const at = text.indexOf('<References');
      const end = text.indexOf(']}', at);
      const body = text.slice(0, at) + text.slice(end);
      const cites = [...body.matchAll(/<Cite ids=\{\[([^\]]*)\]\} \/>/g)];
      const bare = cites.reduce((s, m) => s.replace(m[0], ''), body);
      expect(bare.match(/\bR-\d{2}\b/g), f).toBeNull();
      const listed = new Set(citedIds(text));
      for (const m of cites) for (const id of m[1].match(/R-\d{2}/g) ?? []) expect(listed.has(id), `${f}: 본문 ${id}`).toBe(true);
      if (cites.length) expect(text, f).toContain("import Cite from '../components/content/Cite.astro';");
    }
  });

  it('목록의 자료는 모두 어느 페이지인가에서 인용된다 (데이터셋은 예외)', () => {
    const used = new Set(pages.flatMap(({ text }) => citedIds(text)));
    const unused = REFERENCES.filter((r) => !used.has(r.id) && r.kind !== 'dataset').map((r) => r.id);
    expect(unused).toEqual([]);
  });
});

describe('용어집 읽기 (docs/Glossary.md → /reference/glossary/)', () => {
  const entries = parseGlossary(readFileSync(join(process.cwd(), 'docs', 'Glossary.md'), 'utf8'));

  it('표의 모든 행을 읽고, 대부분은 처음 나오는 절 ID가 있다', () => {
    expect(entries.length).toBeGreaterThan(400);
    for (const e of entries) {
      expect(e.term.length).toBeGreaterThan(0);
      expect(e.meaning.length).toBeGreaterThan(0);
      expect(e.first).not.toMatch(/\((I|D)-\d{3}/);
    }
    expect(entries.filter((e) => e.part > 0).length / entries.length).toBeGreaterThan(0.95);
  });

  it('Part → 절 순으로 정렬하고, 처음 나오는 곳의 절 ID를 링크 조각으로 나눈다', () => {
    const s = sortGlossary(entries);
    for (let i = 1; i < s.length; i++) if (s[i].part && s[i - 1].part) expect(s[i].part * 100 + s[i].section).toBeGreaterThanOrEqual(s[i - 1].part * 100 + s[i - 1].section);
    expect(splitSectionIds('P2-4 §2.2 → P7-1 §4.3 (식)')).toEqual([{ text: 'P2-4', id: 'P2-4' }, { text: ' §2.2 → ' }, { text: 'P7-1', id: 'P7-1' }, { text: ' §4.3 (식)' }]);
  });
});
