/**
 * 언어 (D-054): 한국어가 원본이고 지금 주소 그대로, 영어는 /en/ 아래 (번역이 끝난 페이지만).
 * 경로 함수는 BASE_URL을 뗀 사이트 안 경로('/p2-3/')를 다룬다. withBase는 마지막에 붙인다.
 */
import { withBase } from '../lib/site';

export type Lang = 'ko' | 'en';
export const LANGS: readonly Lang[] = ['ko', 'en'];
export const OG_LOCALE: Record<Lang, string> = { ko: 'ko_KR', en: 'en_US' };

/** 사이트 안 경로 → 언어 */
export function langOfPath(path: string): Lang {
  return /^\/en(\/|$)/.test(path) ? 'en' : 'ko';
}

/** 언어 접두어를 뗀 기본 경로: '/en/p2-3/' → '/p2-3/', '/en' → '/' */
export function stripLang(path: string): string {
  const m = path.match(/^\/en(\/.*)?$/);
  return m ? (m[1] ?? '/') : path;
}

/** 기본 경로를 그 언어의 경로로: ('/p2-3/', 'en') → '/en/p2-3/' */
export function localizePath(path: string, lang: Lang): string {
  const clean = stripLang(path.startsWith('/') ? path : `/${path}`);
  return lang === 'ko' ? clean : `/en${clean}`;
}

/** 브라우저 주소(베이스 포함)에서 베이스를 뗀다: '/Vibration_study/en/' → '/en/' */
export function sitePath(pathname: string, base: string = import.meta.env.BASE_URL): string {
  const b = base.replace(/\/+$/, '');
  if (!b || !pathname.startsWith(b)) return pathname || '/';
  return pathname.slice(b.length) || '/';
}

/** Astro 페이지·컴포넌트에서: 지금 페이지의 언어 */
export function langOfUrl(url: URL): Lang {
  return langOfPath(sitePath(url.pathname));
}

/** 그 언어의 사이트 안 링크 (베이스 포함) */
export function hrefFor(path: string, lang: Lang): string {
  return withBase(localizePath(path, lang));
}
