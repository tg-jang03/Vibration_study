# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 **자기 트랙 절** 맨 위에 추가하고 트랙마다 최근 3개만 남긴다 (나머지는 `archive/SessionLog.md`, D-020·D-029). 로그 1건은 10줄 이내, 이 파일은 200줄 이하 (D-030).
> 세션 시작 때는 트랙 현황·공통 핸드오프·자기 트랙 핸드오프까지만 읽으면 된다. 아래 세부 현황·세션 로그는 필요할 때만.
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6). 모든 작업은 `main`에서 한다 (D-019).
> **2026-10-06부터 두 트랙이 나란히 간다 (D-029)**: 트랙 A = Claude가 Part 1(M1), 트랙 B = Codex가 Part 0(M2). 자기 트랙의 행·절만 고친다.

## 트랙 현황

| 트랙 | 범위 | 담당 | 작업 폴더 | 진행 | 지금 세부 | 상태 |
|---|---|---|---|---|---|---|
| **A** | M1 신호처리 기초 (Part 1) | Claude | `진동공부` | 17 / 18 | **M1.15** 측정 설정 종합·샌드박스 (P1-8: LAB-SBX-01, Signal Lab) | **진행 중** (2026-10-06~) |
| **B** | M2 진동의 기초 (Part 0) | Codex | `진동공부-Codex` (worktree) | 5 / 9 | **M2.4** P0-4 · LAB-FRC-01 | **완료 — 사용자 검토** |

- 사이트: https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포)
- 사용자 확인 대기: **P1-5 TSA 절** (M1.12, §6: 그림 9 ~ 12, LAB-AVG-02 두 곳), **P1-6 스케일링·단위(M1.13)**, **P1-7 변조·맥놀이(M1.14)**, **P0-1~P0-4** (M2.1~M2.4)

## 핸드오프 — 공통

- **작성 기준은 `docs/PageGuide.md`** (D-028, 기준 페이지 P1-0 ~ P1-4). 개념 척추는 `Contents.md` §1-2. 핵심: 앞 페이지까지 나온 개념만, 개념마다 그림(`Figure`), 강조 상자는 `Callout` 6종, 랩 앞 따라 하기·뒤 해석, **코드 블록·아스키 도표 금지**, 정리는 표.
- **커리큘럼 번호 (D-027, 2026-10-02)**: Part 0 = 진동 입문(P0-1 ~ P0-7), 회전체 동역학 = Part 4(P4-1 ~ P4-3), 옛 Part 4~9 → 5~10. M5 = Part 4, M6 ~ M11 = Part 5 ~ 10. 대응표는 D-027.
- **함정**: `texNumber`/`formatNumber` 둘째 인자는 유효숫자. 이론상 0인 값은 0으로 정리(hydration). MDX 함정은 PageGuide §8. Node·gh는 시스템 PATH에 있으므로 `npm …`을 앞붙임 없이 바로 실행한다 (앞붙임이 있으면 허용 규칙에 안 걸려 승인 창이 뜬다, 2026-10-06). 다만 Node 설치 전부터 켜 둔 VS Code·에이전트 세션은 옛 PATH를 물려받아 `npm`을 못 찾는다 → 그 창을 다시 시작한다 (Git Bash는 `~/.bashrc`가 빠진 Node 경로를 보충한다). Python은 없다.
- **문서 읽기·보관 (D-030, 2026-10-06)**: 문서는 등급대로 읽는다 (`AGENTS.md` §2). 큰 문서(Contents·Curriculum·PageGuide)는 목차(`grep -n "^##"`)로 위치를 찾아 그 절만. 닫힌 이슈·대체된 결정·끝난 마일스톤 상세는 `docs/archive/`로 옮기고 평소 읽지 않는다. 새 이슈·결정 번호는 `Issues.md`·`Decisions.md` 머리의 "다음 번호".
- **공용 코어를 고쳤을 때**는 아래 자기 트랙 핸드오프에 적는다 (D-029). 최근 변경: 2026-10-06 Claude — `lib/figure.ts`·`Figure.astro`에 도식 기능(`frame: false`, `line`·`spring`·`damper`·`ground`·`circle`, `squareYRange`, `FIG_LAYOUT`). 기존 그림은 그대로. 2026-10-06 Claude — `components/ui/Plot.tsx`가 `'var(--plot-1)'` 같은 CSS 변수 색을 실제 색으로 풀어 준다 (전에는 Plotly가 무시해 기본색으로 그려졌다. 이 색을 쓰던 랩은 없었음). `lib/dsp/signal.ts`에 성분 `impulses`(감쇠 임펄스열) 추가.

## 핸드오프 — 트랙 A (Claude, Part 1)

- **방금 끝냄 (M1.14)**: P1-7 변조·측대역·맥놀이 — 그림 8(`src/figures/p1-7.ts`), 랩 LAB-MOD-01 `ModulationLab`(4곳, `initialMode`). 신호 `signal.ts`에 `modulated`(AM·FM·AM + FM) 추가, 이론 `lib/dsp/modulation.ts`(베셀 함수, 측대역 ∣cₙ∣, 맥놀이 포락선), 공용 `lib/modulationDemo.ts`.
- **다음**: 사용자 확인 → M1.15 측정 설정 종합·샌드박스(P1-8, LAB-SBX-01, 홈 지도 갱신). 사양은 Contents §5 LAB-SBX-01이 "M1.15 시작 시 작성"이라 먼저 쓴다. P1-8은 Curriculum 1-8의 목적별 설정표(I-014: 관례값 출처 표시)를 다룬다.
- 화면 확인 요령: 앱 브라우저 창이 숨겨져 있으면 `client:visible` 랩이 깨어나지 않는다. 헤드리스 Edge를 `--window-size=1100,23500`으로 전체 페이지를 한 번에 찍고, PowerShell `System.Drawing`으로 1500px씩 잘라 본다 (앵커 캡처는 랩 계산 중이면 빈 화면).
- 그림: dB 스펙트럼은 선 + 점. 그림 숫자 회귀 테스트 예: `src/figures/figures-p1-4-5.test.ts`. 같은 랩을 여러 곳에 둘 때는 props로 시작 상태 + `client:visible` (`AveragingLab`).
- **P1-0은 트랙 B 소유** (M2.2·M2.8). 고칠 일이 생기면 트랙 B 핸드오프에 요청으로 남긴다.

## 핸드오프 — 트랙 B (Codex, Part 0)

- **작업 폴더**: `C:\Users\AX\Desktop\ATG\업무\진동공부-Codex` (Codex가 2026-10-06에 만든 기존 git worktree, detached HEAD). 기본 폴더 `진동공부`는 트랙 A가 쓰므로 들어가지 않는다.
- **시작할 때마다**: `git fetch origin` → `git rebase origin/main` (로컬 커밋이 없으면 `git checkout --detach origin/main`). **push**: 검사 통과 후 `git push origin HEAD:main`. 거절되면 다시 fetch·rebase.
- **먼저 읽을 것**: `AGENTS.md` → `docs/PageGuide.md`(특히 §5-4 도식, §6-4 랩, §10 Part 0 특기 사항) → `Roadmap.md` §6-4(M2 표) → `Curriculum.md` Part 0 → `Contents.md` §1-2 Part 0 척추, §5 LAB-MCK-01 ~ LAB-SRC-01, §6 기준값(고유진동수 ~ 불평형 응답 행) → D-027, D-029.
- **M2.4 완료**: P0-4 본문(9절)·정적 그림 7개, LAB-FRC-01(가진 주파수·ζ·시간파형 선택, r·진폭비·위상·봉우리 읽음값, Bode 플롯 연동), `forced.ts`에 `resonancePeak`·`halfPowerPoints` 추가 및 테스트 10개.
- **다음은 사용자 확인 뒤 M2.5**: P0-5 여러 질량과 모드(P0-5, LAB-2DOF-01: 2자유도 모드, m₁=m₂, k_c, 모드 형상 [1, 1], [1, -1]). `lib/mck/twoDof.ts`를 사용한다.
- 이 Codex 실행 셸에서는 Node가 PATH에 없을 때가 있었다. 그 경우 검사 명령 앞에 현재 프로세스용으로 `$env:Path = 'C:\Program Files\nodejs;' + $env:Path`를 붙이면 된다.
- **고치지 않는 것**: `src/pages/p1-1 ~ p1-8.mdx`, `src/figures/p1-*.ts`, `src/lib/dsp/`(읽기·import는 자유), Part 1 랩, `docs/Progress.md`의 트랙 A 행·절.
- **P1-0**: M2.2(LAB-BAS-01 이동)부터 트랙 B 소유.

## 큰 마일스톤 현황

| M | 범위 | 상태 | 세부 진행 | 완료일 |
|---|---|---|---|---|
| M0 | 기반 구축 | **완료** | 5 / 5 | 2026-10-02 |
| M1 | 신호처리 기초 (Part 1) · 트랙 A | 진행 중 | 17 / 18 | — |
| M2 | 진동의 기초 (Part 0) · 트랙 B | 진행 중 | 5 / 9 | — |
| M3 | 센서와 측정 체인 (Part 2) | 대기 | 0 / 4 | — |
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
| M1.15 | 측정 설정 종합 · 샌드박스 (LAB-SBX-01) | **진행 중** | Claude | — | — |

## 세부 마일스톤 현황 — M2 진동의 기초 (Part 0) · 트랙 B

| 세부 | 내용 | 상태 | 담당 | 커밋 | 완료일 |
|---|---|---|---|---|---|
| M2.0 | Part 0 착수 준비 (지침서 D-028, 도식 그림, 병렬 트랙 D-029, worktree) | **완료** | Claude | main | 2026-10-06 |
| M2.1 | 질량-스프링 계산 코어 `lib/mck` + 진동이란 (P0-1, LAB-MCK-01 기본) | **완료** (사용자 검토 대기) | Codex | main | 2026-10-06 |
| M2.2 | 고유진동수 (P0-2, LAB-MCK-01 확장, LAB-BAS-01 이동) | **완료** (사용자 검토 대기) | Codex | main | 2026-10-06 |
| M2.3 | 감쇠 (P0-3, LAB-DAMP-01) | **완료** (사용자 검토 대기) | Codex | main | 2026-10-06 |
| M2.4 | 강제진동과 공진 (P0-4, LAB-FRC-01) | **완료** (사용자 검토 대기) | Codex / Antigravity | main | 2026-10-06 |
| M2.5 | 여러 질량과 모드 (P0-5, LAB-2DOF-01) | 대기 | Codex | — | — |
| M2.6 | 불평형과 1X (P0-6, LAB-UNB-01) | 대기 | Codex | — | — |
| M2.7 | 응답에서 원인으로 (P0-7, LAB-SRC-01) | 대기 | Codex | — | — |
| M2.8 | P1-0 정리 | 대기 | Codex | — | — |

## 완료된 큰 마일스톤

- **M0 기반 구축** (2026-10-02) — 세부 표·커밋·회고는 `archive/Milestones.md`

## 세션 로그 — 트랙 A (Claude, Part 1) · 최근 3개, 최신이 위

> 트랙마다 4번째부터는 `docs/archive/SessionLog.md` 맨 위로 옮긴다 (D-020, D-029). 트랙 B 세션 로그는 이 파일 맨 아래.

### 2026-10-06 · Claude · M1.14 변조·맥놀이 — P1-7
- 요청: 사용자 — "일단 다음 작업 진행해"
- 한 일: P1-7 본문(7절, 302줄) — AM 파형·포락선, 측대역 f_c ± f_m(높이 m/2), 간격이 원인 축을 가리킴(기어 두 축), 짧은 변조 → 여러 쌍, FM·β·베셀, AM + FM 비대칭, 맥놀이와 AM 구별. 그림 8, 랩 1종 4곳
- 코어: `signal.ts` `modulated` 성분, `lib/dsp/modulation.ts`(+테스트 12), `lib/modulationDemo.ts`. 그림 숫자 테스트 `figures-p1-7.test.ts` 5
- 문서: Contents §1-2·§3 신호 성분·§4·§5 LAB-MOD-01(예시를 기어·회전수·이웃 기계로 조정)·§6 3행, Glossary 9행 + 측대역 행 갱신
- 확인: `npm run check` 0 errors, `npm test`, `npm run build`, 전체 페이지 헤드리스 캡처로 그림 1 화살표 겹침·그림 5 물결 간격(반송파 40 Hz로)·랩 수식 정리
- 다음: 사용자 확인 → M1.15

### 2026-10-06 · Claude · M1.13 스케일링·단위 — P1-6
- 요청: 사용자 — "넌 다음 작업 진행해"
- 한 일: P1-6 본문(9절, 371줄) — 라인 수와 잡음 바닥, bin = Δf 폭의 바구니, PSD·ASD, 대역 RMS와 ENBW, √2 × RMS vs 진짜 Peak, 단위 관례·환산, dB와 기준값. 그림 7, 랩 3종(4곳)
- 코어: `lib/dsp/scaling.ts`(+테스트 10), `lib/units.ts`(+테스트 7), `lib/scalingDemo.ts`. 그림 숫자 테스트 `figures-p1-6.test.ts` 6
- 문서: Contents §1-2 P1-6 행·§3 식(ASD·대역 RMS·derived peak)·§4·§5(LAB-SPC-02는 Peak 표기·dB 중심으로 사양 조정)·§6 기준값 4행, Glossary 12행, I-006 진행 기록
- 확인: `npm run check` 0 errors, `npm test`, `npm run build`, 전체 페이지 헤드리스 캡처로 그림 라벨 겹침(그림 1·2·3·4)·랩 축 눈금·1X bin 어긋남(충격 신호 30 → 25 Hz) 수정
- 다음: 사용자 확인 → M1.14

### 2026-10-06 · Claude · 문서 최신화와 보관 규칙 (D-030)
- 요청: 사용자 — "문서 최신화 안 된 것들 다 업데이트하고, 토큰 절약할 수 있도록 안 읽어도 되거나 old 한 것들은 archive에 보관하는 지침을 만들고 진행하자." (앞서 승인 창이 잦은 원인 — PATH 앞붙임·exact 허용 규칙 — 도 정리)
- 한 일: D-030(문서 3등급, 보관 규칙, 크기 규칙, D-001 대체). `archive/Issues.md`(해결·종결 15건 + I-023 처리 기록), `archive/Decisions.md`(D-001·013·016·024), `archive/Milestones.md`(M0 표·회고, M1.2 산출물, M1.2·M1.11 코어 메모). AGENTS §2 등급표·§3 절차·§5 크기 규칙(§6 중복 요약 압축)
- 최신화: Roadmap §4-2 실제 디렉터리·M1 세부 수 18, Contents 신호 성분(chirp·impulses)·§3-1 규약 요약·§4 P1-1 ~ P1-4 완료(2026-10-06 사용자 확인, `curriculum.ts` done), Contents·Curriculum 머리에 "읽는 법"
- 결과: Issues 30 → 7 KB, Issues·Decisions·Progress·Roadmap·Contents 합계 175 → 149 KB(−15 %). 세션 시작 때 읽는 양은 Progress 앞부분 + 필요한 절만
- 테스트: `curriculum.test.ts`가 "Part 1 공개 페이지는 모두 검토"를 고정해 상태가 바뀌면 깨졌다 → 규칙 검사(공개 = 검토·완료, 미공개 = 계획, P1-1 ~ P1-4 완료)로
- 확인: `npm run check` 0 errors, `npm test` 179개, `npm run build` 22페이지
- 다음: `제안` 상태 결정들의 확정 여부 사용자 확인 → M1.13

## 세션 로그 — 트랙 B (Codex, Part 0) · 최근 3개, 최신이 위

### 2026-10-06 · Codex · M2.4 강제진동과 공진 — P0-4, LAB-FRC-01
- 요청: 사용자 — M2.4 강제진동과 공진 이어서 진행
- P0-4: 가진력·운동방정식 → 과도 vs 정상상태 → 진동수비와 세 구간 → 공진과 Q·Half-power 폭 → FRF와 Bode 선도 → 맥놀이. 정적 그림 7개와 숫자 회귀 테스트 4개
- LAB-FRC-01: 가진 주파수 f (0~15 Hz)·감쇠비 ζ·[과도 포함/정상상태만] 선택, 힘/변위 시간파형, 진폭비·위상 곡선 위 현재 점 표시, 읽음값 7개
- 코어: `lib/mck/forced.ts`에 `resonancePeak`, `halfPowerPoints` 순수 함수 추가 및 테스트 10개
- 문서: Contents P0-4·LAB-FRC-01 검토 상태, Glossary 12개 신규 용어 반영, curriculum.ts review 링크, M2.1 로그 archive로 이동
- 확인: `npm run check` 0 errors, `npm test` 216개, `npm run build` 26페이지, 헤드리스 캡처 확인
- 다음: 사용자 검토 뒤 M2.5 여러 질량과 모드

### 2026-10-06 · Codex · M2.3 감쇠와 LAB-DAMP-01
- 요청: 사용자 — 다음 작업 진행
- P0-3: 감쇠력·운동방정식 → 감쇠비와 부족/임계/과감쇠 → 포락선 → 감쇠 고유진동수 → 대수감쇠율. 정적 그림 6개와 수치 회귀 테스트 2개
- LAB-DAMP-01: ζ·fₙ·x₀, 포락선·같은 방향 피크 토글, ω_d/ω_n·피크 비·δ·ζ 추정·반감 주기. ζ ≥ 1 비진동 해와 해당 없음 표시
- 문서: Contents·Glossary·curriculum.ts 상태와 최초 용어 위치 갱신, M2.0 로그를 archive로 이동
- 확인: 최신 main(M1.13 포함)에서 `npm run check` 0 errors, `npm test` 206개, `npm run build` 25페이지, P0-3 전체 헤드리스 캡처 정상
- 다음: 사용자 검토 뒤 M2.4 강제진동과 공진

### 2026-10-06 · Codex · M2.2 고유진동수와 질량-스프링 확장
- 요청: 사용자 — 다음 세부 마일스톤 진행
- P0-2: 운동방정식 → 정현파 세 숫자 → 고유진동수 → 진폭·초기조건 → x/v/a → 정적 처짐. 정적 그림 7개와 숫자 회귀 테스트 2개
- LAB-MCK-01: P0-1 기본 모드를 유지하며 P0-2 확장 모드(m·k·x₀·v₀, x/v/a 선택, fₙ·T·A·현재 상태 읽음값) 추가
- LAB-BAS-01: P1-0에서 P0-2로 이동하고 P1-0에는 `withBase()` 위치 안내 링크만 남김
- 문서: Curriculum·Contents·Glossary·curriculum.ts 상태와 최초 용어 위치 갱신
- 확인: `npm run check` 0 errors, `npm test` 181개, `npm run build` 23페이지, P0-2 헤드리스 상단 캡처에서 그림·첫 랩 정렬 확인
- 다음: 사용자 검토 뒤 M2.3 감쇠
