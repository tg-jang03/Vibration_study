# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 최신 항목을 맨 위에 추가하고 최근 3개만 남긴다 (나머지는 `archive/SessionLog.md`, D-020).
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6). 모든 작업은 `main`에서 한다 (D-019).

## 현재 상태

| 항목 | 값 |
|---|---|
| 큰 마일스톤 | M1 신호처리 기초 (Part 1) — 5 / 15 |
| 세부 마일스톤 | M1.4 (Claude)·M1.9 (Antigravity) 완료 → 다음 **M1.5 샘플링 · 에일리어싱 (P1-2, LAB-SMP-01)** |
| 담당 | 다음 담당은 사용자가 지정 |
| 사이트 | https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포) |
| 사용자 확인 대기 | `Curriculum.md` 전체, `Roadmap.md` §6-3 M1 세부 목록, `Decisions.md`의 `제안` 항목 (특히 D-007 기술 스택, D-015 문서 추가), I-009 규격 인용 정책 |

## 핸드오프 (다음 작업자에게)

- **다음: M1.5 샘플링 · 에일리어싱** (`Roadmap.md` §6-3): 페이지 P1-2 + LAB-SMP-01 (사양: Contents §5-1). 본문은 `Curriculum.md` 1-2. 페이지·랩 만드는 법은 M1.4의 `src/pages/p1-1.mdx`와 `components/labs/` 3개를 그대로 따라 하면 된다 (D-023).
- 병렬 후보 (D-021): M1.5 ∥ M1.7(분해능 — 처프 성분은 `signal.ts`, 랩은 새 파일). M1.6(AAF·ADC)은 M1.5와 같은 `sampling.ts`를 고치므로 순서대로.
- 이미 있는 것
  - `src/lib/dsp/signal.ts`: `SignalSpec`(sine·harmonics·noise), `evaluate()`, `evaluateRange()` — 정현파는 `A·cos(2πft + φ)` (Contents §3)
  - `src/lib/dsp/sampling.ts`: `acquire(spec, {fs, n, t0})`, `aliasFrequency()` / `src/lib/dsp/random.ts`: `createRng(seed)` (uniform, normal)
  - `src/lib/dsp/fft.ts`: `fft(real, imag?)`(비정규화 전방 복소 DFT), `zeroPad(values, fftSize)` — 입력 보존
  - `src/lib/dsp/window.ts`: 주기형(DFT-even) 윈도우 8종(`uniform`, `hann`, `hamming`, `blackmanHarris`, `flatTop`, `kaiser`, `exponential`, `force`), 특성 계수 계산 `windowProperties(w)`(S₁, S₂, CG, ACF, ECF, ENBW, scallopLossDb/Ratio), `applyWindow(x, w)`, 팩토리 `createWindow(type, n, opts)` (M1.9)
  - `src/lib/dsp/spectrum.ts`: `singleSidedSpectrum(samples, {fftSize?, window?, windowOptions?})` → frequency·amplitude(Pk)·phase(rad)·s1. 위상은 첫 샘플 기준, 진폭 분모는 S₁(윈도우 합, 미적용 시 N과 동일). bin 중심 톤은 ACF로 피크 진폭 A 보존. I-010(Flat top 5항 계수) 결정 완료 (D-022)
  - `components/ui/`: `LabFrame`(랩 틀: controls·plots·formulas·readouts·tasks), `ParamSlider`(프레임당 1회 갱신)·`ParamSelect`·`ParamToggle`, `ReadoutTable`(측정·이론·오차), `Formula`, `Plot`(`onRendered`로 그리기 시간) / `src/lib/format.ts`: `texNumber()`, `formatNumber()`, `formatError()`
  - 예시 `src/components/labs/SineDemo.tsx`(가장 작은 랩), `LabUiDemo.tsx`(모든 부품 + 벤치마크) / 확인 페이지 `/dev/math-plot/`, `/dev/lab-ui/`
  - 랩 규칙 (AGENTS.md §6): 서버(빌드)와 브라우저에서 달라지는 값은 첫 렌더에 쓰지 않는다 (I-019). 성능은 `scripts/bench/plot-bench.mjs`로 잰다 (I-020)
  - 본문 수식은 MDX에서 `$…# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 최신 항목을 맨 위에 추가하고 최근 3개만 남긴다 (나머지는 `archive/SessionLog.md`, D-020).
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6). 모든 작업은 `main`에서 한다 (D-019).

## 현재 상태

| 항목 | 값 |
|---|---|
| 큰 마일스톤 | M1 신호처리 기초 (Part 1) — 5 / 15 |
| 세부 마일스톤 | M1.4 (Claude)·M1.9 (Antigravity) 완료 → 다음 **M1.5 샘플링 · 에일리어싱 (P1-2, LAB-SMP-01)** |
| 담당 | 다음 담당은 사용자가 지정 |
| 사이트 | https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포) |
| 사용자 확인 대기 | `Curriculum.md` 전체, `Roadmap.md` §6-3 M1 세부 목록, `Decisions.md`의 `제안` 항목 (특히 D-007 기술 스택, D-015 문서 추가), I-009 규격 인용 정책 |

## 핸드오프 (다음 작업자에게)

- **다음: M1.5 샘플링 · 에일리어싱** (`Roadmap.md` §6-3): 페이지 P1-2 + LAB-SMP-01 (사양: Contents §5-1). 본문은 `Curriculum.md` 1-2. 페이지·랩 만드는 법은 M1.4의 `src/pages/p1-1.mdx`와 `components/labs/` 3개를 그대로 따라 하면 된다 (D-023).
- 병렬 후보 (D-021): M1.5 ∥ M1.7(분해능 — 처프 성분은 `signal.ts`, 랩은 새 파일). M1.6(AAF·ADC)은 M1.5와 같은 `sampling.ts`를 고치므로 순서대로.
- 이미 있는 것
  - `src/lib/dsp/signal.ts`: `SignalSpec`(sine·harmonics·noise), `evaluate()`, `evaluateRange()` — 정현파는 `A·cos(2πft + φ)` (Contents §3)
  - `src/lib/dsp/sampling.ts`: `acquire(spec, {fs, n, t0})`, `aliasFrequency()` / `src/lib/dsp/random.ts`: `createRng(seed)` (uniform, normal)
  - `src/lib/dsp/fft.ts`: `fft(real, imag?)`(비정규화 전방 복소 DFT), `zeroPad(values, fftSize)` — 입력 보존
  - `src/lib/dsp/window.ts`: 주기형(DFT-even) 윈도우 8종(`uniform`, `hann`, `hamming`, `blackmanHarris`, `flatTop`, `kaiser`, `exponential`, `force`), 특성 계수 계산 `windowProperties(w)`(S₁, S₂, CG, ACF, ECF, ENBW, scallopLossDb/Ratio), `applyWindow(x, w)`, 팩토리 `createWindow(type, n, opts)` (M1.9)
  - `src/lib/dsp/spectrum.ts`: `singleSidedSpectrum(samples, {fftSize?, window?, windowOptions?})` → frequency·amplitude(Pk)·phase(rad)·s1. 위상은 첫 샘플 기준, 진폭 분모는 S₁(윈도우 합, 미적용 시 N과 동일). bin 중심 톤은 ACF로 피크 진폭 A 보존. I-010(Flat top 5항 계수) 결정 완료 (D-022)
  - `components/ui/`: `LabFrame`(랩 틀: controls·plots·formulas·readouts·tasks), `ParamSlider`(프레임당 1회 갱신)·`ParamSelect`·`ParamToggle`, `ReadoutTable`(측정·이론·오차), `Formula`, `Plot`(`onRendered`로 그리기 시간) / `src/lib/format.ts`: `texNumber()`, `formatNumber()`, `formatError()`
  - 예시 `src/components/labs/SineDemo.tsx`(가장 작은 랩), `LabUiDemo.tsx`(모든 부품 + 벤치마크) / 확인 페이지 `/dev/math-plot/`, `/dev/lab-ui/`
  - 랩 규칙 (AGENTS.md §6): 서버(빌드)와 브라우저에서 달라지는 값은 첫 렌더에 쓰지 않는다 (I-019). 성능은 `scripts/bench/plot-bench.mjs`로 잰다 (I-020)
, `$…$`. KaTeX는 `package.json` `overrides`로 0.19 한 버전만 쓴다 (I-021)
  - M1.4: `src/lib/dsp/fourier.ts`(`harmonicPreset` 사각파·톱니파·펄스열, `dftAt` 비정수 k DFT, `correlationTerms`), `stats.ts`(`rms`·`peak`·`crestFactor`), 랩 `FourierHarmonicsLab`·`DftCorrelationLab`·`ZeroPaddingLab`, 페이지 `/p1-1/`, `MdxLayout`(frontmatter `sectionId` → 경로 표시·이전/다음 절), `Plot`의 `kind: 'bar'`
- push 후 Actions 탭에서 `CI & Deploy` 성공을 확인한다 (실패하면 사이트는 바뀌지 않음).
- 화면 확인: `npm run build` → `npx astro preview` 후 Edge 헤드리스 캡처 (AGENTS.md §6).
- 열린 이슈: I-018 (Actions Ubuntu 26 전환, 깨지면 대응)

## 큰 마일스톤 현황

| M | 범위 | 상태 | 세부 진행 | 완료일 |
|---|---|---|---|---|
| M0 | 기반 구축 | **완료** | 5 / 5 | 2026-10-02 |
| M1 | 신호처리 기초 (Part 1) | 진행 중 | 5 / 15 | — |
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
| M1.1 | DSP 코어 ① 신호 모델 | 완료 | Claude | main | 2026-10-02 |
| M1.2 | DSP 코어 ② FFT · 스펙트럼 | 완료 | Codex | main | 2026-10-02 |
| M1.3 | 공통 랩 UI | 완료 | Claude (M1.2와 병렬, D-021) | main | 2026-10-02 |
| M1.4 | 푸리에 기초 (P1-1, LAB-FOU-01) | 완료 | Claude (M1.9와 병렬, D-021) | main | 2026-10-02 |
| M1.5 | 샘플링 · 에일리어싱 (LAB-SMP-01) | 대기 | 미배정 | — | — |
| M1.6 | AAF · ADC (LAB-SMP-02, 03) | 대기 | 미배정 | — | — |
| M1.7 | 분해능 · Smearing (LAB-RES-01, 02) | 대기 | 미배정 | — | — |
| M1.8 | Zoom FFT (LAB-ZOOM-01) | 대기 | 미배정 | — | — |
| M1.9 | 윈도우 라이브러리 | 완료 | Antigravity (M1.4와 병렬, D-021) | main | 2026-10-02 |
| M1.10 | 윈도우 랩 (LAB-WIN-01~03) | 대기 | 미배정 | — | — |
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

### 2026-10-02 · Claude · M1.4 푸리에 기초 (M1.9와 병렬)
- 진행: Antigravity의 M1.9와 병렬, 별도 worktree. Antigravity push 후 rebase (D-021). 교차 리뷰: `window.ts`(주기형 8종, Flat top 5항 출처 명시)·`spectrum.ts` window 옵션(기존 호출 호환) — 문제 없음
- 한 일: 페이지 P1-1(`/p1-1/`, Curriculum 1-1 본문 + 현장 판단 기준·흔한 실수), LAB-FOU-01을 페이지 흐름에 맞춰 (a) 하모닉 쌓기·Parseval (b) DFT = 템플릿 상관·k 스윕 (c) 제로패딩 vs 측정 시간(N 비교)으로 구성, `fourier.ts`·`stats.ts` + 테스트 12, `MdxLayout` 경로 표시·이전/다음 절, `Plot` 막대
- 발견·수정: (1) rehype-katex가 KaTeX 0.16을 따로 써서 본문 수식 아래첨자가 깨짐 → `overrides`로 0.19 통일 (I-021, M0.4 확인 페이지도 같이 고쳐짐) (2) 이론상 0인 값의 부동소수점 잡음(−2.7e-15)이 서버·브라우저에서 달라 hydration 오류 → 작은 값은 0으로 표시 (I-019 보강)
- 확인: 테스트 87개 통과(M1.9 포함), `astro check` 0 errors, 빌드 14페이지, 헤드리스 캡처로 페이지 전체·수식 확대 확인, 콘솔 오류 0
- 다음: M1.5

### 2026-10-02 · Antigravity · M1.9 윈도우 라이브러리 (M1.4와 병렬)
- 진행 방식: Claude가 M1.4(푸리에 랩)를 별도 worktree에서 진행 중이므로, UI 파일(src/components, src/pages, curriculum.ts)을 전혀 건드리지 않고 DSP 코어와 문서만 작업 (AGENTS §4, D-021)
- 한 일:
  - `src/lib/dsp/window.ts`: 주기형(DFT-even) 윈도우 8종(`uniformWindow`, `hannWindow`, `hammingWindow`, `blackmanHarrisWindow`, `flatTopWindow`, `kaiserWindow`, `exponentialWindow`, `forceWindow`), `createWindow`, `applyWindow`, `besselI0`
  - 특성 계수 계산 `windowProperties(w)`: S₁, S₂, CG, ACF, ECF, ENBW, scallopLossDb/Ratio
  - `src/lib/dsp/spectrum.ts`: `window` 옵션 추가 (`Float64Array` 또는 `WindowType`), 진폭 분모를 S₁(윈도우 합)으로 정규화 (미적용 시 N과 동일하여 기존 100% 호환)
  - I-010 해결 (D-022): Flat top 5항 코사인 표준 계수(ISO 18431-2, SciPy `flattop`, MATLAB `flattopwin`, D'Antona & Ferrero 2006) 채택 및 출처 명시
  - `Contents.md` §6 Flat top 수치 확정 및 출처 추가
- 확인:
  - 새 테스트 20개(`window.test.ts`) + `spectrum.test.ts` 4개 추가. 전체 75개 테스트 100% 통과
  - Contents §6 문헌값 검증: Uniform(CG 1, ENBW 1, SL 3.92 dB), Hann(CG 0.5, ENBW 1.5, SL 1.42 dB), Hamming(CG 0.54, ENBW 1.363, SL 1.78 dB), Blackman-Harris(CG 0.359, ENBW 2.004, SL 0.83 dB), Flat top(CG 0.2156, ENBW 3.77 bin, SL < 0.01 dB)
  - bin 중심 톤 피크 진폭 보존(A=1.000) 및 bin 사이(δ=0.5) 스캘럽 손실 검증
  - `npm run check` 0 errors/0 warnings, `npm run build` 13페이지 통과
- 다음: Claude의 M1.4(푸리에 랩) 완료 후 M1.5(샘플링) 또는 M1.10(윈도우 랩)

### 2026-10-02 · Claude · M1.3 공통 랩 UI (M1.2와 병렬)
- 진행 방식: 사용자 요청으로 Codex의 M1.2와 병렬. 별도 worktree(`../진동공부-claude`)에서 코드 파일이 겹치지 않게 작업하고, Codex가 push한 뒤 rebase해서 문서와 함께 push (D-021)
- 한 일: `LabFrame`, `ParamSlider`(useRafCallback, 프레임당 1회)·`ParamSelect`·`ParamToggle`, `ReadoutTable`, `formatNumber`·`formatError`(+테스트 8), `Plot.onRendered`·축 설정 내용 비교, 랩 폭(I-016 해결), `/dev/lab-ui/` + 벤치마크, SineDemo를 LabFrame으로, `scripts/bench/plot-bench.mjs`
- 측정 (헤드리스 Edge 실시간, 30회): N=1024 평균 7.6 ms / 4096 9.4 ms (최대 16.8) / 16384 12.9 ms (최대 28.4) → 60 fps 예산 안 → D-010 확정 제안
- 발견: 서버·브라우저 값 불일치로 hydration 오류 #418 (I-019), 헤드리스 가상 시간에서 시간 0·rAF 정지 (I-020)
- 교차 리뷰: Codex M1.2(`fft.ts`, `spectrum.ts`) 확인 — 문제 없음
- 확인: 테스트 51개 통과(M1.2 포함), `astro check` 0 errors, 빌드 13페이지, 화면 캡처
- 다음: M1.4

