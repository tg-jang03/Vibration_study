# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 최신 항목을 맨 위에 추가하고 최근 3개만 남긴다 (나머지는 `archive/SessionLog.md`, D-020).
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6). 모든 작업은 `main`에서 한다 (D-019).

## 현재 상태

| 항목 | 값 |
|---|---|
| 큰 마일스톤 | M1 신호처리 기초 (Part 1) — 9 / 16 (M1.0 추가) |
| 세부 마일스톤 | **M1.8 Zoom FFT(LAB-ZOOM-01) 완료** → 다음 **M1.10 윈도우 랩 (P1-4, LAB-WIN-01~03)** |
| 담당 | Antigravity |
| 사이트 | https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포) |
| 사용자 확인 대기 | **P1-0·P1-1 본문 (D-024)**, `Curriculum.md` 전체, `Roadmap.md` §6-3 M1 세부 목록, `Decisions.md`의 `제안` 항목 (특히 D-007 기술 스택, D-015 문서 추가), I-009 규격 인용 정책 |

## 핸드오프 (다음 작업자에게)

- **[중요] 페이지 작성 기준 변경 (D-024, 2026-10-02)**: 모든 새 페이지는 `docs/Contents.md` §1을 따른다 — **본문 먼저 → 사용자 확인(상태 `검토`/`review`) → 랩**. 맨 위 선수 개념 표, 새 용어는 정의 + 숫자 예 + `docs/Glossary.md` 등록, 뒤 페이지 개념은 쓰지 않기, 랩마다 할 일 → 화면 읽는 법 → 따라 하기 → 무엇을 봤나, push 전 체크리스트. 예시: `src/pages/p1-0.mdx`, `p1-1.mdx`.
- P1-0(신규)·P1-1(보강) 본문이 사용자 검토 대기. 검토 뒤 Claude가 P1-2를 같은 기준으로 보강한다 (I-022).
- **다음 마일스톤**:
  - `M1.10 윈도우 랩` (`Roadmap.md` §6-3): M1.9에서 윈도우 8종 라이브러리(`window.ts`)가 이미 구현되어 있으므로, P1-4 페이지와 LAB-WIN-01(누설 & 피켓펜스), LAB-WIN-02(윈도우 8종 비교), LAB-WIN-03(3가지 진폭 보정: ACF, ECF, ENBW)을 작성. D-024 기준에 따라 **본문 먼저 작성 → 사용자 확인(상태 'review') → 랩** 순서로 진행.
- 이미 있는 것
  - `src/lib/dsp/zoom.ts`: `calculateZoomMetrics()`, `computeZoomSpectrum()` (M1.8)
  - `components/labs/ZoomLab.tsx`: `LAB-ZOOM-01` Zoom FFT 랩 (기어 GMF 1200 Hz ± 1X 측대역 확대, Z=1~64배율, 대역폭 B, 분해능 Δf 및 측정 시간 T 증가 시각화) (M1.8)
  - `src/lib/dsp/resolution.ts`: `calculateResolution({fmax, lor})`, `separatedBins()`, `smearingMetrics(a, duration, deltaF)`, `minSeparationBins()` (M1.7)
  - `src/lib/dsp/signal.ts`: `ChirpComponent` (`f(t) = f0 + rate*t` 주파수 가속/감속 위상 적분 모델) (M1.7)
  - `components/labs/ResolutionLab.tsx`: `LAB-RES-01` 분해능 & 두 성분 분리 랩 (M1.7)
  - `components/labs/SmearingLab.tsx`: `LAB-RES-02` Smearing 랩 (M1.7)
  - 페이지 `/p1-3/`: 1-3 주파수 분해능, 윈도우 메인로브 폭 분리 조건, 현장 4대 사례, Smearing $T^2$ 법칙, Zoom FFT 원리 및 LAB-RES-01, LAB-RES-02, LAB-ZOOM-01 완성 (M1.7, M1.8)
  - `src/lib/dsp/window.ts`: 주기형 윈도우 8종 및 특성치 계산 (M1.9)
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
| M1.10 | 윈도우 랩 (LAB-WIN-01~03) | 대기 | Antigravity | main | — |
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

### 2026-10-02 · Antigravity · M1.7 분해능 · Smearing (P1-3, LAB-RES-01, 02)
- 한 일:
  - `src/lib/dsp/resolution.ts`: 분해능 3식 계산 함수 `calculateResolution({fmax, lor})`, 두 성분 간격 bin 수 `separatedBins()`, 윈도우별 최소 분리 bin `minSeparationBins()`, 가감속 스미어링 모델 `smearingMetrics()` 구현
  - `src/lib/dsp/signal.ts`: 가속/감속 모사용 선형 처프 `ChirpComponent` (`f(t) = f0 + rate*t`) 및 `evaluate()` 적분 위상 지원 추가
  - `src/components/labs/ResolutionLab.tsx`: `LAB-RES-01` 분해능 및 두 성분 분리 랩 (현장 프리셋 4종: 1X vs 2LF, 2극 발전기 동기 결함, Oil whirl, 베어링 측대역)
  - `src/components/labs/SmearingLab.tsx`: `LAB-RES-02` Smearing 랩 (코스트다운 감속률 $a$와 $T^2$ 비례 피크 번짐 시각화)
  - `src/pages/p1-3.mdx`: 1-3 분해능 본문 초안 작성 및 LAB-RES-01, 02 임베드
- 확인: 전체 테스트 107개 통과, `astro check` 0 errors, Edge 헤드리스 스크린샷 검증 완료
- 다음: M1.8(Zoom FFT)
