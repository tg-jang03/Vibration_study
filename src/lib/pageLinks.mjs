// 절 페이지 본문의 참조 표기에 링크를 거는 rehype 플러그인 (빌드 때, MDX 원문은 그대로).
//   한국어: "P7-2", "P7-2 6절", "P7-2의 6절", "P7-2 2.1절", 같은 페이지 "6절", "Part 7"
//   영어:   "P7-2", "P7-2 §6", "§6", "Part 7"
// 절 번호 앵커: 제목 "## 6. …" → #s6, "### 2.1 …" → #s2-1 (제목 안 맨 앞에 빈 span). 없는 절이면 페이지로만 잇는다.
// 한 문단·목록 항목·표 칸 안에서 같은 대상은 처음 한 번만 잇고, 링크·제목·수식·코드·컴포넌트(Callout 말고) 안은 건드리지 않는다.
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const BLOCKS = new Set(['p', 'li', 'td', 'th', 'dd', 'dt', 'blockquote', 'summary']);
const SKIP = new Set(['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'script', 'style', 'svg', 'button', 'math']);

/** 'p7-2.mdx' 원문에서 절 번호 목록 ('6', '2-1') */
export function sectionsOf(source) {
  const out = new Set();
  for (const line of source.split(/\r?\n/)) {
    let m = /^## (\d+)\.\s/.exec(line);
    if (m) out.add(m[1]);
    m = /^### (\d+)\.(\d+)\s/.exec(line);
    if (m) out.add(`${m[1]}-${m[2]}`);
  }
  return out;
}

/** 페이지 폴더를 읽어 { ko: Map('7-2' → 절 번호), en: Map } */
export function readPages(pagesDir) {
  const read = (dir) => {
    const map = new Map();
    for (const name of readdirSync(dir)) {
      const m = /^p(\d+-\d+)\.mdx$/.exec(name);
      if (m) map.set(m[1], sectionsOf(readFileSync(path.join(dir, name), 'utf8')));
    }
    return map;
  };
  return { ko: read(pagesDir), en: read(path.join(pagesDir, 'en')) };
}

const KO_RE = /P(\d{1,2}-\d{1,2})(?:(?:의)? ?(\d+(?:\.\d+)?)절)?|(?<![\d.\-])(\d+(?:\.\d+)?)절|Part ?(\d{1,2})(?![\d-])/g;
const EN_RE = /P(\d{1,2}-\d{1,2})(?: ?§ ?(\d+(?:\.\d+)?))?|§ ?(\d+(?:\.\d+)?)|Part (\d{1,2})(?![\d-])/g;

/**
 * 한 줄 글에서 링크할 조각을 찾는다 (순수 함수, 테스트용).
 * 돌려주는 것: [{ start, end, href, key }] — key는 "같은 대상" 판정용
 */
export function findRefs(text, { lang, self, pages, base, parts = 11 }) {
  const re = lang === 'en' ? EN_RE : KO_RE;
  const prefix = `${base}${lang === 'en' ? '/en' : ''}`;
  const out = [];
  for (const m of text.matchAll(re)) {
    const [whole, page, sec, ownSec, part] = m;
    let href;
    if (page) {
      const secs = (lang === 'en' ? pages.en : pages.ko).get(page);
      if (!secs) continue;
      const anchor = sec && secs.has(sec.replace('.', '-')) ? `#s${sec.replace('.', '-')}` : '';
      if (page === self) {
        if (!anchor) continue; // 자기 페이지 번호만 있으면 잇지 않는다
        href = anchor;
      } else href = `${prefix}/p${page}/${anchor}`;
    } else if (ownSec) {
      const secs = (lang === 'en' ? pages.en : pages.ko).get(self);
      const id = ownSec.replace('.', '-');
      if (!secs?.has(id)) continue;
      href = `#s${id}`;
    } else if (part) {
      const n = Number(part);
      if (n < 1 || n > parts) continue;
      href = `${prefix}/parts/${n}/`;
    }
    if (href) out.push({ start: m.index, end: m.index + whole.length, href, key: href });
  }
  return out;
}

const textOf = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join(''));

export default function rehypePageLinks({ base, pagesDir }) {
  const pages = readPages(pagesDir);
  return (tree, file) => {
    const fp = String(file.path ?? file.history?.[0] ?? '').replace(/\\/g, '/');
    const m = /\/pages\/(en\/)?p(\d+-\d+)\.mdx$/.exec(fp);
    if (!m) return;
    const lang = m[1] ? 'en' : 'ko';
    const self = m[2];

    const walk = (node, seen, skip) => {
      if (!node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type === 'element') {
          if (child.tagName === 'h2' || child.tagName === 'h3') {
            const head = textOf(child).trim();
            const sm = child.tagName === 'h2' ? /^(\d+)\.\s/.exec(head) : /^(\d+)\.(\d+)\s/.exec(head);
            if (sm) child.children.unshift({ type: 'element', tagName: 'span', properties: { id: `s${sm[1]}${sm[2] ? `-${sm[2]}` : ''}`, className: ['sec-anchor'] }, children: [] });
          }
          const cls = [].concat(child.properties?.className ?? []);
          const off = skip || SKIP.has(child.tagName) || cls.some((c) => String(c).startsWith('katex'));
          walk(child, BLOCKS.has(child.tagName) ? new Set() : seen, off);
        } else if (child.type === 'mdxJsxFlowElement' || child.type === 'mdxJsxTextElement') {
          const name = child.name ?? '';
          const off = skip || name === 'a' || (/^[A-Z]/.test(name) && name !== 'Callout');
          walk(child, BLOCKS.has(name) ? new Set() : seen, off);
        } else if (child.type === 'text' && !skip) {
          const refs = findRefs(child.value, { lang, self, pages, base }).filter((r) => !seen.has(r.key) && (seen.add(r.key), true));
          if (!refs.length) continue;
          const parts = [];
          let at = 0;
          for (const r of refs) {
            if (r.start > at) parts.push({ type: 'text', value: child.value.slice(at, r.start) });
            parts.push({ type: 'element', tagName: 'a', properties: { href: r.href, className: ['xref'] }, children: [{ type: 'text', value: child.value.slice(r.start, r.end) }] });
            at = r.end;
          }
          if (at < child.value.length) parts.push({ type: 'text', value: child.value.slice(at) });
          node.children.splice(i, 1, ...parts);
          i += parts.length - 1;
        }
      }
    };
    walk(tree, new Set(), false);
  };
}
