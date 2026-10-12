/**
 * 영어판이 있는 페이지 목록 (D-054). 번역이 끝난 것만 /en/에 있으므로, 링크·hreflang·언어 전환은 여기에 물어본다.
 * - 절 페이지: src/pages/en/p{Part}-{절}.mdx가 있으면 영어판이 있다 (파일 목록을 빌드 때 읽음)
 * - 랩 단독 페이지: EN_LAB_COMPONENTS에 든 랩 (화면 문자열을 t로 감싸고 영어 사전을 갖춘 랩)
 * - 홈·Part 목차·랩 모음: 늘 있다. 레퍼런스: 아직 없다 (한국어로 간다)
 */
import type { Section } from '../data/curriculum';
import { LABS } from '../data/labs';
import { localizePath, stripLang, type Lang } from './index';
import { EN_LAB_COMPONENTS } from './labsReady';

const EN_PAGES = import.meta.glob('../pages/en/p*.mdx');

/** 파일 경로 → 절 ID: '../pages/en/p2-3.mdx' → 'P2-3' */
export function sectionIdOfFile(file: string): string | undefined {
  const m = file.match(/\/p(\d+)-(\d+)\.mdx$/);
  return m ? `P${m[1]}-${m[2]}` : undefined;
}

export const EN_SECTION_IDS: ReadonlySet<string> = new Set(
  Object.keys(EN_PAGES)
    .map(sectionIdOfFile)
    .filter((id): id is string => !!id),
);

export { EN_LAB_COMPONENTS };

export const hasEnglishSection = (id: string): boolean => EN_SECTION_IDS.has(id);
export const hasEnglishLab = (component: string): boolean => EN_LAB_COMPONENTS.has(component);

/** 기본 경로(언어 접두어 없이)의 영어판이 있나 */
export function hasEnglish(path: string): boolean {
  const p = stripLang(path);
  if (p === '/' || p === '/lab/' || /^\/parts\/\d+\/$/.test(p)) return true;
  const lab = p.match(/^\/lab\/([^/]+)\/$/);
  if (lab) {
    const entry = LABS.find((l) => l.slug === lab[1]);
    return !!entry && hasEnglishLab(entry.component);
  }
  const sec = p.match(/^\/p(\d+)-(\d+)\/$/);
  if (sec) return hasEnglishSection(`P${sec[1]}-${sec[2]}`);
  return false;
}

/** 그 언어로 갈 수 있는 경로: 영어판이 없으면 한국어 경로 (번역 전 링크는 한국어 페이지로) */
export function availablePath(path: string, lang: Lang): string {
  return lang === 'en' && hasEnglish(path) ? localizePath(path, 'en') : stripLang(path);
}

/** 절 링크 (베이스 없이). 영어판이 없으면 한국어 페이지 */
export function sectionPath(section: Pick<Section, 'id' | 'href'>, lang: Lang): string | undefined {
  if (!section.href) return undefined;
  return lang === 'en' && hasEnglishSection(section.id) ? localizePath(section.href, 'en') : section.href;
}
