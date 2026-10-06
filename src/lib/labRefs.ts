/**
 * 랩이 쓰인 곳 찾기 (빌드 때만, D-037). 절 페이지 MDX 원문에서 랩 컴포넌트 태그를 찾고,
 * 바로 앞의 ##·### 제목을 Astro가 만든 제목 id(getHeadings)와 짝지어 "원문 설명" 링크를 만든다.
 * 페이지나 랩을 고쳐도 이 목록은 다시 손댈 필요가 없다.
 */
import { PARTS } from '../data/curriculum';
import { LABS, type LabEntry } from '../data/labs';

interface MdxModule {
  frontmatter: { title?: string; sectionId?: string };
  getHeadings: () => { depth: number; slug: string; text: string }[];
}

const raw = import.meta.glob<string>('../pages/p*.mdx', { query: '?raw', import: 'default', eager: true });
const mods = import.meta.glob<MdxModule>('../pages/p*.mdx', { eager: true });

export interface LabRef {
  sectionId: string;
  /** 절 제목 (목차의 제목) */
  pageTitle: string;
  /** 랩 바로 앞의 제목 (수식 기호는 지운 글자) */
  heading?: string;
  /** /p1-4/#… (withBase 전) */
  href: string;
}

const SECTIONS = PARTS.flatMap((p) => p.sections);
const clean = (t: string) => t.replace(/\$([^$]*)\$/g, '$1').replace(/<[^>]+>/g, '').replace(/\*\*/g, '').trim();

function scan(): Map<string, LabRef[]> {
  const out = new Map<string, LabRef[]>();
  for (const [path, text] of Object.entries(raw)) {
    const mod = mods[path];
    const sectionId = mod?.frontmatter.sectionId;
    if (!sectionId) continue;
    const section = SECTIONS.find((s) => s.id === sectionId);
    const base = section?.href ?? `/${path.replace(/^.*\/(p[\d-]+)\.mdx$/, '$1')}/`;
    const headings = mod.getHeadings();
    let hIndex = -1;
    let current: { text: string; slug?: string } | undefined;
    const rawHeadings = text.split('\n').filter((l) => /^#{1,6}\s/.test(l)).length;
    const aligned = rawHeadings === headings.length;
    for (const line of text.split('\n')) {
      const h = /^(#{1,6})\s+(.*)$/.exec(line);
      if (h) {
        hIndex++;
        if (h[1].length >= 2) current = { text: clean(h[2]), slug: aligned ? headings[hIndex]?.slug : undefined };
        continue;
      }
      const tag = /^<([A-Z][A-Za-z0-9]*)[\s/>]/.exec(line);
      if (!tag || !LABS.some((l) => l.component === tag[1])) continue;
      const list = out.get(tag[1]) ?? [];
      const href = current?.slug ? `${base}#${current.slug}` : base;
      if (!list.some((r) => r.href === href)) {
        list.push({ sectionId, pageTitle: section?.title ?? mod.frontmatter.title ?? sectionId, heading: current?.text, href });
      }
      out.set(tag[1], list);
    }
  }
  for (const list of out.values()) list.sort((a, b) => SECTIONS.findIndex((s) => s.id === a.sectionId) - SECTIONS.findIndex((s) => s.id === b.sectionId));
  return out;
}

const REFS = scan();

/** 이 랩이 쓰인 곳 (페이지 순서) */
export const labRefs = (lab: LabEntry): LabRef[] => REFS.get(lab.component) ?? [];

/** 이 절 페이지에 들어 있는 랩들 (목록 순서) */
export const labsInSection = (sectionId: string): LabEntry[] => LABS.filter((l) => labRefs(l).some((r) => r.sectionId === sectionId));
