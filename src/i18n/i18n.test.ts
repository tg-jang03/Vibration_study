import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PARTS, STAGES } from '../data/curriculum';
import { LABS } from '../data/labs';
import { localizePath, langOfPath, sitePath, stripLang } from './index';
import { fillTemplate, makeT, templateKey } from './lab';
import { EN_LAB_COMPONENTS } from './labsReady';
import { compileDict, hasHangul, translateDeep, translateText, type Dict } from './translate';
import { PARTS_EN, SECTIONS_EN, STAGES_EN } from './en/curriculum';
import { LABS_EN } from './en/labs';
import { UI } from './ui';
import { labFiles, scanLabSource } from '../../scripts/i18n/scan-lab.mjs';

const root = join(__dirname, '..');

describe('경로 (D-054)', () => {
  it('한국어는 접두어 없음, 영어는 /en/', () => {
    expect(localizePath('/p2-3/', 'en')).toBe('/en/p2-3/');
    expect(localizePath('/en/p2-3/', 'ko')).toBe('/p2-3/');
    expect(localizePath('/', 'en')).toBe('/en/');
    expect(stripLang('/en')).toBe('/');
    expect(langOfPath('/en/lab/')).toBe('en');
    expect(langOfPath('/entry/')).toBe('ko');
    expect(sitePath('/Vibration_study/en/p2-3/', '/Vibration_study')).toBe('/en/p2-3/');
    expect(sitePath('/Vibration_study', '/Vibration_study/')).toBe('/');
  });
});

describe('사전 번역', () => {
  const dict = compileDict({ '실제 신호 940 Hz': 'True signal 940 Hz', '{0} Hz로 보임': 'appears as {0} Hz', '{0}과 {1}': '{1} and {0}' });
  it('정확한 문장과 {n} 틀', () => {
    expect(translateText('실제 신호 940 Hz', dict)).toBe('True signal 940 Hz');
    expect(translateText('60 Hz로 보임', dict)).toBe('appears as 60 Hz');
    expect(translateText('A과 B', dict)).toBe('B and A');
    expect(translateText('없는 문장', dict)).toBeUndefined();
  });
  it('깊은 번역은 한글이 든 문자열만, 없는 것은 모은다', () => {
    const missing = new Set<string>();
    const out = translateDeep({ a: '실제 신호 940 Hz', b: [1, '60 Hz로 보임', 'x [s]'], c: '모름' }, dict, missing);
    expect(out).toEqual({ a: 'True signal 940 Hz', b: [1, 'appears as 60 Hz', 'x [s]'], c: '모름' });
    expect([...missing]).toEqual(['모름']);
  });
});

describe('랩 t', () => {
  it('템플릿 키와 채우기', () => {
    expect(templateKey(['', ' Hz로 보임'])).toBe('{0} Hz로 보임');
    expect(fillTemplate('appears as {0} Hz', [60])).toBe('appears as 60 Hz');
  });
  it('한국어는 원문, 영어는 사전 (없으면 원문)', () => {
    const en = { '샘플 점': 'Samples', '{0} Hz로 보임': 'appears as {0} Hz' };
    const f = 60;
    expect(makeT('ko', en)`${f} Hz로 보임`).toBe('60 Hz로 보임');
    expect(makeT('en', en)`${f} Hz로 보임`).toBe('appears as 60 Hz');
    expect(makeT('en', en)('샘플 점')).toBe('Samples');
    expect(makeT('en', en)`모르는 말`).toBe('모르는 말');
  });
});

describe('목차·랩 모음의 영어가 빠짐없다', () => {
  it('Part·절·단계', () => {
    for (const p of PARTS) {
      expect(PARTS_EN[p.num], `Part ${p.num}`).toBeDefined();
      for (const s of p.sections) expect(SECTIONS_EN[s.id], s.id).toBeTruthy();
    }
    for (const s of STAGES) expect(STAGES_EN[s.num], `stage ${s.num}`).toBeDefined();
    expect(Object.keys(SECTIONS_EN).length).toBe(PARTS.flatMap((p) => p.sections).length);
  });
  it('랩 제목·설명', () => {
    for (const l of LABS) expect(LABS_EN[l.slug], l.slug).toBeDefined();
    expect(Object.keys(LABS_EN).length).toBe(LABS.length);
  });
  it('영어 데이터에 한글이 없다 (언어 전환 이름 "한국어"만 예외)', () => {
    const texts = [
      ...Object.values(PARTS_EN).flatMap((p) => [p.title, p.question]),
      ...Object.values(SECTIONS_EN),
      ...Object.values(STAGES_EN).flatMap((s) => [s.title, s.summary]),
      ...Object.values(LABS_EN).flatMap((l) => [l.title, l.summary]),
    ];
    for (const s of texts) expect(hasHangul(s), s).toBe(false);
    const flat = (v: unknown): string[] =>
      typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(flat) : typeof v === 'function' ? [String((v as (...a: number[]) => unknown)(1, 2))] : v && typeof v === 'object' ? Object.values(v).flatMap(flat) : [];
    const { switchLabel, ...rest } = UI.en;
    expect(switchLabel).toBe('한국어');
    for (const s of flat(rest)) expect(hasHangul(s), s).toBe(false);
  });
});

// ── 영어 화면을 갖춘 랩: 소스에 tr/k로 감싸지 않은 한글이 없고, 키가 모두 사전에 있다 ──

const LAB_DICTS = import.meta.glob<{ default: Dict }>('./en/labs/*.ts', { eager: true });

describe('영어 랩 (EN_LAB_COMPONENTS)', () => {
  const enSlugPage = readFileSync(join(root, 'pages/en/lab/[slug].astro'), 'utf8');
  for (const component of EN_LAB_COMPONENTS) {
    it(`${component}: 영어 단독 페이지에 렌더 줄이 있다`, () => {
      expect(enSlugPage.includes(`c === '${component}'`)).toBe(true);
      expect(enSlugPage).toMatch(new RegExp(`<${component} client:\\w+ lang="en"`));
    });
    for (const name of labFiles(join(root, 'components/labs'), component) as string[]) {
      it(`${name}: 감싸지 않은 한글이 없고 사전이 빠짐없다`, () => {
        const { keys, rest } = scanLabSource(readFileSync(join(root, 'components/labs', `${name}.tsx`), 'utf8')) as { keys: string[]; rest: string };
        const left = rest.split('\n').filter((line) => hasHangul(line));
        expect(left, `${name}.tsx에 tr로 감싸지 않은 한글`).toEqual([]);
        if (keys.length === 0) return;
        const dict = LAB_DICTS[`./en/labs/${name}.ts`]?.default;
        expect(dict, `사전 파일 i18n/en/labs/${name}.ts`).toBeDefined();
        if (!dict) return;
        const missing = [...new Set(keys)].filter((k) => hasHangul(k) && !(k in dict));
        expect(missing, `${name}: 사전에 없는 키`).toEqual([]);
        const unused = Object.keys(dict).filter((k) => !keys.includes(k));
        expect(unused, `${name}: 쓰지 않는 사전 키`).toEqual([]);
        for (const [k, v] of Object.entries(dict)) expect(hasHangul(v), `${k} → ${v}`).toBe(false);
      });
    }
  }
});

describe('영어 절 페이지', () => {
  it('파일 이름과 sectionId가 맞고 원본 해시를 적었다', () => {
    const glob = import.meta.glob('../pages/en/p*.mdx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    for (const [file, text] of Object.entries(glob)) {
      const id = file.match(/p(\d+)-(\d+)\.mdx$/)!;
      expect(text, file).toMatch(new RegExp(`^sectionId: P${id[1]}-${id[2]}$`, 'm'));
      expect(text, file).toMatch(/^sourceHash: [0-9a-f]{10}$/m);
      expect(existsSync(join(root, 'pages', `p${id[1]}-${id[2]}.mdx`)), file).toBe(true);
    }
  });
});

describe('참고자료 서지의 한국어가 모두 사전에 있다', () => {
  it('저자·제목·출처·연도', async () => {
    const { REFERENCES } = await import('../data/references');
    const { REFERENCE_EN } = await import('./figures');
    const missing = new Set<string>();
    for (const r of REFERENCES) translateDeep({ a: r.authors, t: r.title, s: r.source, y: r.year }, REFERENCE_EN, missing);
    expect([...missing]).toEqual([]);
  });
});
