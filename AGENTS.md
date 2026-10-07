# AGENTS.md — 공통 작업 규칙 & 문서 지도

> Claude Code와 Codex가 함께 따르는 **단일 규칙 파일** (Codex는 자동으로, Claude는 `CLAUDE.md`의 `@AGENTS.md`로 읽는다, D-002).
> 매 세션 자동으로 읽히므로 짧게 유지한다 (D-038). 규칙을 바꿀 때는 `docs/Decisions.md`에 결정을 먼저 남긴다.

## 1. 프로젝트

기초 진동 역학(MCK·모드)에서 대형 회전기계(GT/ST) 진단까지 잇는 **개인 학습용 공개 웹사이트**. 커리큘럼 Part 1 ~ 11(`docs/Curriculum.md`)을 페이지로 만들고, 신호처리는 가상 신호를 직접 조작하는 **랩 + 수식**으로 만든다. 결정권자 = 사용자, 작업자 = Claude·Codex(·Antigravity), 공유 수단 = 이 저장소와 `docs/`.

## 2. 문서 지도 (등급: D-030)

**① 항상** 읽는다 · **② 필요한 절만** (`grep -n "^##" 파일`이나 ID·키워드로 찾아 그 절만) · **③ 보관** (근거를 찾을 때만).

| 문서 | 등급 | 내용 |
|---|---|---|
| `AGENTS.md` | ① | 이 파일 |
| `docs/Progress.md` | ① | 트랙 현황·핸드오프·최근 세션 로그 (**매 세션 끝 갱신**) |
| `docs/PageGuide.md` | ② | 페이지·랩 **작성 방법** (톤·뼈대·그림·상자·MDX 함정·체크리스트) |
| `docs/Contents.md` | ② | 개념 척추 §1-2, 기호·식 §3, 페이지 상태 §4, 랩 §5, 기준값 §6 |
| `docs/Curriculum.md` | ② | Part별 **무엇을 가르치나** — 자기 Part만 |
| `docs/Roadmap.md` | ② | 구조, 마일스톤 정의 §6 |
| `docs/Decisions.md` · `docs/Issues.md` | ② | 유효한 결정 `D-xxx`(요약표 먼저) · 열린 이슈 `I-xxx`. 다음 번호는 각 문서 머리 |
| `docs/Glossary.md` | ② | 용어·처음 나오는 페이지 (용어로 검색) |
| `docs/archive/*` | ③ | 지난 세션 로그, 닫힌 이슈, 대체된 결정, 끝난 마일스톤 표, 구현된 랩의 원래 사양(`LabSpecs.md`), 마일스톤 검토 기록(`Reviews.md`) |
| `docs/source/curriculum.md` | ③ | 사용자 원본 — **수정 금지** (D-004) |

## 3. 세션 절차

- **시작**: `git status`·`git log --oneline -5` → Progress의 트랙 현황·공통 핸드오프·**자기 트랙** 핸드오프 → 그 작업의 ② 문서 절만 (Roadmap §6 자기 행, 관련 D·I, Curriculum 그 Part, Contents 그 페이지·랩 행, 페이지를 쓰면 PageGuide).
- **끝**: Progress(트랙 현황·핸드오프, 자기 트랙 세션 로그를 맨 위에 1건) → 새 결정·이슈·콘텐츠 상태 반영 → 보관(D-030·D-038: 로그는 트랙마다 2개만, 닫힌 이슈·대체 결정·끝난 마일스톤 표는 `archive/`) → 검사 통과 후 커밋·push.

## 4. 트랙 & Git (D-017, D-019, D-029)

- 모든 작업은 `main`. 브랜치·PR 없음. 큰 마일스톤 `M{n}` → 세부 `M{n}.{m}` (Roadmap §6). 트랙마다 세부 하나만 "진행 중".

  | 트랙 | 범위 | 담당 | 작업 폴더 | 최신 받기 → push |
  |---|---|---|---|---|
  | A | M1 Part 2·M3 Part 3·M4 Part 5 (세부 완료, 확인 대기, D-034) → 다음은 사용자 확인 | Claude | `진동공부` (`main`) | `git pull --rebase` → `git push` |
  | B | M2 Part 1 (완료) → M5 Part 4 (완료, 검토 대기) → **M6 Part 6 (M6.1 → M6.6 → M6.2 → M6.3, D-041)** | Codex | `../진동공부-Codex` (worktree, detached) | `git fetch origin` → `git rebase origin/main` → `git push origin HEAD:main` |

- **파일 소유** (D-029·D-031·D-034·D-040·D-041): A = `p2-2 ~ p2-9`·`p3-*`·`p5-*`, 그 `figures/`, `lib/dsp` 등 Part 2·3·5 계산 모듈, 그 랩, `index.astro` / B = `p1-*`(P1-6 포함)·`p4-*`·`p6-*`·`p2-1`, 그 `figures/`, `lib/mck`·`lib/rotor`·`lib/machine`·Part 6 계산 모듈, 그 랩, `SineBasicsLab`. **공유**는 자기 줄만: `curriculum.ts`의 자기 Part, 갤러리의 자기 절, **랩 모음 `src/data/labs.ts`와 `pages/lab/[slug].astro`의 자기 랩 줄**(새 랩을 만들면 두 곳에 한 줄씩 — `labs.test.ts`가 빠진 줄을 잡는다), 문서의 자기 트랙 행·절. **공용 코어**(`lib/figure.ts`, `components/content`·`ui`, `layouts`, `global.css`, `lib/labRefs.ts`)는 하위 호환으로만 고치고 핸드오프에 적는다.
- 순서: 최신 받기 → 작업 → 커밋 → 다시 최신 받기 → 검사 → push (거절되면 자기 커밋만 rebase). rebase 충돌은 문서에서만 난다 → **양쪽 내용을 모두 살린다**, 다른 트랙의 행·절은 origin 쪽 그대로 (I-026). 새 D·I 번호는 push 직전 origin 확인, 겹치면 나중 쪽이 올린다.
- 다른 트랙의 작업 폴더에서는 설치·빌드·git 명령을 실행하지 않는다 (I-024). 사용자가 요청하면 세 번째 작업은 별도 worktree (D-021).
- 커밋: `[M{n}.{m}] {feat|fix|docs|test|refactor|chore}: {요약}`. 세부 하나에 커밋 하나가 기본. force push·이미 push한 커밋 재작성 금지 (되돌릴 때는 `git revert`).
- 세부 완료: 완료 기준 + `npm run check`·`npm test`·`npm run build` → 문서 갱신 → push → GitHub Actions 성공 확인. 큰 마일스톤의 마지막 세부 뒤에는 짧은 회고를 남기고 다음 세부 목록을 사용자와 확인한다.

## 5. 문서 작성 규칙

- 날짜는 `YYYY-MM-DD`. 짧게 (D-030·D-038): 세션 로그 1건 8줄 이내(자세한 내용은 커밋 메시지), 이슈 본문 15줄, `Progress.md` 120줄 이하. 끝난 기록은 지우지 말고 `archive/`로.
- ID: `M{n}`·`M{n}.{m}`·`D-{3자리}`·`I-{3자리}`·페이지 `P{Part}-{절}`·랩 `LAB-{주제}-{2자리}`·참고 `R-{2자리}`. 한 번 쓴 ID는 재사용하지 않는다.
- `Decisions.md`는 추가만. 바꾸면 새 결정 + 이전 것 `대체됨 → D-xxx` + 본문은 archive. 상태 `제안` → `확정`/`폐기`/`대체됨` (제안 위에 큰 작업을 쌓기 전엔 사용자 확인). 작성자 `Claude`/`Codex`/`Antigravity`/`사용자`.
- 문서·UI는 한국어, 전문용어는 처음에 영문 병기, 코드·식별자는 영어 (D-005).

## 6. 코드 규칙

- 명령: `npm run dev` · `check` · `build` · `test` · **`npm run verify:page -- /p3-5/ /lab/`**(미리보기 서버 필요: `npx astro preview`. hydration·콘솔 오류·모바일 넘침·1500px 구간 캡처를 `dist/qa`에, D-038) · **`npm run verify:links`**(빌드 후 모든 사이트 안 링크·앵커 점검).
- 내부 링크·정적 파일은 `withBase()` (`/Vibration_study/` 하위 배포). 목차 `src/data/curriculum.ts` = Curriculum 절 구성 = Contents §4 상태.
- `lib/`의 계산 모듈은 **순수 함수**(DOM·React·플롯 의존 없음), 내부 단위 SI (변환은 UI에서, D-012), 난수는 시드 고정, 새 계산에는 **해석해·문헌값 테스트**(기준값 Contents §6), 기호는 Contents §3.
- 랩: 사양(Contents §5)을 먼저 쓰고 구현. `LabFrame` + `ParamSlider`·`ParamSelect`·`ParamToggle`·`ReadoutTable`·`Formula`·`Plot`(극좌표는 `PolarPlot`, D-035). 첫 렌더에 시간·시드 없는 난수·`window`를 쓰지 않고, 이론상 0인 값은 0으로 표시 (I-019). 랩 모음 등록은 §4 공유 규칙.
- 페이지: `src/pages/p{Part}-{절}.mdx` + frontmatter `sectionId` (D-023). 작성은 **`docs/PageGuide.md`** (질문에서 출발하는 구어체·과장 금지·"학교 vs 현장" 금지, 앞 페이지 개념만, 개념마다 `Figure`, `Callout` 6종, 랩 앞 따라 하기·뒤 해석, 코드 블록·아스키 도표 금지). push 전 체크리스트 PageGuide §11.
- `texNumber`·`formatNumber`의 둘째 인자는 **유효숫자**. KaTeX는 `overrides`로 한 버전 (`npm ls katex`, I-021). 성능 측정은 `scripts/bench/plot-bench.mjs` (I-020).

## 7. 토큰 절약 수칙 (D-038)

- ② 문서는 통째로 읽지 않는다: 목차(`grep -n "^##"`) → 필요한 절만 `sed -n` / Read offset. 편집 뒤 같은 파일을 다시 읽지 않는다.
- 화면 점검은 `npm run verify:page`를 쓴다 (캡처·CDP 스크립트를 새로 쓰지 않는다). 캡처는 문제 구간만 열어 본다.
- 본문·캡션·랩 과제의 숫자는 쓰기 전에 테스트나 짧은 계산으로 확인한다 — 고쳐 쓰는 왕복이 가장 비싸다.
- 넓은 탐색(여러 파일·명명 규칙 찾기)은 하위 에이전트에 맡기고 결론만 받는다.
- 세션 로그는 짧게, 자세한 경위는 커밋 메시지에. 끝난 표·사양은 바로 `archive/`로.

## 8. 하지 말 것

- `docs/source/curriculum.md` 수정 (오류는 `Issues.md`에 유형 `콘텐츠`)
- force push, 이미 push한 커밋의 재작성
- **공개 저장소·사이트**: ISO/API 규격 본문·표·경계값 전재 금지(요약 + 출처, I-009), 회사 현장 데이터·도면·비밀·개인 연락처 금지
