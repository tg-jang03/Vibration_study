# 영어판 번역 지시문 (하위 에이전트용, M12.3 ~)

> 하위 에이전트에게 페이지·랩 번역을 맡길 때 붙이는 공통 지시. 사람이 읽는 작성법은 `docs/PageGuide.md` §13. (D-054)

Working directory: `C:\Users\AX\Desktop\ATG\업무\진동공부` (Astro site, Korean original; English lives under `/en/`). Other agents edit other files in the same tree at the same time.

## Never
- Do NOT commit, push, or run `npm run build`, `npm run check`, `astro …`, `npm run verify:*`.
- Do NOT edit shared files: `src/i18n/labsReady.ts`, `src/pages/en/lab/[slug].astro`, `src/i18n/en/references.ts`, `src/i18n/ui.ts`, `src/i18n/en/curriculum.ts`, `src/i18n/en/labs.ts`, anything in `src/components/ui/`, `src/components/content/`, `src/layouts/`, `src/lib/`, `src/figures/`, `docs/`, or any Korean page `src/pages/p*.mdx`. If something there needs to change, say so in your report.
- Do NOT change the Korean output of any component (text, spacing, punctuation), logic, numbers or styles.

## References to read first
- Page: `src/pages/p2-3.mdx` (Korean) vs `src/pages/en/p2-3.mdx` (English) — copy this structure and tone.
- Figure dictionary: `src/i18n/en/figures/p2-3.ts`.
- Lab conversion: `src/components/labs/SamplingLab.tsx`, `src/components/labs/StrobeDisk.tsx`, dictionaries `src/i18n/en/labs/SamplingLab.ts`, `StrobeDisk.ts`; helpers `src/i18n/lab.ts`, `src/components/ui/lang.tsx`.
- Terms: `docs/Glossary.md` (Korean term with English in parentheses).

## English page `src/pages/en/pX-Y.mdx`
- Frontmatter: `layout: ../../layouts/MdxLayout.astro`, English `title` (keep the leading `PX-Y `), English `description`, same `sectionId`, `source: pX-Y.mdx`, `sourceHash: 0000000000` (placeholder) — then run `npm run i18n:status -- --stamp pX-Y` to write the real hash.
- Imports use `../../`. Same components, same order, same figures (`<Figure {...F.name} />` unchanged). Labs get `lang="en"` and keep their client directive and other props.
- Translate everything: headings, prose, lists, tables, Callout titles (types unchanged), `<details>` questions/answers, Korean inside KaTeX `\text{}`. Math, numbers, symbols and units stay exactly as they are. "그림 N" → "Figure N". Section references like "(P2-1 §6)" stay.
- Internal links: targets that have (or are getting) English pages — the list is in your assignment — use `withBase('/en/pX-Y/')` (labs: `withBase('/en/lab/<slug>/')` only if your assignment says that lab gets English); all other targets keep the Korean URL unchanged. Drop `#anchor`s on links that now point to English pages (Korean heading slugs do not exist there); keep anchors on links to Korean pages.
- Save each file as soon as it is done (sessions can be cut off by usage limits); if a file already exists when you start, continue from it.
- `<References items={[['R-xx', 'English note'], …]} />` — translate the note; `<Cite ids={…} />` unchanged.
- Tone: the Korean is conversational and question-driven; keep that in clear, natural technical English for vibration engineers and students (see the P2-3 pair). No embellishment, no added claims.

## Figure dictionary `src/i18n/en/figures/pX-Y.ts`
- Keys are the exact Korean strings in the figure data (captions, titles, labels, legends, annotation text). After the English MDX exists, run `npx vitest run src/i18n/figures.test.ts` — it prints every missing Korean string for your page; copy them as keys and translate.
- Labels inside figures must stay short — English is wider than Korean in these SVGs. Aim for roughly the visual length of the Korean (about 1.6 Latin characters per Hangul character at most). Captions can be full sentences.

## Lab conversion (when assigned)
1. Main component: `export default function XLab({ lang = 'ko', …existing props }: { lang?: Lang; … })`, `const tr = makeT(lang, EN);`, pass `lang={lang}` to `<LabFrame>`. Imports: `import type { Lang } from '../../i18n'; import { k, makeT } from '../../i18n/lab'; import EN from '../../i18n/en/labs/XLab';`.
2. Local sub-components (`from './Name'`) rendered inside LabFrame: `const lang = useLang();` (from `'../ui/lang'`) and their own `tr` + dictionary `src/i18n/en/labs/Name.ts`. If a sub-component is shared with labs not assigned to you, still convert it (it is backward compatible) and mention it.
3. The translator is always named `tr` (`t` is time). Wrap every user-visible Korean string: JSX text, attributes (label, title, ariaLabel, aria-label, placeholder), plot series names, axis labels, readout labels, options, tasks, status text, SVG `<text>`. Template literals → `` tr`…${x}…` ``. KaTeX: wrap only the Korean phrase, `` \\text{${tr`…`}} ``. Module-level Korean → `k('…')`, translated at render with `tr(x)`. Mixed JSX text with elements → split into several `tr` pieces so Korean output is identical and English reads naturally.
4. `turnSpeeds(fr, turns, lang)` and `rateLabel(rate, lang)` accept `lang` — pass it.
5. Dictionary `src/i18n/en/labs/<File>.ts`: `import type { Dict } from '../../translate'; const EN: Dict = { '<exact Korean key>': '<English>', … }; export default EN;` — skeleton from `node scripts/i18n/scan-lab.mjs <Lab>`.
6. Verify: `node scripts/i18n/scan-lab.mjs <Lab> --check` must print ✓ for every file (0 unwrapped, 0 missing, 0 unused, 0 Hangul values). Re-read the edited TSX once for balanced braces/backticks.

## Report (short)
Files created/changed; number of keys; Korean you found that comes from files you may not edit (e.g. reference titles, shared UI); phrases whose meaning you were unsure of.
