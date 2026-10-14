import { describe, expect, it } from 'vitest';
import { findRefs, sectionsOf, readPages } from './pageLinks.mjs';

const pages = {
  ko: new Map([['7-2', new Set(['6', '2-1'])], ['9-1', new Set(['5'])]]),
  en: new Map([['7-2', new Set(['6', '2-1'])], ['9-1', new Set(['5'])]]),
};
const opts = (lang: 'ko' | 'en') => ({ lang, self: '9-1', pages, base: '/B' });
const hrefs = (text: string, lang: 'ko' | 'en' = 'ko') => findRefs(text, opts(lang)).map((r: { start: number; end: number; href: string }) => [text.slice(r.start, r.end), r.href]);

describe('pageLinks: 본문 참조 표기 → 링크', () => {
  it('제목 번호로 절 앵커를 만든다', () => {
    expect([...sectionsOf('## 1. 시작\n### 1.2 둘\n## 참고자료\n#### 3.1 무시')]).toEqual(['1', '1-2']);
  });

  it('한국어: 페이지·절·같은 페이지 절·Part', () => {
    expect(hrefs('P7-2 6절의 기계와 P7-2의 2.1절, (5절), Part 7')).toEqual([
      ['P7-2 6절', '/B/p7-2/#s6'],
      ['P7-2의 2.1절', '/B/p7-2/#s2-1'],
      ['5절', '#s5'],
      ['Part 7', '/B/parts/7/'],
    ]);
  });

  it('없는 절은 페이지로만, 없는 페이지·자기 페이지 번호·없는 같은 페이지 절은 잇지 않는다', () => {
    expect(hrefs('P7-2 9절, P3-9, P9-1, 7절')).toEqual([['P7-2 9절', '/B/p7-2/']]);
  });

  it('영어: § 표기와 /en/ 주소', () => {
    expect(hrefs('the machine of P7-2 §6 and §5 in Part 9', 'en')).toEqual([
      ['P7-2 §6', '/B/en/p7-2/#s6'],
      ['§5', '#s5'],
      ['Part 9', '/B/en/parts/9/'],
    ]);
  });

  it('실제 페이지: 한·영 모든 절 페이지가 있고 절 번호를 읽는다', () => {
    const real = readPages('src/pages');
    expect(real.ko.size).toBe(61);
    expect([...real.en.keys()].sort()).toEqual([...real.ko.keys()].sort());
    expect(real.ko.get('7-2')?.has('6')).toBe(true);
  });
});
