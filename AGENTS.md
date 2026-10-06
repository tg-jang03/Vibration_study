# AGENTS.md — 공통 작업 규칙 & 문서 인덱스

> **Claude Code와 Codex가 함께 따르는 단일 규칙 파일**입니다.
> Codex는 이 파일을 자동으로 읽고, Claude Code는 `CLAUDE.md`의 `@AGENTS.md`로 같은 내용을 읽습니다 (D-002).
> 규칙을 바꿀 때는 `docs/Decisions.md`에 결정을 먼저 남기고 이 파일을 고칩니다.

## 1. 프로젝트

기초 진동 역학(MCK·모드해석)에서 대형 회전기계(GT/ST) 진동 진단까지, 원리와 실무를 연결하는 **개인 학습용 웹사이트**.
재구성한 커리큘럼(Part 0~10, `docs/Curriculum.md`)을 페이지로 정리하고, 신호처리는 가상 신호를 직접 조작하는 **인터랙티브 랩 + 수식**으로 만든다.

| 역할 | 누구 |
|---|---|
| 학습자, 최종 결정권자 | 사용자 |
| 작업자 (마일스톤 단위로 담당) | Claude Code, Codex, Antigravity |
| 공유 수단 | 이 git 저장소와 `docs/` 문서 |

## 2. 문서 지도 (등급: D-030)

토큰을 아끼기 위해 문서를 세 등급으로 나눈다. **① 항상** 세션마다 읽는다. **② 필요한 절만** — 통째로 읽지 말고 목차(`grep -n "^##" 파일`)나 ID·키워드 검색으로 위치를 찾아 그 절만 읽는다. **③ 보관** — 평소 읽지 않는다 (근거를 추적하거나 사용자가 물을 때만).

| 문서 | 등급 | 무엇을 담나 | 언제 갱신하나 |
|---|---|---|---|
| `AGENTS.md` | ① | 공통 규칙, 문서 지도 (이 파일, 자동으로 읽힘) | 규칙이 바뀔 때 (Decision 선행) |
| `docs/Progress.md` | ① | 트랙 현황·공통 핸드오프·**자기 트랙** 핸드오프 (세부 현황·세션 로그는 필요할 때) | **매 세션 끝 (필수)** |
| `docs/PageGuide.md` | ② | **페이지 작성 지침서**: 톤·뼈대·그림·상자·랩 배치·수식·MDX 함정·체크리스트 = **어떻게 쓰나** | 작성 방법이 바뀔 때 (D-028) |
| `docs/Contents.md` | ② | 개념 척추(§1-2)·기호·식(§3)·페이지 상태(§4)·랩 사양(§5)·기준값(§6)·참고자료 = **어떻게 구현하나** | 콘텐츠를 추가·변경·완료할 때 |
| `docs/Curriculum.md` | ② | Part 0~10 절별 목표·내용·수식·과제·함정 = **무엇을 가르치나**. 자기 Part만 읽는다 | 교육 내용이 바뀔 때 (D-015) |
| `docs/Roadmap.md` | ② | 목표, 사이트·기술 구조, 마일스톤 정의·완료 기준 (§6에서 자기 M 표) | 마일스톤 범위가 바뀔 때 |
| `docs/Decisions.md` | ② | 유효한 결정 `D-xxx` (요약표 + 본문). 대체·폐기된 결정은 보관 | 되돌리기 어려운 선택을 했을 때 |
| `docs/Issues.md` | ② | **열린** 이슈 `I-xxx`만 (블로커·환경·설계·콘텐츠·버그) | 발견 즉시, 해결되면 보관으로 |
| `docs/Glossary.md` | ② | 용어·기호·한 줄 뜻·**처음 나오는 페이지** (용어로 검색) | 새 용어를 쓸 때 |
| `docs/archive/SessionLog.md` | ③ | Progress에서 밀려난 지난 세션 로그 | 트랙의 세션 로그가 3개를 넘을 때 (D-020) |
| `docs/archive/Issues.md` | ③ | 해결·종결된 이슈, 긴 처리 기록 | 이슈가 닫힐 때 (D-030) |
| `docs/archive/Decisions.md` | ③ | 대체·폐기된 결정 | 결정이 대체·폐기될 때 (D-030) |
| `docs/archive/Milestones.md` | ③ | 끝난 큰 마일스톤의 세부 표·회고, 끝난 세부의 산출물·코어 설계 메모 | 마일스톤이 끝날 때 (D-030) |
| `docs/source/curriculum.md` | ③ | 사용자가 처음 준 원본 커리큘럼 | **수정 금지** (읽기 전용, D-004) |

## 3. 세션 절차

**시작할 때**
1. `git status` / `git log --oneline -10`으로 현재 상태 확인
2. `docs/Progress.md`의 "트랙 현황"·"핸드오프 — 공통"·**자기 트랙** "핸드오프" 읽기 (내 트랙·작업 폴더가 맞는지 확인)
3. 그 작업에 필요한 ② 문서의 **해당 절만** 읽는다: `Roadmap.md` §6의 자기 세부 행, `Issues.md` 요약표, 관련 `D-xxx`, `Curriculum.md`의 그 Part, `Contents.md`의 그 페이지·랩 행(사양이 비어 있으면 먼저 작성). 페이지를 쓰기 전에는 `docs/PageGuide.md`
4. ③ 보관 문서는 읽지 않는다

**끝낼 때**
1. `docs/Progress.md`: 트랙 현황·세부 현황 갱신, **자기 트랙** 세션 로그 1건(10줄 이내)을 그 절 **맨 위**에 추가, 자기 트랙 핸드오프 갱신. 그 트랙의 세션 로그가 3개를 넘으면 가장 오래된 것을 `docs/archive/SessionLog.md` 맨 위로 옮긴다
2. 새 결정 → `Decisions.md`, 새 문제 → `Issues.md` (머리의 "다음 번호"를 올린다), 콘텐츠 상태 변화 → `Contents.md`
3. **보관 (D-030)**: 해결·종결된 이슈 → `archive/Issues.md`, 대체·폐기된 결정 → `archive/Decisions.md`, 끝난 큰 마일스톤의 세부 표·회고와 끝난 세부의 산출물 상세 → `archive/Milestones.md`. 원래 자리에는 한 줄만 남긴다
4. 테스트·빌드가 있다면 통과를 확인한 뒤 커밋 (§4 규칙)

## 4. 마일스톤 & Git 협업 (D-017, D-019, D-029)

- 저장소: `origin` = https://github.com/tg-jang03/Vibration_study (**공개**, 기본 브랜치 `main`)
- 마일스톤은 2단계다: 큰 마일스톤 `M{n}`(커리큘럼의 큰 범위) → 세부 마일스톤 `M{n}.{m}`(실제 작업 단위). 목록은 `docs/Roadmap.md` §6.
- **모든 작업은 `main`에서 한다.** 브랜치와 PR은 만들지 않는다 (D-019).
- **병렬 트랙 (D-029, 2026-10-06~)**: 지금은 두 트랙이 나란히 간다. **트랙마다 세부 마일스톤 하나만 "진행 중"**. 시작 전에 `Progress.md` 트랙 현황에서 내 트랙·담당을 확인한다. 같은 트랙에 다른 에이전트가 진행 중이면 기다린다.

  | 트랙 | 범위 | 담당 | 작업 폴더 | 최신 받기 → push |
  |---|---|---|---|---|
  | A | M1 Part 1 (세부 완료, 확인 대기) → **M3 Part 2 (M3.2 ~ M3.5, D-031)** → M4 Part 3 (D-034) | Claude | `진동공부` (`main`) | `git pull --rebase` → `git push` |
  | B | M2 Part 0 (**M2.8 ~ M2.9**, D-032) → **M5 Part 4 (M5.0 ~ M5.3, D-034·D-036)** | Codex | `../진동공부-Codex` (worktree, detached) | `git fetch origin` → `git rebase origin/main` → `git push origin HEAD:main` |

  - 파일 소유 (자세히는 D-029, D-031, D-034): A만 `p1-1 ~ p1-8`·`p2-*`·`figures/p1-*`·`figures/p2-*`·`lib/dsp`·`lib/sensor.ts` 등 Part 2 계산 모듈·Part 1·2 랩·`index.astro` (M4부터 `p3-*`·`figures/p3-*`·Part 3 랩) / B만 `p0-*`·`p4-*`·`figures/p0-*`·`figures/p4-*`·`lib/mck`·`lib/rotor`·`lib/machine`·Part 0·4 랩·`p1-0.mdx`·`SineBasicsLab` / 공유는 자기 구역만(`curriculum.ts`의 자기 Part, 갤러리의 자기 절, 문서의 자기 트랙 행·절) / 공용 코어(`lib/figure.ts`, `components/content`·`ui`, `layouts`, `global.css`)는 하위 호환으로만 고치고 핸드오프에 적는다.
  - rebase 충돌은 문서의 같은 자리에서만 난다 → 양쪽 내용을 모두 살린다. 새 `D-`·`I-` 번호는 push 직전에 `origin/main`의 마지막 번호를 확인하고, 겹치면 나중에 push하는 쪽이 올린다.
  - **다른 트랙의 작업 폴더에서는 설치·빌드·git 명령을 실행하지 않는다.** worktree를 만들기 전에 `git worktree list`와 상위 폴더를 확인한다 (Windows는 폴더 이름의 대소문자를 구분하지 않는다, I-024).
- 그 밖의 짧은 병렬 (D-021): 사용자가 요청하면 세 번째 작업은 별도 worktree(`git worktree add --detach ../진동공부-<에이전트> main`)에서 파일이 겹치지 않는 세부 마일스톤을 한다.
- 작업 순서: 최신 받기 → 작업 → 커밋 → 다시 최신 받기 → 검사 → push. push가 거절되면 다시 rebase 후 push한다 (아직 push하지 않은 자기 커밋만 rebase).
- 커밋 메시지: `[M{n}.{m}] {type}: {요약}` — type은 `feat` `fix` `docs` `test` `refactor` `chore`
  - 예: `[M0.3] feat: Astro 사이트 골격`, `[M1.5] feat: 샘플링 랩(LAB-SMP-01) 추가`
  - 세부 마일스톤 하나에 커밋 하나가 기본. 크면 여러 개로 나눠도 된다.
- 금지: force push, 이미 push한 커밋의 히스토리 재작성. 되돌릴 때는 `git revert`.
- 세부 마일스톤 완료 흐름
  1. 완료 기준 충족 + `npm run check`·`npm test`·`npm run build` 통과 (push하면 GitHub Actions가 같은 검사 후 배포한다. Actions 탭에서 성공을 확인한다)
  2. 문서 갱신: `Progress.md`(상태 `완료`, 세션 로그, 핸드오프), 필요하면 Contents·Issues·Decisions
  3. 커밋 → push. 사용자는 GitHub 커밋 기록이나 배포 사이트로 확인하고, 수정 요청은 다음 작업으로 처리한다.
- 큰 마일스톤의 마지막 세부가 끝나면 `Progress.md`에 짧은 회고(잘된 점, 바꿀 점)를 남기고, 다음 큰 마일스톤의 세부 목록을 사용자와 확인한다.

## 5. 문서 작성 규칙

- 날짜는 절대 날짜 `YYYY-MM-DD`. "어제", "다음 주" 같은 상대 표현은 쓰지 않는다.
- 짧게 쓴다 (D-030): 세션 로그 1건 10줄 이내(자세한 내용은 커밋 메시지), 이슈 본문 15줄 이내, `Progress.md` 200줄 이하. 끝난 기록은 지우지 말고 보관 파일로 옮긴다.
- ID 체계 (한 번 쓴 ID는 보관된 것까지 재사용하지 않음. D·I의 다음 번호는 각 문서 머리에)

  | 대상 | 형식 | 예 |
  |---|---|---|
  | 큰 마일스톤 | `M{n}` | M1 |
  | 세부 마일스톤 | `M{n}.{m}` | M1.5 |
  | 결정 | `D-{3자리}` | D-007 |
  | 이슈 | `I-{3자리}` | I-004 |
  | 페이지 | `P{Part}-{절}` (Curriculum 절 번호) | P1-4 (Part 1-4 윈도우) |
  | 랩 | `LAB-{주제}-{2자리}` | LAB-WIN-01 |
  | 참고자료 | `R-{2자리}` | R-05 |

- `Decisions.md`는 **추가만** 한다. 결정을 바꾸려면 새 결정을 쓰고 이전 결정의 상태를 `대체됨 → D-xxx`로 바꾼 뒤 본문을 `archive/Decisions.md`로 옮긴다.
- 결정 상태: `제안`(사용자 확인 전) → `확정` / `폐기` / `대체됨`. 제안 상태인 결정 위에 큰 작업을 쌓아야 하면 먼저 사용자에게 확인한다.
- 작성자는 `Claude` / `Codex` / `Antigravity` / `사용자` 중 하나로 표기한다.
- 문서와 사이트 UI는 한국어. 전문용어는 처음 나올 때 영문을 병기한다 (예: 누설(Spectral Leakage)). 코드와 식별자는 영어 (D-005).

## 6. 코드 규칙 (M0 스캐폴딩 이후 적용)

기술 스택은 `docs/Decisions.md` D-006~D-012, 디렉터리 구조는 `docs/Roadmap.md` §4를 따른다.

- 명령: `npm install` → `npm run dev`(개발 서버) · `npm run check`(타입 검사) · `npm run build`(정적 빌드) · `npm test`(Vitest, `src/**/*.test.ts`) · `npm run test:watch`
- 사이트는 `/Vibration_study/` 하위 경로로 배포된다. 내부 링크와 정적 파일 경로는 반드시 `withBase()`(`src/lib/site.ts`)로 만든다.
- 화면 확인(Windows): `npm run build` → `npx astro preview` → Edge 헤드리스 캡처 `msedge --headless=new --window-size=1100,1500 --virtual-time-budget=8000 --screenshot=<png> <URL>` (PowerShell `Start-Process -Wait`로 실행). 수식은 `$…$`·`$$…$$`(MDX), 랩 수식은 `Formula`, 플롯은 `Plot` 래퍼만 쓴다.
- 사이트 목차(`src/data/curriculum.ts`)는 `docs/Curriculum.md`의 절 구성, `docs/Contents.md` §4의 페이지 상태와 같아야 한다. 한쪽을 고치면 다른 쪽도 고친다.

- `src/lib/dsp/`·`src/lib/mck/`(Part 0 질량-스프링 모델)에는 **순수 함수만** 둔다. DOM·React·플롯 라이브러리에 의존하지 않는다.
- 내부 단위는 SI (s, Hz, rad, m, m/s, m/s²). rpm, mm/s, µm, g, dB 변환은 UI 계층에서만 한다 (D-012).
- 난수는 반드시 시드를 고정한다 (같은 파라미터 → 같은 결과).
- 새 DSP·MCK 함수에는 **해석해 또는 문헌값으로 검증하는 테스트**를 함께 넣는다 (예: Hann ENBW = 1.5 bin, bin 중심 톤의 진폭 = 입력 진폭). 기준값은 `docs/Contents.md` §6.
- 기호·수식 표기는 `docs/Contents.md` §3을 단일 기준으로 쓴다.
- 랩은 `docs/Contents.md`의 랩 사양을 먼저 채우고 구현한다. 구조: 조작 → 플롯 → 수식(현재 값 대입) → 실험 과제.
- 랩은 `LabFrame`(`components/ui/`)으로 감싼다. 입력은 `ParamSlider`·`ParamSelect`·`ParamToggle`, 읽음값은 `ReadoutTable`, 수식은 `Formula`, 플롯은 `Plot`만 쓴다 (극좌표 Polar는 `PolarPlot`, D-035). 예시: `/dev/lab-ui/` (`LabUiDemo.tsx`).
- 랩 컴포넌트는 빌드 때 서버에서도 한 번 그려진다. 시간(`performance.now`), 시드 없는 난수, `window`·화면 크기처럼 서버와 브라우저에서 달라지는 값은 첫 렌더에 쓰지 않는다. 이론상 0인 값의 부동소수점 잡음(1e-15 수준)도 그대로 표시하지 않고 0으로 보여준다 (hydration 오류, I-019).
- **페이지 작성은 `docs/PageGuide.md`를 따른다** (D-025 톤 + D-026 구조 + D-028 지침서, 기준 페이지 P1-0 ~ P1-4). 핵심만: 질문에서 출발하는 구어체·과장 금지·**"학교 vs 현장" 이분법 금지**, 앞 페이지까지 나온 개념만(개념 척추 `Contents.md` §1-2), 개념마다 `Figure`(데이터는 `src/figures/p{Part}-{절}.ts`), 강조 상자는 `Callout` 6종, 랩 앞 따라 하기·뒤 해석, 아스키 그림·코드 블록 금지, 모든 요소 같은 폭(`--content-width`). push 전 체크리스트는 PageGuide §11.
- `texNumber(v, sig)`·`formatNumber(v, sig)`의 둘째 인자는 **유효숫자**다 (소수 자리 아님). `texNumber(2560, 1)`은 "3000"이 된다. 주파수·dB는 3~4를 쓴다.
- 새 절 페이지는 `src/pages/p{Part}-{절}.mdx` + frontmatter `sectionId` (D-023). 목차 `src/data/curriculum.ts`의 `href`·`status`도 고친다. 예시: `src/pages/p1-1.mdx`.
- KaTeX는 `package.json` `overrides`로 한 버전만 쓴다. 수식 관련 패키지를 바꾸면 `npm ls katex`로 확인한다 (I-021).
- 성능 측정은 `scripts/bench/plot-bench.mjs`(실시간). 헤드리스 캡처의 가상 시간 모드에서는 시간이 0으로 나온다 (I-020).

## 7. 하지 말 것

- `docs/source/curriculum.md` 수정 — 오류나 의문은 `docs/Issues.md`에 유형 `콘텐츠`로 등록
- force push, 이미 push한 커밋의 히스토리 재작성
- **저장소와 사이트는 공개다.** 다음은 커밋하지 않는다.
  - ISO/API 규격의 본문·표·경계값 전재 — 자체 표현으로 요약하고 출처를 밝힌다 (I-009)
  - 회사 현장 데이터, 도면, 비밀정보, 개인 연락처
