# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 **자기 트랙 절** 맨 위에 추가하고 트랙마다 **최근 2개**만 남긴다 (나머지는 `archive/SessionLog.md`). 로그 1건은 8줄 이내, 이 파일은 120줄 이하 (D-030·D-038). 끝난 큰 마일스톤의 세부 표·회고는 `archive/Milestones.md`.
> 세션 시작 때는 트랙 현황·공통 핸드오프·자기 트랙 핸드오프까지만 읽으면 된다. 아래 세부 현황·세션 로그는 필요할 때만.
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6). 모든 작업은 `main`에서 한다 (D-019).
> **2026-10-06부터 두 트랙이 나란히 간다 (D-029)**: 트랙 A = Claude가 Part 2(M1) → Part 3(M3), 트랙 B = Part 1(M2) → Part 5(M5), 담당은 2026-10-06부터 다시 **Codex** (D-034). 자기 트랙의 행·절만 고친다.

## 트랙 현황

| 트랙 | 범위 | 담당 | 작업 폴더 | 진행 | 지금 세부 | 상태 |
|---|---|---|---|---|---|---|
| **A** | M1 (Part 2) → M3 (Part 3) → **M4 (Part 4)** | Claude | `진동공부` | M1 18 / 18, M3 5 / 5 (확인 대기), M0.6·M0.7 정비 완료 | 다음 **M4** Part 4 신호처리 확장 (세부 목록 사용자 확인 대기) | **대기** |
| **B** | M2 진동의 기초 (Part 1) → **M5 회전체 동역학 기초 (Part 5)** | **Codex** | `진동공부-Codex` (worktree) | M2 10 / 10, **M5 2 / 4** | 다음 **M5.2** Jeffcott 로터 (P5-3, LAB-JEF-01) | **대기** (M5.1 구현 완료·사용자 검토 대기) |

- 사이트: https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포)
- 사용자 확인 대기: **P2-6 TSA 절** (M1.12, §6: 그림 9 ~ 12, LAB-AVG-02 두 곳), **P2-7 스케일링·단위(M1.13)**, **P2-8 변조·맥놀이(M1.14)**, **P2-9 측정 설정 종합·Signal Lab(M1.15)**, **P3-1 ~ P3-5** (M3.1 ~ M3.5), **P1-1~P1-8** (M2.1~M2.8, P1-1~P1-6은 2026-10-06 전수 검토 반영), **P2-1 정리(M2.9)**, **P5-1(M5.0)**, **P5-2(M5.1)**

## 핸드오프 — 공통

- **번호 개편 (D-039, 2026-10-06)**: Part 1 ~ 11, 절은 Part마다 1부터 (대응표 D-039). 주소·파일 이름·모든 문서 참조를 바꿨다. **트랙 B: 진행 중인 M5.2는 P5-3(`p5-3.mdx`, `figures/p5-3.ts`), M5.3은 P5-4** — 옛 번호로 만든 파일은 rebase 뒤 이름을 바꿔 주세요. 마일스톤 ID는 그대로 (M1 = Part 2, M2 = Part 1, M3 ~ M11 = Part 3 ~ 11). 공개된 절은 모두 **검토**.
- **작성 기준** `docs/PageGuide.md` (D-028), 개념 척추 `Contents.md` §1-2. 번호 체계 D-027 (Part 1 = 진동 입문 P1-1 ~ P1-8, Part 5 = 회전체 P5-1 ~ P5-4, M5 = Part 5, M6 ~ M11 = Part 6 ~ 11).
- **문서 다이어트·토큰 절약 (D-038, 2026-10-06)**: AGENTS.md를 반으로 줄였다(§7 토큰 절약 수칙). Progress는 120줄·트랙마다 로그 2개·끝난 마일스톤 표는 archive. Contents §5는 구현된 랩을 한 줄 표로, 원래 사양은 `archive/LabSpecs.md`. **트랙 B는 다음 세션에 자기 핸드오프·로그를 이 기준으로 줄여 주세요.**
- **화면 점검은 `npm run verify:page -- /경로/`** (D-038): hydration·콘솔·HTTP·모바일 넘침·구간 캡처(`dist/qa`). Git Bash의 경로 변환도 처리한다. 매번 캡처 스크립트를 새로 쓰지 않는다.
- **UI 개편 (D-037, 2026-10-06, 공용 코어)**: `MdxLayout`에 Part 사이드바(같은 Part 절·이 페이지 목차·다른 Part, 좁은 화면은 접힘)와 "이어서 보기" 기억, `BaseLayout`에 `wide`, `LabFrame` 머리에 "이 랩만 크게 보기" 링크, 홈 4단계 학습 지도(`curriculum.ts`의 `STAGES`, `featured` 삭제). **새 랩을 만들면 `src/data/labs.ts`와 `pages/lab/[slug].astro`에 한 줄씩** — `labs.test.ts`가 빠진 줄을 잡는다. 원문 링크는 `lib/labRefs.ts`가 자동 수집.
- **이전 공용 코어 변경**: `ui/PolarPlot`(D-035), `Plot`의 CSS 변수 색, `lib/figure.ts` 도식 기능, `lib/dsp/signal.ts`의 `impulses`. 자세한 내용은 해당 커밋.
- **함정**: 유효숫자 인자, 이론상 0 → 0 표시(hydration), MDX 함정 PageGuide §8. Node·gh는 PATH에 있으니 앞붙임 없이 `npm …` (옛 PATH를 물려받은 창은 다시 시작). Python 없음. rebase 충돌 때 다른 트랙의 행·절·로그는 origin 쪽 그대로 (I-026).

## 핸드오프 — 트랙 A (Claude, Part 2 → 3 → 4)

- **상태**: M1(Part 2)·M3(Part 3) 세부 완료, 사용자 확인 대기 (표·회고는 `archive/Milestones.md`). 페이지마다 계산 코어: `lib/sensor`·`proximity`·`phase`·`measurementChain`·`transient`·`protection`.
- **방금 끝냄 (M0.6·M0.7, D-037·D-038)**: 사용자 요청 "UI 개선 · Signal Lab 랩 모음 · 문서 정리" — 홈 학습 지도, Part 사이드바, /lab/ 랩 모음과 랩별 단독 페이지(36개), 문서 다이어트, `verify:page`.
- **다음**: **M4 Part 4** — 세부 목록(Roadmap §6-7, M4.1 필터 ~ M4.8 켑스트럼)을 사용자와 확인한 뒤 시작. P4-2는 P3-4의 ski-slope·`measurementChain`을, P4-5는 P3-5의 `transient.smearDemo`를 이어 쓴다.
- **요령**: 그림 숫자는 `figures-p*.test.ts`로 고정하고, 캡션·과제 문장은 쓰기 전에 계산으로 확인한다. 같은 랩을 여러 곳에 둘 때는 props로 시작 상태 + `client:visible`. 넓은 검토는 하위 에이전트에 "읽기 전용 + 계산 재검증"으로 맡긴다.
- **P2-1은 트랙 B 소유**. 고칠 일은 트랙 B 핸드오프에 요청으로 남긴다.

## 핸드오프 — 트랙 B (Codex, Part 1 마무리 → Part 5)

- **담당**: 2026-10-06부터 다시 **Codex** (D-034). 작업 폴더 `C:\Users\AX\Desktop\ATG\업무\진동공부-Codex` (git worktree, detached HEAD). 기본 폴더 `진동공부`는 트랙 A가 쓰므로 들어가지 않는다.
- **시작할 때마다**: `git fetch origin` → `git rebase origin/main` (로컬 커밋이 없으면 `git checkout --detach origin/main`). push: 검사 통과 후 `git push origin HEAD:main`. 거절되면 다시 fetch·rebase.
- **방금 끝냄 (2026-10-06, M5.1)**: P5-2 1자유도 불평형 응답(Bode/Polar·증폭계수·분리여유)·그림 7·LAB-AF-01 RunUpBodeLab 추가. `lib/rotor/runup.ts`는 시드 고정 런업·1X 벡터·Slow roll 보상·AF(N₁~N₂)·SM 계산. 회귀/단위 테스트 20개 및 Edge 브라우저 회귀 통과. 공용 UI·트랙 A 소유 페이지/그림/랩 변경 없음.
- **산출물·근거**: `src/pages/p5-2.mdx`·`src/figures/p5-2.ts`·`RunUpBodeLab.tsx`·`lib/rotor/runup.ts`·`runup.test.ts`·`figures-p5-2.test.ts`·`scripts/verify/p5-2-qa-runner.mjs`. 본문 8개 개념 절·그림 7·확인 문제 6·LAB-AF-01(Bode/Polar/Both 모드, Slow roll 보상, 리셋, 모바일 390px 폭 넘침 0) 구현.
- **검증**: `npm run check` 오류 0·`npm test` 391개·`npm run build` 39페이지. 브라우저 회귀: 7개 그림·캡션, 내부 링크 200, 랩 수치(3000 rpm, 100 µm pp, AF 9.84, SM 16.7%), 뷰 모드 전환, 390px 모바일 폭, 갤러리 7개 확인, hydration·콘솔 오류 0.
- **다음 (D-034·D-036)**: **M5.2** Jeffcott 로터 (P5-3, LAB-JEF-01) → **M5.3** 유막 베어링과 안정성 (P5-4, LAB-STB-01). P5-3은 자전/선회·강체/굽힘을 모델 전에 다루도록 사양 반영됨.
- **상태**: M5 2/4 구현 (P5-1·P5-2 사용자 검토 대기). M2 10/10 구현·사용자 검토 대기, 세부 표와 회고는 `archive/Milestones.md`.
- **미구현 범위**: M5.2 `lib/rotor/jeffcott.ts`·P5-3·LAB-JEF-01, M5.3 P5-4·LAB-STB-01은 아직 계획이다. M5 전체 완료나 P5-2 사용자 승인으로 기록하지 않는다.
- **이전 Codex 구현**: M5.0 P5-1 = `d79f642`, M2.9 P2-1 정리 = `a78e260`, M2.8 P1-8 = `8437d85`. 상세 로그는 `archive/SessionLog.md`.
- **먼저 읽을 것**: `AGENTS.md` → `PageGuide.md`(§5-4 도식, §6-4 랩, §8 MDX 함정) → `Roadmap.md` §6-6(M5) → `Curriculum.md` Part 5 → `Contents.md` §1-2 Part 5 척추·§3 위상 관례/로터 기호·§5 LAB-SUP-01/AF-01/JEF-01/STB-01·§6 → D-034~D-036.
- **Part 1 지금 상태**: P1-1 ~ P1-8과 정리한 P2-1은 검토(사용자 확인 대기). 트랙 A가 P1-1 ~ P1-6을 전수 검토해 고치고 P1-7을 만들었다 (D-033, 커밋 `e1fc5fd`). P1-6 → P1-7 → P1-8 → P2-1 링크 연결됨.
- **공유 문서 주의 (I-026)**: rebase 충돌 때 다른 트랙의 행·절은 origin/main 쪽을 살린다. Progress·Contents·Glossary의 트랙 A 내용(세션 로그, Part 2·3 척추, Part 2·3 랩 사양)은 고치지 않는다 — M2.5·M2.6 커밋에서 되돌려진 일이 있다.
- **종료 전 대조**: 트랙 B 요약·큰 M5 행·세부 표·핸드오프·Contents/목차·실제 커밋을 함께 확인한다. 2026-10-06에는 세션 로그만 맞고 큰 M5 행이 0/3으로 남아 I-028로 보정했다. push는 다른 worktree의 열린 파일을 갱신하지 않으므로 기본 폴더의 Progress가 최신이라고 가정하지 않는다.
- **함정**: 문장부호 + 한글 조사 옆 굵은 글씨는 `<strong>`, 도식 `circle`의 `r`는 px, 랩 SVG 안 굵은 글씨는 `<tspan fontWeight>` (PageGuide §8). 첫 렌더에 시간·난수·window 금지.
- Node가 PATH에 없으면 검사 명령 앞에 `$env:Path = 'C:\Program Files\nodejs;' + $env:Path`.
- **고치지 않는 것**: `src/pages/p2-2 ~ p2-9`·`p3-*`·`p4-*`, `src/figures/p2-*`·`p3-*`·`p4-*`(p2-1 제외), `src/lib/dsp/`·`lib/sensor.ts`(읽기·import 자유), Part 2·3·4 랩, 문서의 트랙 A 행·절.

## 큰 마일스톤 현황

| M | 범위 | 상태 | 세부 진행 | 완료일 |
|---|---|---|---|---|
| M0 | 기반 구축 | **완료** | 5 / 5 | 2026-10-02 |
| M1 | 신호처리 기초 (Part 2) · 트랙 A | **세부 완료 — 사용자 확인 대기** | 18 / 18 | — |
| M2 | 진동의 기초 (Part 1) · 트랙 B | **세부 완료 — 사용자 검토 대기** | 10 / 10 | — |
| M3 | 센서와 측정 체인 (Part 3) · 트랙 A | **세부 완료 — 사용자 확인 대기** | 5 / 5 | — |
| M4 | 신호처리 확장 (Part 4) · 트랙 A (M3 다음) | 대기 | 0 / 8 | — |
| M5 | 회전체 동역학 기초 (Part 5) · 트랙 B (D-034·D-036) | **진행 중** (M5.1 구현·사용자 검토 대기) | **2 / 4** | — |
| M6 | 현장 플롯 읽기 (Part 6) | 대기 | 0 / 6 | — |
| M7 | 결함별 진단 (Part 7) | 대기 | 0 / 7 | — |
| M8 | GT/ST 특화 현상 (Part 8) | 대기 | 0 / 4 | — |
| M9 | 구조 시험 · 밸런싱 · 정렬 (Part 9) | 대기 | 0 / 3 | — |
| M10 | 규격 · 판정 · 진단 절차 (Part 10) | 대기 | 0 / 2 | — |
| M11 | 종합 진단 연습 + 레퍼런스 (Part 11) | 대기 | 0 / 3 | — |

상태: `대기` → `진행 중` → `완료`

## M2 진동의 기초 — 구현 완료 · 사용자 검토 대기

- 세부 10 / 10 구현 완료 (2026-10-06). 상세 표·회고는 `archive/Milestones.md` §M2. 사이트의 P1-1~P1-8·P2-1은 **검토** 유지.
- 회고: 물리 → 기계 요소 → 합성 신호 → 측정 화면 연결이 정리됐다. 다음에는 수치 해석·모바일 표 폭을 작성 단계부터 확인하고, rebase 시 트랙 A 문서 보존을 계속 검증한다.

## 세부 마일스톤 현황 — M5 회전체 동역학 기초 (Part 5) · 트랙 B (D-034·D-036)

| 세부 | 내용 | 상태 | 담당 | 커밋 | 완료일 |
|---|---|---|---|---|---|
| M5.0 | 회전기계 구성·지지계 도입 (P5-1, LAB-SUP-01) | **완료** (구현 기준, 사용자 검토 대기) | Codex | `d79f642` | 2026-10-06 |
| M5.1 | 로터 계산 코어 `lib/rotor` + Bode/Polar·증폭계수 (P5-2, LAB-AF-01) | **완료** (구현 기준, 사용자 검토 대기) | Codex | main | 2026-10-06 |
| M5.2 | Jeffcott 로터 (P5-3, LAB-JEF-01) | 대기 | Codex | — | — |
| M5.3 | 유막 베어링과 안정성 (P5-4, LAB-STB-01) | 대기 | Codex | — | — |

## 완료된 큰 마일스톤

- **M0 기반 구축** (2026-10-02) — 세부 표·커밋·회고는 `archive/Milestones.md`

## 세션 로그 — 트랙 A (Claude) · 최근 2개, 최신이 위

### 2026-10-06 · Claude · M0.8 Part·절 번호 1부터, 모두 검토 (D-039)
- 요청: 사용자 — "싹다 검토 단계로 / 절들 모두 1부터, Part도 1부터, 문서에서 모두" (Signal Lab은 그대로 두기로)
- 한 일: 변환 스크립트로 151개 파일의 참조(P·p 번호, Part 번호, 쪽 제목, Curriculum 절 번호)와 46개 파일 이름을 한 번에 바꿈. 조사 15곳 맞춤. Curriculum "원본" 줄·부록 A의 원본 번호는 손으로 구분
- 상태: 공개 절 24개 모두 검토 (옛 완료 4개 포함), 목차 테스트를 새 규칙으로
- 확인: check, test 412, build 76페이지, 내부 링크 1,422개·앵커 모두 연결, verify:page 8쪽 OK
- 다음: M4 세부 목록 사용자 확인 (M4 = Part 4)

### 2026-10-06 · Claude · M0.6 UI 개편·랩 모음 + M0.7 문서 다이어트 (D-037·D-038)
- 요청: 사용자 — "UI 개선(지도·같은 Part 이동·Part 2만 다른 표시), Signal Lab에 랩만 골라 보기 + 원문 링크, 문서 정리·토큰 절약"
- UI: 홈 4단계 학습 지도·히어로, 절 페이지 Part 사이드바, Part 페이지에 절별 랩. Part 2의 ★·색은 원본 커리큘럼의 "핵심" 표시(`featured`)였다 → 삭제
- 랩 모음: /lab/ 허브(거르기·찾기) + 36개 단독 페이지, 원문 링크 자동 수집(앵커 전수 확인), LabFrame "이 랩만 크게 보기". 샌드박스는 /lab/sbx-01/
- 문서: AGENTS 15 → 8 KB, Contents 101 → 53 KB(구현된 랩 사양 → archive/LabSpecs.md), Progress 정리, `verify:page` 도구
- 확인: check, test, build 74 → 75페이지, verify:page로 홈·절·랩 페이지 hydration·오류 0·모바일 넘침 0

## 세션 로그 — 트랙 B (Part 1 → Part 5) · 최근 3개, 최신이 위

### 2026-10-06 · Codex · M5.1 1자유도 불평형 응답과 Bode/Polar 랩 — P5-2, LAB-AF-01
- 요청: 사용자 — "M5.1 너가해봐" → "하던거 해서 마무리해봐바"
- 본문: 1자유도 불평형 런업 해석해(r, ζ), Bode vs Polar, heavy/high spot 위상 지연(0°→90°→180°), Half-power AF 및 분리여유 SM, Slow roll 보상과 데이터 오차 3요소. 그림 7·확인 문제 6, PageGuide 준수
- 코어: `lib/rotor/runup.ts` — 시드 고정 런업 스위프, 1X 복소 응답, Slow roll 벡터 차감, AF(ΔN_HP, ζ), SM 계산 순수 함수(+테스트 18)
- 랩: LAB-AF-01 `RunUpBodeLab` — Bode/Polar/Both 3개 뷰 모드, ω_n·ζ·m e·런아웃 슬라이더/토글, Slow roll 보상, Formula 수식 연동, 모바일 390px 최적화 ReadoutTable
- 검증: `npm run check` 0 errors, `npm test` 391개, `npm run build` 39페이지. Edge CDP 브라우저 QA(그림 7종·캡션, 링크 200, 랩 수치, 뷰 전환, 390px 넘침 0, 갤러리, hydration 0)
- 문서: 목차 `curriculum.ts` P5-2 review·링크 연결, Contents §4·§5·§6, Glossary 2행, Progress 갱신. M5 착수 전 로그 archive 이동, 트랙 A 내용 보존
- 다음: 사용자 검토 후 **M5.2** Jeffcott 로터 (P5-3, LAB-JEF-01)

### 2026-10-06 · Codex · M5.0 Progress 기록 불일치 보정 (I-028)
- 요청: 사용자 — 다음 작업 전에 Codex 작업 내용을 Progress에 제대로 기록하라는 지적. 이번 세션은 문서 보정만, M5.1 미착수
- 발견: M5.0 로그·트랙 B 1/4는 있었지만 큰 M5 표가 대기·0/3으로 남음. 문자열 치환 누락과 표별 검증 누락이 원인. 기본 폴더의 별도 worktree도 이전 Progress여서 최신으로 보이지 않았음
- 보정: 큰 M5 표 진행 중·1/4, 세부 M5.0 구현 커밋 `d79f642`·사용자 검토 대기. 핸드오프에 본문/그림/랩/계산/테스트 파일, 검증 수치, 실제 CI·배포 링크, M5.1~3 미구현 범위 명시
- 근거: `d79f642` CI & Deploy 실행 37427107543 성공 재확인. check 오류 0·테스트 351개·빌드 37페이지는 M5.0 구현 버전의 결과이며 문서 보정 후 같은 코드로 재실행 통과. M5.1 새 구현 결과가 아님
- 검증: 요약·큰 표·세부 표·Roadmap·Contents·목차의 진행 수/상태 대조, 실제 커밋 산출물 확인, Claude 트랙 행/절/로그 보존, 최근 B 로그 3건·Progress 200줄 이하 확인
- 보관: I-028 해결 기록, M2.9 로그 archive 이동. 다른 작업 폴더에 쓰기·git 실행 없음. 다음: 사용자 검토 후 M5.1

### 2026-10-06 · Codex · M5.0 회전기계 구성 도입 — P5-1
- 요청: 사용자 — 다른 Part와 흐름이 맞으면 도입을 추가. D-036 확정, M5.0 신설(기존 P5-2~3·M5.1~3 유지), Curriculum·Contents·Roadmap·목차·Glossary 동기화
- 본문: 모터/로터·구동기/피동기, 축·커플링, 베어링 분류 2축과 하우징/받침대/기초, 운동 방향, MCK 대응. 그림 7·확인 문제 6, Part 1·3·4·6·7 범위 구분
- 랩: LAB-SUP-01, 순수 `lib/machine/supportModel.ts`. 무질량 직렬 모델 → 지지 강성·질량에 따른 f_n, 강체 지지 극한. 실제 축계 일반식이 아님을 본문·그림·랩에서 명시
- 검증: check 오류 0·테스트 351개·빌드 37페이지. 전체 캡처·갤러리, 링크/앵커·슬라이더/초기화/수치·390px 폭·hydration 회귀 통과. 캡처에서 축선에 가린 라벨·힘 화살표 방향 수정
- 문서: M5 1/4·P5-1 검토·핸드오프 갱신, I-027 해결 보관. M2.8 로그 archive 이동, 트랙 A 문서 내용·공용 UI 보존
- 다음: 사용자 검토 → **M5.1**. P5-3·P5-4 도입 보강은 각 마일스톤에서. D-035 사용자 확인 필요
