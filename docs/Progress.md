# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 **자기 트랙 절** 맨 위에 추가하고 트랙마다 최근 3개만 남긴다 (나머지는 `archive/SessionLog.md`, D-020·D-029).
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6). 모든 작업은 `main`에서 한다 (D-019).
> **2026-10-06부터 두 트랙이 나란히 간다 (D-029)**: 트랙 A = Claude가 Part 1(M1), 트랙 B = Codex가 Part 0(M2). 자기 트랙의 행·절만 고친다.

## 트랙 현황

| 트랙 | 범위 | 담당 | 작업 폴더 | 진행 | 지금 세부 | 상태 |
|---|---|---|---|---|---|---|
| **A** | M1 신호처리 기초 (Part 1) | Claude | `진동공부` | 15 / 18 | M1.12 TSA 완료 → 다음 **M1.13** 스케일링·단위 (P1-6) | 대기 (사용자 확인 뒤) |
| **B** | M2 진동의 기초 (Part 0) | Codex | `진동공부-Codex` (worktree) | 1 / 9 | **M2.1** `lib/mck` + P0-1 · LAB-MCK-01 | 대기 — 시작 가능 |

- 사이트: https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포)
- 사용자 확인 대기: **P1-5 TSA 절** (M1.12, §6: 그림 9 ~ 12, LAB-AVG-02 두 곳), Part 0 페이지(M2.1부터 차례로)

## 핸드오프 — 공통

- **작성 기준은 `docs/PageGuide.md`** (D-028, 기준 페이지 P1-0 ~ P1-4). 개념 척추는 `Contents.md` §1-2. 핵심: 앞 페이지까지 나온 개념만, 개념마다 그림(`Figure`), 강조 상자는 `Callout` 6종, 랩 앞 따라 하기·뒤 해석, **코드 블록·아스키 도표 금지**, 정리는 표.
- **커리큘럼 번호 (D-027, 2026-10-02)**: Part 0 = 진동 입문(P0-1 ~ P0-7), 회전체 동역학 = Part 4(P4-1 ~ P4-3), 옛 Part 4~9 → 5~10. M5 = Part 4, M6 ~ M11 = Part 5 ~ 10. 대응표는 D-027.
- **함정**: `texNumber`/`formatNumber` 둘째 인자는 유효숫자. 이론상 0인 값은 0으로 정리(hydration). MDX 함정은 PageGuide §8. Node·gh는 시스템 PATH에 있으므로 `npm …`을 앞붙임 없이 바로 실행한다 (앞붙임이 있으면 허용 규칙에 안 걸려 승인 창이 뜬다, 2026-10-06). 다만 Node 설치 전부터 켜 둔 VS Code·에이전트 세션은 옛 PATH를 물려받아 `npm`을 못 찾는다 → 그 창을 다시 시작한다 (Git Bash는 `~/.bashrc`가 빠진 Node 경로를 보충한다). Python은 없다.
- **공용 코어를 고쳤을 때**는 아래 자기 트랙 핸드오프에 적는다 (D-029). 최근 변경: 2026-10-06 Claude — `lib/figure.ts`·`Figure.astro`에 도식 기능(`frame: false`, `line`·`spring`·`damper`·`ground`·`circle`, `squareYRange`, `FIG_LAYOUT`). 기존 그림은 그대로. 2026-10-06 Claude — `components/ui/Plot.tsx`가 `'var(--plot-1)'` 같은 CSS 변수 색을 실제 색으로 풀어 준다 (전에는 Plotly가 무시해 기본색으로 그려졌다. 이 색을 쓰던 랩은 없었음). `lib/dsp/signal.ts`에 성분 `impulses`(감쇠 임펄스열) 추가.

## 핸드오프 — 트랙 A (Claude, Part 1)

- **방금 끝냄 (M1.12)**: `lib/dsp/tsa.ts`(`synchronousAverage`·`tsaGain`·`removeOrders`, 테스트 9), 신호 `src/lib/gearbox.ts`(그림·랩 공용), `TsaLab.tsx`(LAB-AVG-02), P1-5 §6 TSA(그림 9 ~ 12) — 고르기·정리 표·확인 문제 Q6·Q7. 옛 §6 ~ §8은 §7 ~ §9로 밀림 (§1 ~ §5 번호는 그대로).
- **다음**: 사용자 확인 → M1.13 스케일링·단위(P1-6: LAB-SPC-01·02, LAB-UNIT-01) → M1.14 변조(P1-7) → M1.15 측정 설정 종합·샌드박스(P1-8, 홈).
- 그림: dB 스펙트럼은 선 + 점. 그림 숫자 회귀 테스트 예: `src/figures/figures-p1-4-5.test.ts`. 같은 랩을 여러 곳에 둘 때는 props로 시작 상태 + `client:visible` (`AveragingLab`).
- **P1-0은 트랙 B 소유** (M2.2·M2.8). 고칠 일이 생기면 트랙 B 핸드오프에 요청으로 남긴다.

## 핸드오프 — 트랙 B (Codex, Part 0)

- **작업 폴더**: `C:\Users\AX\Desktop\ATG\업무\진동공부-Codex` (Codex가 2026-10-06에 만든 기존 git worktree, detached HEAD). 기본 폴더 `진동공부`는 트랙 A가 쓰므로 들어가지 않는다.
- **push 전 커밋 있음 (2026-10-06 기준)**: `00acf62` "[M1.T2] fix: 홈 문구와 커리큘럼 상태 정리"는 `fdf7a23` 위에 있다. `origin/main`은 그 뒤 `1a72540`(M2.0)으로 나아갔지만 고친 파일이 겹치지 않으므로 `git fetch origin` → `git rebase origin/main` → 검사 → `git push origin HEAD:main`이면 된다. 이 폴더의 `node_modules`는 I-024 사고 뒤 복구했다 (테스트 144 통과).
- **시작할 때마다**: `git fetch origin` → `git rebase origin/main` (로컬 커밋이 없으면 `git checkout --detach origin/main`). **push**: 검사 통과 후 `git push origin HEAD:main`. 거절되면 다시 fetch·rebase.
- **먼저 읽을 것**: `AGENTS.md` → `docs/PageGuide.md`(특히 §5-4 도식, §6-4 랩, §10 Part 0 특기 사항) → `Roadmap.md` §6-4(M2 표) → `Curriculum.md` Part 0 → `Contents.md` §1-2 Part 0 척추, §5 LAB-MCK-01 ~ LAB-SRC-01, §6 기준값(고유진동수 ~ 불평형 응답 행) → D-027, D-029.
- **첫 작업 M2.1** (제안 구성, 바꿔도 됨)
  - `src/lib/mck/` — 예: `sdof.ts`(ω_n·f_n·ζ·ω_d·대수감쇠율, 자유 응답: 비감쇠·부족·임계·과감쇠), `forced.ts`(정상상태 진폭비·위상, 과도 + 정상상태 시간 응답), `twoDof.ts`(고유진동수·모드 형상), `unbalance.ts`(불평형 응답) + 각 `*.test.ts`. 순수 함수, 내부 SI, `Contents.md` §6 값으로 검증.
  - `src/figures/p0-1.ts`(도식은 `src/figures/dev-schematic.ts` 견본 참고, id `fig-p0-1-{n}`) → `src/pages/dev/figures.mdx`에 등록
  - `src/pages/p0-1.mdx`, 랩 `src/components/labs/MassSpringLab.tsx`(LAB-MCK-01 기본: 당기는 거리, 재생/정지, 끝점·평형점. 첫 렌더는 정지 상태, 애니메이션은 `useEffect` 안 `requestAnimationFrame`)
  - `src/data/curriculum.ts`의 P0-1 `href: '/p0-1/'`·`status: 'review'`, `Contents.md` §4 P0-1 행, `Glossary.md`(Part 0 용어는 표 맨 위, P1-0 행들 앞에)
  - 커밋 예: `[M2.1] feat: 질량-스프링 계산 코어(lib/mck)와 P0-1 진동이란`
- **고치지 않는 것**: `src/pages/p1-1 ~ p1-8.mdx`, `src/figures/p1-*.ts`, `src/lib/dsp/`(읽기·import는 자유), Part 1 랩, `docs/Progress.md`의 트랙 A 행·절.
- **P1-0**: M2.2(LAB-BAS-01 이동)부터 트랙 B 소유.

## 큰 마일스톤 현황

| M | 범위 | 상태 | 세부 진행 | 완료일 |
|---|---|---|---|---|
| M0 | 기반 구축 | **완료** | 5 / 5 | 2026-10-02 |
| M1 | 신호처리 기초 (Part 1) · 트랙 A | 진행 중 | 15 / 18 | — |
| M2 | 진동의 기초 (Part 0) · 트랙 B | 진행 중 | 1 / 9 | — |
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
| M1.13 | 스케일링 · 단위 (LAB-SPC-01, 02, LAB-UNIT-01) | 대기 | Claude | — | — |
| M1.14 | 변조 · 맥놀이 (LAB-MOD-01) | 대기 | Claude | — | — |
| M1.15 | 측정 설정 종합 · 샌드박스 (LAB-SBX-01) | 대기 | Claude | — | — |

## 세부 마일스톤 현황 — M2 진동의 기초 (Part 0) · 트랙 B

| 세부 | 내용 | 상태 | 담당 | 커밋 | 완료일 |
|---|---|---|---|---|---|
| M2.0 | Part 0 착수 준비 (지침서 D-028, 도식 그림, 병렬 트랙 D-029, worktree) | **완료** | Claude | main | 2026-10-06 |
| M2.1 | 질량-스프링 계산 코어 `lib/mck` + 진동이란 (P0-1, LAB-MCK-01 기본) | 대기 — 시작 가능 | Codex | — | — |
| M2.2 | 고유진동수 (P0-2, LAB-MCK-01 확장, LAB-BAS-01 이동) | 대기 | Codex | — | — |
| M2.3 | 감쇠 (P0-3, LAB-DAMP-01) | 대기 | Codex | — | — |
| M2.4 | 강제진동과 공진 (P0-4, LAB-FRC-01) | 대기 | Codex | — | — |
| M2.5 | 여러 질량과 모드 (P0-5, LAB-2DOF-01) | 대기 | Codex | — | — |
| M2.6 | 불평형과 1X (P0-6, LAB-UNB-01) | 대기 | Codex | — | — |
| M2.7 | 응답에서 원인으로 (P0-7, LAB-SRC-01) | 대기 | Codex | — | — |
| M2.8 | P1-0 정리 | 대기 | Codex | — | — |

## 완료된 큰 마일스톤

### M0 기반 구축 (2026-10-02 완료)

| 세부 | 내용 | 담당 | 커밋 |
|---|---|---|---|
| M0.1 | 문서 체계 · 상세 커리큘럼 초안 | Claude | `b2a4e16` (M0.2에 포함) |
| M0.2 | 저장소 연결 · 초기 커밋 | Claude | `b2a4e16` |
| M0.3 | 사이트 골격 | Claude | `ce07ee2` (PR #1, 병합 `e7b620c`) |
| M0.4 | 수식 · 플롯 검증 | Claude | `3f1f019`, 수정 `850bc52` (I-017) |
| M0.5 | 테스트 · CI · 배포 | Claude(1~2단계) · 사용자(3~5단계) | `3a15123`, `f98e472`, `ca771c1` |

**회고**
- 잘된 점
  - 문서 체계(Decisions·Issues·Progress) 덕분에 계획 변경(커리큘럼 재구성, 2단계 마일스톤, main 단일 브랜치)을 근거와 함께 추적할 수 있었다.
  - 헤드리스 Edge 캡처로 화면을 직접 확인하는 방법이 생겼다 → 사용자 제보(I-017) 재현·검증에 바로 쓰였다.
  - CI가 첫 실행에서 빈 워크플로 파일 커밋을 바로 잡아냈다. 이제 검사·테스트를 통과하지 못한 코드는 배포되지 않는다.
- 바꿀 점
  - 처음의 브랜치·PR 흐름은 혼자 쓰는 저장소에 과했다 → D-019로 정리.
  - 에이전트 작업(설치·검사)이 사용자의 실행 중인 개발 서버를 깨뜨릴 수 있었다 (I-017). 환경을 공유한다는 점을 늘 의식한다.
  - push 후 Actions 결과 확인을 습관으로 한다 (AGENTS.md §4에 반영).

## 세션 로그 — 트랙 A (Claude, Part 1) · 최근 3개, 최신이 위

> 트랙마다 4번째부터는 `docs/archive/SessionLog.md` 맨 위로 옮긴다 (D-020, D-029). 트랙 B 세션 로그는 이 파일 맨 아래.

### 2026-10-06 · Claude · M1.12 TSA — P1-5 §6, LAB-AVG-02
- 요청: 사용자 — "P1-0 ~ P1-4 개편은 마음에 든다. P1-5는 아직 더 해야 하지? 다음 작업 진행해 봐." (같은 세션에서 M2.0 트랙 B 기반을 먼저 push)
- 한 일
  - 계산: `lib/dsp/tsa.ts` — `synchronousAverage`(한 바퀴씩 같은 각도 평균), `tsaGain`(빗살 통과 특성 ∣H∣, 큰 ρ·M에서도 정밀하게 정수 부분을 뺀 뒤 계산), `removeOrders`(지정 차수 제거 → Residual). `signal.ts`에 감쇠 임펄스열 성분 `impulses`. 테스트 9개(동기 이득 1, 비동기 = 해석해, 잡음 σ/√M, Residual, 임펄스)
  - 신호: `src/lib/gearbox.ts` — 축 A 20 Hz·이빨 15개(맞물림 15차·30차·1X), 120° 이빨 결함 충격, 축 B 성분 13.4배, 잡음. 그림과 랩이 같은 신호·시드
  - 랩 LAB-AVG-02 `TsaLab.tsx`: 센서 신호 + 키페이저, TSA(또는 Residual) vs 각도 + 참값, 차수 스펙트럼(한 바퀴 vs TSA), 읽음값(측정 시간, 축 B가 남은 비율, 남은 잡음, 15차 진폭), 과제 4
  - P1-5 §6 TSA 새로 씀: 6.1 축이 여러 개 도는 기계(기어 맞물림 주파수 풀이) · 6.2 같은 각도끼리 평균 · 6.3 빗살 모양(숫자 예 13.4 vs 13.05) · 6.4 Residual로 결함 각도 찾기. 그림 9 ~ 12, 랩 두 곳, 주의·현장 상자, 고르기·정리 표에 TSA 행, 확인 문제 Q6·Q7. 제목 "평균화와 TSA", 다 읽으면 목록 5개로 정리
  - 공용 코어: `Plot.tsx`가 `var(--…)` 색을 실제 색으로 풀도록 (Plotly는 CSS 변수를 몰라 기본색으로 그렸다). PageGuide §6-4에 색 지정 요령
  - 그림 숫자 회귀 테스트 3개(`figures-p1-4-5.test.ts`: 참값과의 차이 1.04 → 0.45 → 0.10, ∣H∣ 1/16·0.235·0.059, Residual 울림 > 6 × 잡음)
  - 문서: Contents §1-2 P1-5 행·§3 신호 성분·§4·§5 LAB-AVG-02·§6 TSA 행 5개, Glossary 용어 6개(기어 상자, 맞물림 주파수, 빗살 통과 특성, 차수 스펙트럼, Residual, 각도 재샘플링), Issues I-023
  - 이 PC: Git Bash용 `~/.bashrc`·`~/.bash_profile` — Node가 PATH에 없을 때만 보충 (이 세션 셸은 Node 설치 전 환경이라 `npm`을 못 찾았다)
- 확인: `npm test` 158개, `npm run check` 0 errors, `npm run build` 21페이지. P1-5 헤드리스 캡처로 그림 9 ~ 12·랩 확인 → 그림 11 라벨이 곡선과 겹쳐 빈자리 + 화살표로, 랩의 TSA 선이 주황(계열 순서 색)·회색 막대가 파랑(var 색 무시)이던 것을 수정
- 다음: 사용자 확인 → M1.13 스케일링·단위(P1-6)

### 2026-10-02 · Claude · M1.T2 마무리 — P1-4·P1-5 개편, M1.11 완료, Part 0 재구성 계획 (D-027)
- 요청: 사용자 — "P1-3까지 너무 좋다, P1-5까지 진행하자", "아까 Part 0 구성안도 계획에 반영해 줘" (Part 0을 진동을 전혀 모르는 사람용으로, Part 1과 연결되게)
- 한 일
  - P1-4 재작성 + `src/figures/p1-4.ts` 그림 8개 (프레임 반복, 누설, Hann 곱하기, Uniform vs Hann dB, 가리비 곡선, 메인로브·사이드로브, 동적 범위 −70 dB, w·w² 평균). 과장·이모지 인용문 제거, 뒤 개념은 한 줄 풀이 + 위치
  - 윈도우 랩 보완: LAB-WIN-01(1초 프레임 전체, dB 보기, "10 bin 떨어진 곳 dB" 읽음값 — 예전 "±1 bin 밖 누설 %"는 Flat top 메인로브를 누설로 셈), LAB-WIN-02(본문 윈도우 5종, 읽음값 = 메인로브 반폭·사이드로브·가리비 손실), LAB-WIN-03(라벨·과제)
  - P1-5 재작성 + `src/figures/p1-5.ts` 그림 8개 (들쭉날쭉한 바닥, 파워 평균 M별, 높이 vs 흔들림, 화살표 평균, 파워 vs 벡터 평균, 지수 평균 추적, 런업 피크 홀드, 오버랩 배치). LAB-AVG-01 연결: 시작 상태 props + `client:visible`로 4곳, 70 Hz 성분 추가(파워 평균으로 드러나는 성분 vs 벡터 평균으로만 드러나는 성분)
  - 그림 숫자 테스트 `src/figures/figures-p1-4-5.test.ts` 5개, `random.test.ts` 시간 초과 원인(표본마다 expect) 수정
  - Part 0 재구성 계획 (하위 에이전트): D-027, Curriculum·Contents·Roadmap·curriculum.ts·본문 상호참조. 이어서 AGENTS(Part 0~10), Issues 옛 ID(I-008·I-012·I-013), D-014·D-017 상태 표시
  - 문서: Contents §3-1·§4·§5(LAB-WIN-01·02·03, LAB-AVG-01), Glossary P1-4·P1-5 항목 재정리, Issues I-005·I-007·I-011 해결·I-023 진행 기록
  - 이 PC 설정: `.claude/settings.local.json`(gitignore됨)에 반복 명령 허용 규칙
- 확인: `npm test` 141개 통과(2회 연속), `npm run check` 0 errors, `npm run build` 21페이지, P1-4·P1-5 헤드리스 캡처로 그림·랩 겹침 확인 후 수정(그림 6·8 글자 겹침, 그림 5 축, 그림 7 피크 홀드 톱니 → 프레임 100개)
- 커밋: 이 세션에서 끝내지 못한 커밋을 2026-10-06에 검사(`npm test` 141 통과, `npm run check` 0 errors, `npm run build` 21페이지) 후 `894d3f7`로 push, Actions 성공
- 다음: 사용자 확인 → M1.12 TSA

### 2026-10-02 · Claude · M1.T2 Part 1 개편 ② — P1-0 ~ P1-3 (D-026)
- 계기: M1.T 결과에 대한 사용자 피드백 — "전보단 나은데 여전히 부족하다. 체계적이지 않고, 진동을 모르는 사람은 '이게 무슨 말이야?' 하는 게 많다. 예시 그림을 넣어 달라." 이후 "조작하는 것과 텍스트·그림 비율이 안 맞는다", "Cheat Sheet가 CLI처럼 남아 있다", "P1-3까지만 우선".
- 한 일
  - 그림 체계: `src/lib/figure.ts`(+테스트 6), `Figure.astro`(정적 SVG), `Callout.astro`, `/dev/figures/` 갤러리. 그림 33개(`src/figures/p1-0 ~ p1-4.ts`, P1-0 ~ P1-3에 32개)
  - P1-0 ~ P1-3 재작성, 미니 랩 LAB-BAS-01·02, 본문 폭 통일(920px)·타이포·표·상자 디자인
  - 사실 오류 수정: 제로패딩 경계 사례(P1-1, 회귀 테스트 3), SamplingLab 접힘 이름 모순, AdcLab dBFS 잡음 바닥, 유효숫자 오용 30여 곳, "1X vs 2LF 60 Hz"(P1-3)
  - P1-4: 아스키 도표·코드 블록만 교체, hydration 오류 2건 수정
  - 문서: D-026, I-023, Contents §1 개정·랩 사양, Glossary, AGENTS §6
- 확인: `npm test` 136개 통과, `npm run check` 0 errors, `npm run build` 20페이지, Part 1 여섯 페이지 헤드리스 캡처 콘솔 오류 0, 코드 블록 0
- 다음: 사용자 확인 → P1-4·P1-5

## 세션 로그 — 트랙 B (Codex, Part 0) · 최근 3개, 최신이 위

### 2026-10-06 · Claude · M2.0 Part 0 착수 준비 — 지침서(D-028), 도식 그림, 병렬 트랙(D-029)
- 요청: 사용자 — "P1-0 ~ P1-4 개편은 마음에 든다. P1-5는 더 해야 하지? 지금까지 개편한 느낌으로 다른 작업자도 할 수 있게 지침서를 만들어 달라. Part 0은 Codex가 병렬로 할 거니 기반을 마련하고, 병렬로 해도 되면 알려 달라. 마일스톤을 따로 둬서 두 진행을 동시에 볼 수 있게."
- 한 일
  - `docs/PageGuide.md` 신설 (D-028): 독자·말투·피할 표현, 개념 순서 적용법, MDX 뼈대 견본·절의 리듬·제목·분량(P1-0 ~ P1-5 실측), 도입과 마무리, 그림(만드는 법·id·색·도식·회귀 테스트), 상자 6종 쓰임표, 따라 하기 → 랩 → 해석, 랩 컴포넌트·hydration, 수식과 숫자, MDX 함정 표, 작업 순서, Part 0 특기 사항, 체크리스트, 기준 페이지 색인. `Contents.md` §1은 개념 척추만 남기고 나머지는 PageGuide로 옮김
  - 도식 그림: `lib/figure.ts`에 `frame: false`, 주석 `line`·`spring`·`damper`·`ground`·`circle`, `squareYRange`·`springPoints`·`damperSegments`·`groundSegments`·`FIG_LAYOUT`(+테스트 4), `Figure.astro` 렌더링. 견본 `src/figures/dev-schematic.ts`(벽–스프링·감쇠기–질량, 감쇠 자유진동 x(t), 도는 원판과 불평형)를 갤러리 맨 아래에
  - 병렬 트랙 (D-029): 트랙 A(Claude, M1) ∥ 트랙 B(Codex, M2), 파일 소유·git 흐름·ID 충돌·CI 규칙. `AGENTS.md` §2·§3·§4·§6, Progress 트랙 현황 표·트랙별 핸드오프·세션 로그, Roadmap §6-4에 M2.0 ~ M2.8 산출물·완료 기준
  - 트랙 B 폴더: Codex가 이미 쓰던 worktree `진동공부-Codex`를 그대로 쓴다. 새 worktree를 만들다 대소문자만 다른 같은 폴더에서 `npm ci`가 실행되어 Codex의 `node_modules` 일부를 지웠고, `npm install`로 복구했다 (I-024)
- 확인: `npm test` 145개, `npm run check` 0 errors, `npm run build` 21페이지, 갤러리의 도식 견본 헤드리스 캡처. 커밋 `1a72540` push
- 다음: Codex가 M2.1 시작 (트랙 B 핸드오프)
