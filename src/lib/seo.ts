/**
 * 검색 노출용 머리 정보 (M12.1, D-054). 순수 함수 — 제목 다듬기, canonical 주소, JSON-LD 조각.
 * 레이아웃(BaseLayout·MdxLayout)과 랩 단독 페이지가 쓴다.
 */

export interface Crumb {
  name: string;
  url: string;
}

/** 절 제목 앞의 ID("P2-3 ")를 뒤로 보낸다 — 검색 결과에서 주제어가 먼저 보이게. ID가 없는 제목에도 뒤에 붙인다 */
export function sectionTitle(title: string, sectionId?: string): string {
  const clean = title.trim();
  if (!sectionId) return clean;
  const body = clean.startsWith(`${sectionId} `) ? clean.slice(sectionId.length + 1).trim() : clean;
  return `${body} (${sectionId})`;
}

/** 탭·검색 결과의 제목: "제목 | 사이트". 제목이 없으면(홈) "사이트 | 한 줄 소개" */
export function documentTitle(siteName: string, tagline: string, title?: string): string {
  return title ? `${title} | ${siteName}` : `${siteName} | ${tagline}`;
}

/** canonical 주소. 디렉터리형 페이지는 끝을 /로 맞춘다 (GitHub Pages가 /p2-3 → /p2-3/로 옮기므로) */
export function canonicalUrl(pathname: string, site: string | URL): string {
  const last = pathname.split('/').pop() ?? '';
  const path = pathname.endsWith('/') || last.includes('.') ? pathname : `${pathname}/`;
  return new URL(path, site).href;
}

/** 경로 표시(BreadcrumbList) — 검색 결과에 "사이트 › Part 2 › 절"처럼 보인다 */
export function breadcrumbLd(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
  };
}

export function websiteLd(o: { name: string; alternateName: string; url: string; description: string; lang: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: o.name,
    alternateName: o.alternateName,
    url: o.url,
    description: o.description,
    inLanguage: o.lang,
  };
}

/** 절 페이지·랩 하나 = 학습 자료 하나. 사이트(WebSite)의 일부로 묶는다 */
export function learningResourceLd(o: {
  name: string;
  description?: string;
  url: string;
  lang: string;
  /** 'lesson'(절 페이지) · 'interactive simulation'(랩) */
  kind: string;
  site: { name: string; url: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: o.name,
    ...(o.description ? { description: o.description } : {}),
    url: o.url,
    inLanguage: o.lang,
    learningResourceType: o.kind,
    isAccessibleForFree: true,
    isPartOf: { '@type': 'WebSite', name: o.site.name, url: o.site.url },
  };
}

/** JSON-LD를 <script> 안에 안전하게 넣는다 — 글에 "</script>"가 있어도 닫히지 않게 <를 이스케이프 */
export function jsonLdText(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
