# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 **자기 트랙 절** 맨 위에 추가하고 트랙마다 최근 3개만 남긴다 (나머지는 `archive/SessionLog.md`, D-020·D-029). 로그 1건은 10줄 이내, 이 파일은 200줄 이하 (D-030).
> 세션 시작 때는 트랙 현황·공통 핸드오프·자기 트랙 핸드오프까지만 읽으면 된다. 아래 세부 현황·세션 로그는 필요할 때만.
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6). 모든 작업은 `main`에서 한다 (D-019).
> **2026-10-06부터 두 트랙이 나란히 간다 (D-029)**: 트랙 A = Claude가 Part 1(M1) → Part 2(M3), 트랙 B = Antigravity가 Part 0(M2). 자기 트랙의 행·절만 고친다.

## 트랙 현황

| 트랙 | 범위 | 담당 | 작업 폴더 | 진행 | 지금 세부 | 상태 |
|---|---|---|---|---|---|---|
| **A** | M1 신호처리 기초 (Part 1) → **M3 센서와 측정 체인 (Part 2)** | Claude | `진동공부` | M1 18 / 18, **M3 1 / 5** | **M3.2** 프록시미티 프로브 (P2-2: LAB-PROX-01) — M1은 사용자 확인 대기 | **진행 중** (D-031) |
| **B** | M2 진동의 기초 (Part 0) | Antigravity | `진동공부-Codex` (worktree) | 7 / 9 | **M2.6** P0-6 · LAB-UNB-01 | **완료 — 사용자 검토** |

- 사이트: https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포)
- 사용자 확인 대기: **P1-5 TSA 절** (M1.12, §6: 그림 9 ~ 12, LAB-AVG-02 두 곳), **P1-6 스케일링·단위(M1.13)**, **P1-7 변조·맥놀이(M1.14)**, **P1-8 측정 설정 종합·Signal Lab(M1.15)**, **P0-1~P0-6** (M2.1~M2.6)

## 핸드오프 — 공통

- **작성 기준은 `docs/PageGuide.md`** (D-028, 기준 페이지 P1-0 ~ P1-4). 개념 척추는 `Contents.md` §1-2. 핵심: 앞 페이지까지 나온 개념만, 개념마다 그림(`Figure`), 강조 상자는 `Callout` 6종, 랩 앞 따라 하기·뒤 해석, **코드 블록·아스키 도표 금지**, 정리는 표.
- **커리큘럼 번호 (D-027, 2026-10-02)**: Part 0 = 진동 입문(P0-1 ~ P0-7), 회전체 동역학 = Part 4(P4-1 ~ P4-3), 옛 Part 4~9 → 5~10. M5 = Part 4, M6 ~ M11 = Part 5 ~ 10. 대응표는 D-027.
- **함정**: `texNumber`/`formatNumber` 둘째 인자는 유효숫자. 이론상 0인 값은 0으로 정리(hydration). MDX 함정은 PageGuide §8. Node·gh는 시스템 PATH에 있으므로 `npm …`을 앞붙임 없이 바로 실행한다 (앞붙임이 있으면 허용 규칙에 안 걸려 승인 창이 뜬다, 2026-10-06). 다만 Node 설치 전부터 켜 둔 VS Code·에이전트 세션은 옛 PATH를 물려받아 `npm`을 못 찾는다 → 그 창을 다시 시작한다 (Git Bash는 `~/.bashrc`가 빠진 Node 경로를 보충한다). Python은 없다.
- **문서 읽기·보관 (D-030, 2026-10-06)**: 문서는 등급대로 읽는다 (`AGENTS.md` §2). 큰 문서(Contents·Curriculum·PageGuide)는 목차(`grep -n "^##"`)로 위치를 찾아 그 절만. 닫힌 이슈·대체된 결정·끝난 마일스톤 상세는 `docs/archive/`로 옮기고 평소 읽지 않는다. 새 이슈·결정 번호는 `Issues.md`·`Decisions.md` 머리의 "다음 번호".
- **Progress를 고칠 때 (I-026, 2026-10-06)**: rebase 충돌이 Progress에서 나면 **다른 트랙의 행·절은 origin/main 쪽을 그대로 살린다**. 자기 트랙 행만 고친다 (D-029). M2.5 커밋에서 트랙 A의 M3 표가 사라졌던 일이 있다.
- **공용 코어를 고쳤을 때**는 아래 자기 트랙 핸드오프에 적는다 (D-029). 최근 변경: 2026-10-06 Claude — `layouts/BaseLayout.astro` 상단 메뉴의 "Signal Lab"을 `/lab/` 링크로 (`aria-current` 처리, 다른 메뉴는 그대로). 2026-10-06 Claude — `lib/figure.ts`·`Figure.astro`에 도식 기능(`frame: false`, `line`·`spring`·`damper`·`ground`·`circle`, `squareYRange`, `FIG_LAYOUT`). 기존 그림은 그대로. 2026-10-06 Claude — `components/ui/Plot.tsx`가 `'var(--plot-1)'` 같은 CSS 변수 색을 실제 색으로 풀어 준다 (전에는 Plotly가 무시해 기본색으로 그려졌다. 이 색을 쓰던 랩은 없었음). `lib/dsp/signal.ts`에 성분 `impulses`(감쇠 임펄스열) 추가.

## 핸드오프 — 트랙 A (Claude, Part 1)

- **방금 끝냄 (M3.1)**: P2-1 센서 원리와 선택 — 그림 7(`src/figures/p2-1.ts`, 센서·터빈 베어링 도식 포함), LAB-SNS-01 `SensorLab`(3곳). 모델 `lib/sensor.ts`(가속도계 H(r), 속도계 r²H(r) — `lib/mck` 가져다 씀, 평탄 대역, 마운팅 예시 I-025).
- **다음 (D-031)**: M3 Part 2 — M3.2 P2-2 → M3.3 P2-3 → M3.4 P2-4 → M3.5 P2-5. M1은 P1-5 ~ P1-8 사용자 확인 뒤 완료 처리(세부 표·회고를 `archive/Milestones.md`로).
- 화면 확인 요령: 앱 브라우저 창이 숨겨져 있으면 `client:visible` 랩이 깨어나지 않는다. 헤드리스 Edge를 `--window-size=1100,23500`으로 전체 페이지를 한 번에 찍고, PowerShell `System.Drawing`으로 1500px씩 잘라 본다 (앵커 캡처는 랩 계산 중이면 빈 화면).
- 그림: dB 스펙트럼은 선 + 점. 그림 숫자 회귀 테스트 예: `src/figures/figures-p1-4-5.test.ts`. 같은 랩을 여러 곳에 둘 때는 props로 시작 상태 + `client:visible` (`AveragingLab`).
- **P1-0은 트랙 B 소유** (M2.2·M2.8). 고칠 일이 생기면 트랙 B 핸드오프에 요청으로 남긴다.

## 핸드오프 — 트랙 B (Antigravity, Part 0)

- **작업 폴더**: `C:\Users\AX\Desktop\ATG\업무\진동공부-Codex` (Antigravity 트랙 B git worktree, detached HEAD). 기본 폴더 `진동공부`는 트랙 A가 쓰므로 들어가지 않는다.
- **시작할 때마다**: `git fetch origin` → `git rebase origin/main` (로컬 커밋이 없으면 `git checkout --detach origin/main`). **push**: 검사 통과 후 `git push origin HEAD:main`. 거절되면 다시 fetch·rebase.
- **먼저 읽을 것**: `AGENTS.md` → `docs/PageGuide.md`(특히 §5-4 도식, §6-4 랩, §10 Part 0 특기 사항) → `Roadmap.md` §6-4(M2 표) → `Curriculum.md` Part 0 → `Contents.md` §1-2 Part 0 척추, §5 LAB-MCK-01 ~ LAB-SRC-01, §6 기준값(고유진동수 ~ 불평형 응답 행) → D-027, D-029.
- **M2.6 완료 및 Part 0(P0-1 ~ P0-6) 폼 전수 점검 통일**: P0-1 ~ P0-6 전 페이지를 PageGuide(D-028) 및 기준 페이지(P1-0 ~ P1-4)와 1:1 대조. 수식 오타(P0-2), 부제 통일(P0-4, P0-5), idea 상자 평어체 통일(P0-5, P0-6), 랩 뒤 해석 문단 보완(P0-5, P0-6), 정리 표 제목 통일(P0-5, P0-6), 확인 문제 `<details>` 접기 태그 통일(P0-5, P0-6), Part 1 연결 Callout 및 참고자료 절 보완 완료.
- **다음은 사용자 확인 뒤 M2.7**: P0-7 응답에서 원인으로: 진단은 거꾸로 푸는 문제 (P0-7, LAB-SRC-01: 원인 합성 랩, "원인을 알고 응답을 예측하던 문제를 거꾸로 푸는 것이 진단", 증거 5요소 틀 정립).
- 이 실행 셸에서는 Node가 PATH에 없을 때가 있었다. 그 경우 검사 명령 앞에 현재 프로세스용으로 `$env:Path = 'C:\Program Files\nodejs;' + $env:Path`를 붙이면 된다.
- **고치지 않는 것**: `src/pages/p1-1 ~ p1-8.mdx`, `src/figures/p1-*.ts`, `src/lib/dsp/`(읽기·import는 자유), Part 1 랩, `docs/Progress.md`의 트랙 A 행·절.
- **P1-0**: M2.2(LAB-BAS-01 이동)부터 트랙 B 소유.

## 큰 마일스톤 현황

| M | 범위 | 상태 | 세부 진행 | 완료일 |
|---|---|---|---|---|
| M0 | 기반 구축 | **완료** | 5 / 5 | 2026-10-02 |
| M1 | 신호처리 기초 (Part 1) · 트랙 A | **세부 완료 — 사용자 확인 대기** | 18 / 18 | — |
| M2 | 진동의 기초 (Part 0) · 트랙 B | 진행 중 | 7 / 9 | — |
| M3 | 센서와 측정 체인 (Part 2) · 트랙 A | 진행 중 | 1 / 5 | — |
| M4 | 신호처리 확장 (Part 3) | 대기 | 0 / 8 | — |
| M5 | 회전체 동역학 기초 (Part 4) | 대기 | 0 / 3 | — |
| M6 | 현장 플롯 읽기 (Part 5) | 대기 | 0 / 6 | — |
| M7 | 결함별 진단 (Part 6) | 대기 | 0 / 7 | — |
| M8 | GT/ST 특화 현상 (Part 7) | 대기 | 0 / 4 | — |
| M9 | 구조 시험 · 밸런싱 · 정렬 (Part 8) | 대기 | 0 / 3 | — |
| M10 | 규격 · 판정 · 진단 절차 (Part 9) | 대기 | 0 / 2 | — |
| M11 | 종합 진단 연습 + 레퍼런스 (Part 10) | 대기 | 0 / 3 | — |

상태: `대기` → `진행 중` → `완료`

## 세부 마일스톤 현황 — M1 신호처리 기초 (Part 1) · 트랙 A

| 세부 | 내용 | 상태 | 담당 | 커밋 | 완료일 |
|---|---|---|---|---|---|
| M1.0 | 기초 페이지 (P1-0) | 완료 (D-025·D-026 개편) | Claude / Antigravity | main | 2026-10-02 |
| M1.1 | DSP 코어 ① 신호 모델 | 완료 | Claude | main | 2026-10-02 |
| M1.2 | DSP 코어 ② FFT · 스펙트럼 | 완료 | Codex | main | 2026-10-02 |
| M1.3 | 공통 랩 UI | 완료 | Claude (M1.2와 병렬, D-021) | main | 2026-10-02 |
| M1.4 | 푸리에 기초 (P1-1, LAB-FOU-01) | 완료 (D-025·D-026 개편) | Claude / Antigravity | main | 2026-10-02 |
| M1.5 | 샘플링 · 에일리어싱 (LAB-SMP-01) | 완료 (D-025·D-026 개편) | Antigravity / Claude | main | 2026-10-02 |
| M1.6 | AAF · ADC (LAB-SMP-02, 03) | 완료 (D-025·D-026 개편) | Antigravity / Claude | main | 2026-10-02 |
| M1.7 | 분해능 · Smearing (LAB-RES-01, 02) | 완료 (D-025·D-026 개편) | Antigravity / Claude | main | 2026-10-02 |
| M1.8 | Zoom FFT (LAB-ZOOM-01) | 완료 (D-025·D-026 개편) | Antigravity / Claude | main | 2026-10-02 |
| M1.9 | 윈도우 라이브러리 | 완료 | Antigravity (M1.4와 병렬, D-021) | main | 2026-10-02 |
| M1.10 | 윈도우 랩 (LAB-WIN-01~03, P1-4) | 완료 (M1.T2 보완) | Antigravity / Claude | main | 2026-10-02 |
| M1.T | Part 1 전체 개편 (D-025 스토리텔링 & 랩 밀착형, 학교/현장 이분법 지양) | 완료 | Antigravity | main | 2026-10-02 |
| M1.T2 | Part 1 개편 ② (그림·미니 랩·개념 순서, D-026) | **완료** (P1-0 ~ P1-5, 사용자 확인 대기) | Claude | main | 2026-10-02 |
| M1.11 | 평균화 (LAB-AVG-01) | **완료** (M1.T2에서 본문 재작성·랩 연결) | Codex / Claude | main | 2026-10-02 |
| M1.12 | TSA (LAB-AVG-02) | **완료** (P1-5 §6, 사용자 확인 대기) | Claude | main | 2026-10-06 |
| M1.13 | 스케일링 · 단위 (LAB-SPC-01, 02, LAB-UNIT-01) | **완료** (P1-6, 사용자 확인 대기) | Claude | main | 2026-10-06 |
| M1.14 | 변조 · 맥놀이 (LAB-MOD-01) | **완료** (P1-7, 사용자 확인 대기) | Claude | main | 2026-10-06 |
| M1.15 | 측정 설정 종합 · 샌드박스 (LAB-SBX-01) | **완료** (P1-8, `/lab/`, 사용자 확인 대기) | Claude | main | 2026-10-06 |

**M1 회고 (2026-10-06, 세부 18개 완료 · 사용자 확인 전)**
- 잘된 점: 그림 데이터를 `lib/dsp`로 계산하고 본문 숫자를 회귀 테스트로 묶어, 본문 = 그림 = 랩이 어긋나지 않았다. 사용자 피드백(D-025 → D-026)으로 정한 페이지 형식을 PageGuide(D-028)로 굳힌 뒤에는 P1-5 ~ P1-8을 같은 리듬으로 빠르게 썼다. 전체 페이지 헤드리스 캡처로 라벨 겹침·잘못된 표시를 push 전에 잡았다.
- 바꿀 점: 초기(M1.1 ~ M1.10)에는 페이지를 쓴 뒤 두 번 갈아엎었다(M1.T, M1.T2) — 작성 기준을 먼저 합의했으면 덜 들었다. 병렬 트랙에서 공유 문서(Contents·Glossary·Progress)가 자주 겹친다 → 커밋 직전 최신 받기를 습관으로. 헤드리스 캡처는 앵커·가상 시간에 약하다 → 긴 창 + 잘라 보기.

## 세부 마일스톤 현황 — M3 센서와 측정 체인 (Part 2) · 트랙 A

| 세부 | 내용 | 상태 | 담당 | 커밋 | 완료일 |
|---|---|---|---|---|---|
| M3.1 | 센서 원리와 선택 (P2-1, LAB-SNS-01) | **완료** (사용자 확인 대기) | Claude | main | 2026-10-06 |
| M3.2 | 프록시미티 프로브 시스템 (P2-2, LAB-PROX-01) | **진행 중** | Claude | — | — |
| M3.3 | 키페이저 · 위상 · 1X 벡터 (P2-3, LAB-PHS-01, LAB-SRO-01) | 대기 | Claude | — | — |
| M3.4 | 측정 체인 함정 (P2-4, 퀴즈) | 대기 | Claude | — | — |
| M3.5 | 과도 데이터 수집과 보호 시스템 (P2-5, LAB-ALM-01) | 대기 | Claude | — | — |

## 세부 마일스톤 현황 — M2 진동의 기초 (Part 0) · 트랙 B

| 세부 | 내용 | 상태 | 담당 | 커밋 | 완료일 |
|---|---|---|---|---|---|
| M2.0 | Part 0 착수 준비 (지침서 D-028, 도식 그림, 병렬 트랙 D-029, worktree) | **완료** | Claude | main | 2026-10-06 |
| M2.1 | 질량-스프링 계산 코어 `lib/mck` + 진동이란 (P0-1, LAB-MCK-01 기본) | **완료** (사용자 검토 대기) | Codex | main | 2026-10-06 |
| M2.2 | 고유진동수 (P0-2, LAB-MCK-01 확장, LAB-BAS-01 이동) | **완료** (사용자 검토 대기) | Codex | main | 2026-10-06 |
| M2.3 | 감쇠 (P0-3, LAB-DAMP-01) | **완료** (사용자 검토 대기) | Antigravity | main | 2026-10-06 |
| M2.4 | 강제진동과 공진 (P0-4, LAB-FRC-01) | **완료** (사용자 검토 대기) | Antigravity | main | 2026-10-06 |
| M2.5 | 여러 질량과 모드 (P0-5, LAB-2DOF-01) | **완료** (사용자 검토 대기) | Antigravity | main | 2026-10-06 |
| M2.6 | 불평형과 1X (P0-6, LAB-UNB-01) | **완료** (사용자 검토 대기) | Antigravity | main | 2026-10-06 |
| M2.7 | 응답에서 원인으로 (P0-7, LAB-SRC-01) | 대기 | Antigravity | — | — |
| M2.8 | P1-0 정리 | 대기 | Antigravity | — | — |

## 완료된 큰 마일스톤

- **M0 기반 구축** (2026-10-02) — 세부 표·커밋·회고는 `archive/Milestones.md`

## 세션 로그 — 트랙 A (Claude, Part 1) · 최근 3개, 최신이 위

> 트랙마다 4번째부터는 `docs/archive/SessionLog.md` 맨 위로 옮긴다 (D-020, D-029). 트랙 B 세션 로그는 이 파일 맨 아래.

### 2026-10-06 · Claude · M3 착수, M3.1 센서 원리와 선택 — P2-1
- 요청: 사용자 — "M3 구축작업 진행하자"
- 한 일: D-031(트랙 A → M3, 세부 5개), AGENTS 트랙 표, Roadmap M3 산출물·완료 기준, Contents Part 2 개념 척추. P2-1 본문(8절) — 세 센서, 센서 = 기초가진 1자유도(P0-4의 H(r)), 가속도계 r ≪ 1·속도계 r ≫ 1, ±10 % 대역(25 kHz → 7.5 kHz), 마운팅, GT/ST 축 측정. 그림 7, 랩 3곳
- 코어: `lib/sensor.ts`(+테스트 6), 그림 숫자 테스트 `figures-p2-1.test.ts` 4. I-025(마운팅 예시값)
- 확인: `npm run check` 0 errors, `npm test`, `npm run build`, 전체 캡처로 그림 6 캡션 오류(8 kHz "줄어든다" → 3.1배로 부풂)·도식 글자 겹침 수정
- 협업: M2.5 커밋이 Progress의 트랙 A 부분(M3 표·다음 단계)을 되돌려 복원하고 I-026으로 기록
- 다음: M3.2 프록시미티 프로브 (P2-2)

### 2026-10-06 · Claude · M1.15 측정 설정 종합·Signal Lab — P1-8 (M1 마지막 세부)
- 요청: 사용자 — "다음 작업 진행해"
- 한 일: P1-8 본문(8절) — 결정 순서 ①~⑧(도식), 기어 상자 예로 숫자 따라가기(800 라인), F_max 위 성분과 AAF, 목적별 출발점 표(I-014 예시값 표시), 결과 확인표, Signal Lab, Part 1 정리. 그림 4. Signal Lab 페이지 `/lab/` + 상단 메뉴 링크 + 홈 카드
- 코어: `lib/sandbox.ts`(기계 신호·AAF·평균·성분별 판정·목적별 도우미, +테스트 6), 랩 `SandboxLab`. 그림 숫자 테스트 `figures-p1-8.test.ts` 4
- 문서: Contents §1-2·§4(P1-8·HOME)·§5 LAB-SBX-01 사양(먼저 작성 후 구현)·§6 3행, Glossary 2행, I-014 진행, M1 회고
- 확인: `npm run check` 0 errors, `npm test`, `npm run build`, 헤드리스 캡처로 흐름도 글자 넘침·접힌 대역 표시·0.45X dB 표시 수정, 앱 브라우저로 `/lab/` 그래프·도우미 동작 확인
- 다음: 사용자 확인 → M1 완료 처리 → 다음 큰 마일스톤 결정

### 2026-10-06 · Claude · M1.14 변조·맥놀이 — P1-7
- 요청: 사용자 — "다음 작업 진행해"
- 한 일: P1-7 본문(9절, 381줄) — 정상 신호(덧셈) vs 변조(곱셈), AM·FM·맥놀이의 물리 메커니즘, 삼각함수 곱의 전개($\cos\alpha\cos\beta$), 측대역 간격 $f_m$, AM 진폭비와 측대역 높이($mA/2$), 맥놀이 주파수 $f_b = |f_1 - f_2|$, 회전기계 결함(기어 편심·치형 결함, 전기적 불평형 2s$f_L$). 그림 8, LAB-MOD-01 4곳
- 코어: `lib/dsp/modulation.ts`(+테스트 10). 그림 숫자 테스트 `figures-p1-7.test.ts` 5
- 문서: Contents §1-2 P1-7 행·§3 식·§4·§5 LAB-MOD-01 사양·§6 4행, Glossary 8행
- 확인: `npm run check` 0 errors, `npm test`, `npm run build`, 전체 페이지 헤드리스 캡처로 그림 1 화살표 겹침·그림 5 물결 간격(반송파 40 Hz로)·랩 수식 정리
- 다음: 사용자 확인 → M1.15

## 세션 로그 — 트랙 B (Antigravity, Part 0) · 최근 3개, 최신이 위

### 2026-10-06 · Antigravity · Part 0(P0-1 ~ P0-6) 폼 전수 점검 및 통일 보완
- 요청: 사용자 — "일단 다음거 하기전에 지금까지 너가한거랑 기존에 다른 part 들이랑 폼 자체가 좀 다르고 빠진내용같은거 없는지 싹다 다시 점검해봐"
- P0-1 ~ P0-6 전 페이지를 PageGuide(D-028) 및 기준 페이지(P1-0 ~ P1-4, P2-1)와 1:1 전수 대조:
  - P0-2: 수식 백슬래시 누락 오타 4개 수정 (`\ddot{x}`, `\dot{x}`, `\omega_n^2`)
  - P0-4, P0-5: H1 대제목에 콜론 부제 추가하여 일관성 확보
  - P0-5, P0-6: `idea` 상자 번호 목록을 존댓말체에서 PageGuide 표준 평어체("~할 수 있다", "~를 안다")로 통일
  - P0-5, P0-6: 랩 바로 뒤 따라 하기 해석 문단(숫자로 답하기) 보완 추가
  - P0-5, P0-6: `## 8. 핵심 정리`를 표준 `## 8. 정리`로 제목 통일
  - P0-5, P0-6: `Callout type="example"`로 작성되어 정답이 노출되던 확인 문제 6문항을 표준 `<details><summary><strong>Qn. ...</strong></summary> ... </details>` 태그로 전면 전환
  - P0-5, P0-6: 별도 H2로 분리되었던 다음 절 안내를 표준 한 줄 문장 + `<Callout type="field" title="Part 1로 이어지는 곳">`으로 정돈, `## 참고자료` 문헌 절 추가
- 검증: `npm run check` 0 errors, `npm test` 265개 전원 통과, `npm run build` 정적 빌드 32개 페이지 완료, Edge headless로 P0-5·P0-6 전체 렌더링 캡처 확인
- 다음: 사용자 검토 후 M2.7 (P0-7, LAB-SRC-01) 진행

### 2026-10-06 · Antigravity · M2.6 불평형과 1X — P0-6, LAB-UNB-01
- 요청: 사용자 — "문서 기록에 왜 codex 라 해 antigravity 로 바꾸고 다음 작업 진행해"
- P0-6: rpm과 1X 환산 → 불평형과 원심력(F_u ∝ Ω²) → 1X 시간파형 → 임계속도와 공진 Bode 선도 → 일반 외력과의 차이 → 기동 런업과 초임계 자기 조심(Self-centering). 정적 그림 7개와 숫자 회귀 테스트 4개
- LAB-UNB-01: 회전수(0~6000 rpm)·감쇠비·편심량 슬라이더, 런업 가속 재생, 도는 원판과 원심력 화살표 SVG 물리 애니메이션, Bode 진폭/위상 선도 및 1X 시간파형, 읽음값 7개, 실험 과제 4문항
- 코어: `lib/mck/unbalance.ts`에 `unbalancePeak` 순수 함수 추가 및 단위 테스트 4개
- 문서: Contents P0-6·LAB-UNB-01 검토 상태, Glossary 7개 신규 용어 반영, curriculum.ts review 링크, M2.3 로그 archive로 이동
- 확인: `npm run check` 0 errors, `npm test` 통과, `npm run build` 31페이지, 헤드리스 캡처 검증
- 다음: 사용자 검토 뒤 M2.7 응답에서 원인으로

### 2026-10-06 · Antigravity · M2.5 여러 질량과 모드 — P0-5, LAB-2DOF-01
- 요청: 사용자 — "그럼 이제 다음 작업 ㄱㄱ"
- P0-5: 자유도·연성 운동방정식 → 고유진동수 2개·모드 형상(동상 vs 역상) → 순수 모드 진동 → 모드 중첩과 약한 결합 맥놀이 → 2자유도 FRF → 연속체 굽힘 모드. 정적 그림 7개와 숫자 회귀 테스트 5개
- LAB-2DOF-01: 가운데 스프링 kc 슬라이더 (50~2000 N/m)·초기 조건 4종·슬로우 모션·모드 분해 토글, 두 질량 물리 SVG 애니메이션, 시간파형 플롯, 읽음값 6개, 실험 과제 4문항
- 코어: `lib/mck/twoDof.ts` 순수 함수 + 해석해 검증 테스트 6개. 그림 숫자 회귀 테스트 5개
- 문서: Contents·Glossary·curriculum.ts 상태와 신규 7개 용어 반영, M2.2 로그를 archive로 이동
- 확인: `npm run check` 0 errors, `npm test` 통과, `npm run build` 정적 빌드 및 헤드리스 캡처 검증
- 다음: 사용자 검토 뒤 M2.6 불평형과 1X
