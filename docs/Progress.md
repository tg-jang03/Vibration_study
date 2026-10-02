# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 최신 항목을 맨 위에 추가하고 최근 3개만 남긴다 (나머지는 `archive/SessionLog.md`, D-020).
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6). 모든 작업은 `main`에서 한다 (D-019).

## 현재 상태

| 항목 | 값 |
|---|---|
| 큰 마일스톤 | M1 신호처리 기초 (Part 1) — 9 / 16 (M1.0 추가) |
| 세부 마일스톤 | **M1.10 윈도우 페이지(P1-4) 본문 작성 완료 → 사용자 검토 대기** (D-024). 확인 후 LAB-WIN-01~03 랩 구현 예정 |
| 담당 | Antigravity |
| 사이트 | https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포) |
| 사용자 확인 대기 | **P1-4 윈도우 본문 (D-024)**, **P1-0·P1-1 본문 (D-024)**, `Curriculum.md` 전체, `Roadmap.md` §6-3 M1 세부 목록, `Decisions.md`의 `제안` 항목 (특히 D-007 기술 스택, D-015 문서 추가), I-009 규격 인용 정책 |

## 핸드오프 (다음 작업자에게)

- **[중요] 페이지 작성 기준 변경 (D-024, 2026-10-02)**: 모든 새 페이지는 `docs/Contents.md` §1을 따른다 — **본문 먼저 → 사용자 확인(상태 `검토`/`review`) → 랩**. 맨 위 선수 개념 표, 새 용어는 정의 + 숫자 예 + `docs/Glossary.md` 등록, 뒤 페이지 개념은 쓰지 않기, 랩마다 할 일 → 화면 읽는 법 → 따라 하기 → 무엇을 봤나, push 전 체크리스트. 예시: `src/pages/p1-0.mdx`, `p1-1.mdx`, `p1-4.mdx`.
- **진행 상황**:
  - `M1.8 Zoom FFT`: `src/lib/dsp/zoom.ts`, `zoom.test.ts`, `ZoomLab.tsx`, `p1-3.mdx` 완성 및 push 완료 (`fef6e90`).
  - `M1.10 윈도우 랩 (P1-4)`: D-024 기준에 따라 **P1-4 본문(글) 및 랩 가이드 작성 완료** (`src/pages/p1-4.mdx`). 용어집(`docs/Glossary.md`), 목차(`src/data/curriculum.ts` `status: 'review'`), 콘텐츠 사양(`docs/Contents.md`) 갱신 완료. 현재 사용자 검토 대기 중.
  - 사용자가 P1-4 본문을 검토한 후 OK하면 랩 3종(`LAB-WIN-01`, `LAB-WIN-02`, `LAB-WIN-03`)을 구현하여 붙이고 상태를 `done`으로 전환.
- 이미 있는 것
  - `src/pages/p1-4.mdx`: 1-4 윈도우 본문 (스펙트럴 누설 원리, 피켓 펜스 & 스캘럽 손실, 시간영역 곱/주파수영역 합성곱, 윈도우 5대 선택 가이드, 3가지 보정 계수 ACF·ECF·ENBW, 지수 윈도우 감쇠 사후 보정, 랩 3종 가이드, 확인 문제 4개, 현장 판단 기준, 흔한 실수)
  - `src/lib/dsp/window.ts`: 주기형 윈도우 8종(`uniformWindow`, `hannWindow`, `hammingWindow`, `blackmanHarrisWindow`, `flatTopWindow`, `kaiserWindow`, `exponentialWindow`, `forceWindow`) 및 특성 계수 계산(S₁, S₂, CG, ACF, ECF, ENBW, scallopLoss) (M1.9)
  - `src/lib/dsp/window.test.ts`: 단위 테스트 20개 통과 (M1.9)
  - `src/lib/dsp/zoom.ts` / `zoom.test.ts` / `ZoomLab.tsx` / `p1-3.mdx`: Zoom FFT 완비 (M1.8)
- 화면 확인: `npm run build` → `npx astro preview` 후 Edge 헤드리스 캡처 (AGENTS.md §6).

## 큰 마일스톤 현황

| M | 범위 | 상태 | 세부 진행 | 완료일 |
|---|---|---|---|---|
| M0 | 기반 구축 | **완료** | 5 / 5 | 2026-10-02 |
| M1 | 신호처리 기초 (Part 1) | 진행 중 | 9 / 16 | — |
| M2 | 출발점: MCK → 회전체 (Part 0) | 대기 | 0 / 4 | — |
| M3 | 센서와 측정 체인 (Part 2) | 대기 | 0 / 4 | — |
| M4 | 신호처리 확장 (Part 3) | 대기 | 0 / 8 | — |
| M5 | 현장 플롯 읽기 (Part 4) | 대기 | 0 / 6 | — |
| M6 | 결함별 진단 (Part 5) | 대기 | 0 / 7 | — |
| M7 | GT/ST 특화 현상 (Part 6) | 대기 | 0 / 4 | — |
| M8 | 구조 시험 · 밸런싱 · 정렬 (Part 7) | 대기 | 0 / 3 | — |
| M9 | 규격 · 판정 · 진단 절차 (Part 8) | 대기 | 0 / 2 | — |
| M10 | 종합 진단 연습 + 레퍼런스 (Part 9) | 대기 | 0 / 3 | — |

상태: `대기` → `진행 중` → `완료`

## 세부 마일스톤 현황 — M1 신호처리 기초 (Part 1)

| 세부 | 내용 | 상태 | 담당 | 커밋 | 완료일 |
|---|---|---|---|---|---|
| M1.0 | 기초 페이지 (P1-0, D-024) | 검토 대기 (본문) | Claude | main | — |
| M1.1 | DSP 코어 ① 신호 모델 | 완료 | Claude | main | 2026-10-02 |
| M1.2 | DSP 코어 ② FFT · 스펙트럼 | 완료 | Codex | main | 2026-10-02 |
| M1.3 | 공통 랩 UI | 완료 | Claude (M1.2와 병렬, D-021) | main | 2026-10-02 |
| M1.4 | 푸리에 기초 (P1-1, LAB-FOU-01) | 완료 → 본문 보강 검토 대기 (D-024) | Claude (M1.9와 병렬, D-021) | main | 2026-10-02 |
| M1.5 | 샘플링 · 에일리어싱 (LAB-SMP-01) | 완료 | Antigravity | main | 2026-10-02 |
| M1.6 | AAF · ADC (LAB-SMP-02, 03) | 완료 | Antigravity | main | 2026-10-02 |
| M1.7 | 분해능 · Smearing (LAB-RES-01, 02) | 완료 | Antigravity | main | 2026-10-02 |
| M1.8 | Zoom FFT (LAB-ZOOM-01) | 완료 | Antigravity | main | 2026-10-02 |
| M1.9 | 윈도우 라이브러리 | 완료 | Antigravity (M1.4와 병렬, D-021) | main | 2026-10-02 |
| M1.10 | 윈도우 랩 (LAB-WIN-01~03) | 검토 대기 (본문, D-024) | Antigravity | main | — |
| M1.11 | 평균화 (LAB-AVG-01) | 대기 | 미배정 | — | — |
| M1.12 | TSA (LAB-AVG-02) | 대기 | 미배정 | — | — |
| M1.13 | 스케일링 · 단위 (LAB-SPC-01, 02, LAB-UNIT-01) | 대기 | 미배정 | — | — |
| M1.14 | 변조 · 맥놀이 (LAB-MOD-01) | 대기 | 미배정 | — | — |
| M1.15 | 측정 설정 종합 · 샌드박스 (LAB-SBX-01) | 대기 | 미배정 | — | — |

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

## 세션 로그 (최근 3개, 최신이 위)

> 4번째부터는 `docs/archive/SessionLog.md` 맨 위로 옮긴다 (D-020).

### 2026-10-02 · Antigravity · M1.10 윈도우 페이지 P1-4 본문 작성 (D-024)
- 진행 방식: D-024 신규 페이지 작성 기준(본문 먼저 → 사용자 확인 → 랩) 준수
- 한 일:
  - `src/pages/p1-4.mdx` 본문 작성:
    1. 현장에서 왜 필요한가 (스펙트럴 누설로 인한 진폭 16% 저하 및 미세 결함 마스킹 방지)
    2. 선수 개념 표 (P1-0, P1-1, P1-2, P1-3 대조)
    3. 이 페이지에서 할 수 있게 되는 것 6가지
    4. 흐름 표 (3단계 랩 연결)
    5. 1절 누설 원인 (DFT의 주기적 연장 가정, 정수 주기 vs 비정수 주기 불연속 단차, 60.0 Hz vs 60.5 Hz 숫자 예)
    6. 2절 피켓 펜스 & 스캘럽 손실 (창살 사이 관측 모델, Uniform 3.92 dB/36.3% 손실 vs Hann 1.42 dB/15.1% vs Flat top <0.01 dB, 쿨링팬 4.5 mm/s 경보 판정 사례)
    7. 3절 윈도우 함수 (시간의 곱 = 주파수의 합성곱, 메인로브 폭 vs 사이드로브 감쇠율 불변의 트레이드오프)
    8. 4절 현장 윈도우 5대 선택 가이드 (Uniform, Hann 기본값, Flat top 밸런싱/교정, Blackman-Harris 4항 초고동적범위, Force/Exponential 모달 시험 및 지수 감쇠비 사후 보정 $\zeta_{\mathrm{true}} \approx \zeta_{\mathrm{meas}} - 1/(\tau\omega_n)$)
    9. 5절 3가지 보정 계수와 ENBW (이산 피크 톤 ACF $N/S_1$, 광대역 랜덤 잡음/RMS ECF $\sqrt{N/S_2}$, PSD 잡음 대역폭 ENBW $(ACF/ECF)^2$, 반대로 적용 시 18.4% 과소평가 또는 50% 과대평가 함정)
    10. 6절 랩 3종(LAB-WIN-01~03) 자리 안내 (할 일, 화면 읽는 법, 따라 하기, 무엇을 봤나)
    11. 7절 핵심 정리 5가지
    12. 8절 확인 문제 4개, 현장 판단 기준표, 흔한 실수 4가지, 참고자료(R-05 Heinzel, R-06 Harris, R-03 Wowk)
  - `docs/Glossary.md`: 새 용어 10개(스펙트럴 누설, 피켓 펜스 효과, 스캘럽 손실, 윈도우 함수, 메인로브/사이드로브, CG, ACF, ECF, ENBW, 지수 윈도우 감쇠 보정) 등록
  - `src/data/curriculum.ts`: P1-4 `href: '/p1-4/'`, `status: 'review'`
  - `docs/Contents.md`: P1-4 상태 `검토 (본문, D-024)`
- 확인:
  - 전체 단위 테스트 110개 100% 통과 (`npm test`)
  - `astro check` 0 errors / 0 warnings / 0 hints (총 52개 파일)
  - `astro build` 18개 정적 페이지 정상 빌드
  - Edge 헤드리스 캡처로 렌더링, 수식, 표, 굵은 글씨(`<strong>`) 시각적 정상 확인
- 다음: 사용자 P1-4 본문 검토 → 확인 후 LAB-WIN-01~03 랩 인터랙티브 컴포넌트 구현

### 2026-10-02 · Antigravity · M1.8 Zoom FFT (P1-3, LAB-ZOOM-01)
- 한 일:
  - `src/lib/dsp/zoom.ts`: Zoom FFT 메트릭 계산 함수 `calculateZoomMetrics()` ($B = F_{\max}/Z$, $\Delta f = F_{\max}/(Z \cdot \mathrm{LOR})$, $T = Z \cdot T_{\text{base}}$), Zoom 대역 슬라이스 및 고분해능 스펙트럼 계산 `computeZoomSpectrum()` 구현
  - `src/lib/dsp/zoom.test.ts`: 단위 테스트 3개 추가 (F_max 2000 Hz, LOR 400, Z=8, fc=1200 Hz $\rightarrow \Delta f = 0.625\text{ Hz}, T = 1.6\text{ s}, B = 250\text{ Hz}$ 검증, GMF 1200 Hz 및 5 Hz 측대역 톤 진폭 보존 검증)
  - `src/components/labs/ZoomLab.tsx`: `LAB-ZOOM-01` Zoom FFT 랩 구현 (기본 광대역 스펙트럼 및 Zoom 영역 표시, Zoom 확대 스펙트럼 및 측대역 3개 피크 분리, 확대 배율 Z=1~64배 조작, 4단계 처리 메커니즘, 측정 시간 T 증가 트레이드오프 수식 및 읽음값)
  - `src/pages/p1-3.mdx`: Section 6에 `LAB-ZOOM-01` 임베드 및 Zoom FFT 4단계 처리와 측정 시간 불변의 법칙 기술
  - `src/data/curriculum.ts`: P1-3 상태 `done`으로 최종 갱신
  - `docs/Contents.md`: P1-3 `완료`, LAB-ZOOM-01 `완료`로 갱신
- 확인:
  - 전체 단위 테스트 110개 100% 통과 (`npm test`)
  - `astro check` 0 errors / 0 warnings / 0 hints (총 49개 파일)
  - `astro build` 16개 정적 페이지 정상 빌드
- 다음: M1.10(윈도우 랩, P1-4) — D-024 새 기준에 따라 본문 먼저 작성 후 검토

### 2026-10-02 · Claude · M1.0 기초 페이지 P1-0 + P1-1 본문 보강 (D-024)
- 요청: 사용자 — P1-1에서 "하모닉 개수가 갑자기 왜 나오나, 사각파를 만들라는 건가, 5개인데 성분은 왜 3개인가", "설명 자체가 너무 부실하고 앞에 없는 내용이 많다". 사용자 선택: P1-0 추가, 본문 먼저 → 확인 → 랩, P1-2는 Claude가 보강
- 한 일
  - P1-0 신설: 시간파형·측정량, 정현파 3요소·위상차, rpm↔Hz·1X·차수, Peak·Pk-Pk·RMS·DC·Crest factor, 스펙트럼이란(FRF와 차이), 샘플링 기본(x[n], Δt, f_s, N, T). 숫자 예 + 확인 문제 5개
  - P1-1 재작성: 선수 개념 표, 흐름 표, 기본파·하모닉·차수 정의, 사각파 레시피 표를 랩 앞에, 랩마다 할 일·화면 읽는 법·따라 하기·무엇을 봤나, DFT 숫자 예(합 16 → 진폭 1), 복소수는 접는 상자
  - 랩 (a): 시작 1차, "최고 차수 N", 더한 성분·0인 차수 표시 / 랩 (b): 컨트롤 이름 정리
  - Contents §1 작성 기준·체크리스트, `docs/Glossary.md` 신설, D-024, I-022
  - 발견·수정: 괄호로 끝나는 굵은 글씨 뒤 한글 → `**` 노출(`<strong>`으로), 한글 글자 중간 줄바꿈(`word-break: keep-all`)
- 확인: 테스트 87, `astro check` 0 errors, 빌드 16페이지, 수식 오류 0, P1-0·P1-1 헤드리스 캡처, 콘솔 오류 0
- 다음: 사용자 검토 → P1-2 보강
