# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 최신 항목을 맨 위에 추가하고 최근 3개만 남긴다 (나머지는 `archive/SessionLog.md`, D-020).
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6). 모든 작업은 `main`에서 한다 (D-019).

## 현재 상태

| 항목 | 값 |
|---|---|
| 큰 마일스톤 | M1 신호처리 기초 (Part 1) — 8 / 15 |
| 세부 마일스톤 | M1.7 (Antigravity) 완료 → 다음 **M1.8 Zoom FFT (P1-3, LAB-ZOOM-01)** 또는 **M1.10 윈도우 랩 (P1-4, LAB-WIN-01~03)** |
| 담당 | 다음 담당은 사용자가 지정 |
| 사이트 | https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포) |
| 사용자 확인 대기 | `Curriculum.md` 전체, `Roadmap.md` §6-3 M1 세부 목록, `Decisions.md`의 `제안` 항목 (특히 D-007 기술 스택, D-015 문서 추가), I-009 규격 인용 정책 |

## 핸드오프 (다음 작업자에게)

- **다음 마일스톤 후보**:
  - `M1.8 Zoom FFT` (`Roadmap.md` §6-3): P1-3 후반부 + LAB-ZOOM-01(복소 복조 + LPF + 데시메이션으로 기어 1200 Hz ± 1X 측대역 확대, 배율 Z별 Δf 및 계산 시간). M1.8이 끝나면 P1-3 전체가 `done` 완료 처리됨.
  - `M1.10 윈도우 랩` (`Roadmap.md` §6-3): M1.9에서 윈도우 8종 라이브러리(`window.ts`)가 이미 구현되어 있으므로, P1-4 페이지와 LAB-WIN-01~03(누설 시각화, 윈도우 비교, 3가지 진폭 보정)을 만들어 빠르게 화면에 반영 가능!
- 이미 있는 것
  - `src/lib/dsp/resolution.ts`: `calculateResolution({fmax, lor})`, `separatedBins()`, `smearingMetrics(a, duration, deltaF)`, `minSeparationBins()` (M1.7)
  - `src/lib/dsp/signal.ts`: `ChirpComponent` (`f(t) = f0 + rate*t` 주파수 가속/감속 위상 적분 모델) (M1.7)
  - `components/labs/ResolutionLab.tsx`: `LAB-RES-01` 분해능 & 두 성분 분리 랩 (현장 프리셋 4종: 1X vs 2LF, 2극 발전기 동기 결함, Oil whirl, 베어링 측대역) (M1.7)
  - `components/labs/SmearingLab.tsx`: `LAB-RES-02` Smearing 랩 (코스트다운 회전수 변화율 $a$와 $T^2$ 비례 피크 번짐 시각화) (M1.7)
  - 페이지 `/p1-3/`: 1-3 주파수 분해능, 윈도우 메인로브 폭 분리 조건, 현장 4대 사례, Smearing $T^2$ 법칙, Zoom FFT 원리 개요 + 랩 2종 (M1.7)
  - `src/lib/dsp/sampling.ts`: `acquire()`, `aliasFrequency()`, `aliasComponent()`, `butterworthGain()`, `butterworthAttenuationDb()`, `theoreticalSqnr()`, `effectiveSnr()`, `quantize()` (M1.5, M1.6)
  - `components/labs/SamplingLab.tsx`: `LAB-SMP-01`, `AafLab.tsx`: `LAB-SMP-02`, `AdcLab.tsx`: `LAB-SMP-03`, 페이지 `/p1-2/` (M1.5, M1.6)
  - `src/lib/dsp/window.ts`: 주기형(DFT-even) 윈도우 8종(`uniform`, `hann`, `hamming`, `blackmanHarris`, `flatTop`, `kaiser`, `exponential`, `force`), 특성 계수 계산 `windowProperties(w)` (M1.9)
  - `src/lib/dsp/spectrum.ts`: `singleSidedSpectrum()` — S₁ 윈도우 정규화 지원
  - `components/ui/`: `LabFrame`, `ParamSlider`, `ParamSelect`, `ParamToggle`, `ReadoutTable`, `Formula`, `Plot`
- push 후 Actions 탭에서 `CI & Deploy` 성공을 확인한다 (실패하면 사이트는 바뀌지 않음).
- 화면 확인: `npm run build` → `npx astro preview` 후 Edge 헤드리스 캡처 (AGENTS.md §6).

## 큰 마일스톤 현황

| M | 범위 | 상태 | 세부 진행 | 완료일 |
|---|---|---|---|---|
| M0 | 기반 구축 | **완료** | 5 / 5 | 2026-10-02 |
| M1 | 신호처리 기초 (Part 1) | 진행 중 | 8 / 15 | — |
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
| M1.5 | 샘플링 · 에일리어싱 (LAB-SMP-01) | 완료 | Antigravity | main | 2026-10-02 |
| M1.6 | AAF · ADC (LAB-SMP-02, 03) | 완료 | Antigravity | main | 2026-10-02 |
| M1.7 | 분해능 · Smearing (LAB-RES-01, 02) | 완료 | Antigravity | main | 2026-10-02 |
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

### 2026-10-02 · Antigravity · M1.7 분해능 · Smearing (P1-3, LAB-RES-01, 02)
- 한 일:
  - `src/lib/dsp/resolution.ts`: 분해능 3식 계산 함수 `calculateResolution({fmax, lor})` ($\Delta f, T, N, f_s$), 두 성분 간격 bin 수 `separatedBins(f1, f2, deltaF)`, 윈도우별 최소 분리 bin `minSeparationBins()`, 가감속 스미어링 모델 `smearingMetrics(a, duration, deltaF)` 구현
  - `src/lib/dsp/signal.ts`: 가속/감속 모사용 선형 처프 `ChirpComponent` (`f(t) = f0 + rate*t`) 및 `evaluate()` 적분 위상 지원 추가
  - `src/lib/dsp/resolution.test.ts`, `signal.test.ts`: 단위 테스트 10개 추가 (F_max 1000 Hz, LOR 3200 $\rightarrow \Delta f = 0.3125\text{ Hz}, T = 3.2\text{ s}, N = 8192, f_s = 2560\text{ Hz}$, $a = 60\text{ rpm/s} \rightarrow 10.24\text{ bin}$ 스미어링 등 Contents §6 문헌값 검증)
  - `src/components/labs/ResolutionLab.tsx`: `LAB-RES-01` 분해능 및 두 성분 분리 랩 (F_max 100~5000 Hz, LOR 100~6400, 현장 프리셋 4종: 1X vs 2LF, 2극 발전기 동기 결함 분리불가, Oil whirl 0.42X vs 0.48X, 베어링 BPFI 측대역, 분리 성공/불가 판정 수식 및 읽음값)
  - `src/components/labs/SmearingLab.tsx`: `LAB-RES-02` Smearing 랩 (초기 회전수, 감속률 $a$, 정속 기준 피크 겹쳐보기, $\Delta f_{1X} = (a/60)T$ 및 $(a/60)T^2$ bin 번짐, 피크 진폭 감소율 시각화)
  - `src/pages/p1-3.mdx`: 1-3 분해능 3식, 윈도우 메인로브 분리 한계, 현장 4대 사례 상세, Smearing $T^2$ 법칙, Zoom FFT 원리 개요, LAB-RES-01, 02 임베드
  - `src/data/curriculum.ts`: P1-3 `href: '/p1-3/'`, `status: 'wip'` 등록
  - `docs/Contents.md`: P1-3 `구현중`, LAB-RES-01, LAB-RES-02 `완료`
- 확인:
  - 단위 테스트 전체 107개 100% 통과 (`npm test`)
  - `astro check` 0 errors / 0 warnings / 0 hints
  - `astro build` 16페이지 정상 생성 (KaTeX 경고 0)
  - Edge 헤드리스 스크린샷(`screenshot-p1-3.png`)으로 LAB-RES-01, LAB-RES-02의 플롯, 수식, 컨트롤 화면 검증 완료
- 다음: M1.8(Zoom FFT)로 P1-3 완성 또는 M1.10(윈도우 랩)

### 2026-10-02 · Antigravity · M1.6 AAF · ADC (P1-2, LAB-SMP-02, 03)
- 한 일:
  - `src/lib/dsp/sampling.ts`: Butterworth 필터 감쇠 모델(`butterworthGain`, `butterworthAttenuationDb`), ADC 이론 SQNR 및 레인지 헤드룸 반영 유효 SNR(`theoreticalSqnr`, `effectiveSnr`), 양자화 및 클리핑 모델(`quantize`) 구현
  - `src/lib/dsp/sampling.test.ts`: 새 테스트 10개 추가 (Butterworth 8차 $f/f_c = 1.8 \rightarrow 40.84\text{ dB}$, $|H|\approx 0.00907$ 문헌값 검증, SQNR 16 bit 98.08 dB, 양자화 오차 $\le \text{LSB}/2$, 클리핑 검출)
  - `src/components/labs/AafLab.tsx`: `LAB-SMP-02` AAF & $f_s = 2.56 F_{\max}$ 전이대역 랩
  - `src/components/labs/AdcLab.tsx`: `LAB-SMP-03` ADC 비트 분해능 & 입력 레인지 & 클리핑 랩
  - `src/pages/p1-2.mdx`: AAF 2.56 메커니즘, LOR과 2의 거듭제곱 FFT, ADC 비트 분해능, 헤드룸 최적화, $F_{\max}$ 선정 기준표, LAB-SMP-02, 03 임베드
  - `src/data/curriculum.ts`: P1-2 상태 `done`으로 변경
  - `docs/Contents.md`: P1-2, LAB-SMP-02, LAB-SMP-03 상태 `완료`로 갱신
- 확인: 전체 테스트 97개 통과, `astro check` 0 errors, 빌드 15페이지, Edge 헤드리스 스크린샷 검증 완료
- 다음: M1.7(분해능 · Smearing)

### 2026-10-02 · Antigravity · M1.5 샘플링 · 에일리어싱 (P1-2, LAB-SMP-01)
- 한 일:
  - `src/lib/dsp/sampling.ts`: `aliasComponent(f, phase, fs)` 함수 추가 및 테스트
  - `src/components/labs/SamplingLab.tsx`: `LAB-SMP-01` 랩 컴포넌트 구현
  - `src/pages/p1-2.mdx`: 1-2 샘플링 정리와 에일리어싱 본문 + 수식 + LAB-SMP-01 랩 + 현장 에일리어스 감별법
  - `src/data/curriculum.ts`: P1-2 `href: '/p1-2/'`, 상태 `wip`
- 확인: 전체 테스트 87개 통과, `astro check` 0 errors, 빌드 15페이지, Edge 헤드리스 스크린샷 검증 완료
- 다음: M1.6(AAF·ADC) 또는 M1.10(윈도우 랩)
