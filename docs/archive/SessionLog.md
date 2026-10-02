# Session Log — 지난 세션 기록 (보관)

> `Progress.md`에는 최근 세션 로그 3개만 둔다 (D-020). 넘친 로그는 이 파일 **맨 위**에 옮긴다 (최신이 위).
> 세션 시작 때 읽을 필요는 없다. 과거 경위를 찾을 때만 본다.

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

### 2026-10-02 · Codex · M1.2 DSP 코어 ② FFT · 스펙트럼
- 한 일
  - `fft.ts`: radix-2 전방 FFT(실수·복소 입력, 비정규화, 입력 보존), 명시적 `zeroPad`
  - `spectrum.ts`: `Samples` → 단일측 주파수·피크 진폭·위상. DC·나이퀴스트 두 배 제외, 원래 N으로 정규화, 첫 샘플 기준 위상
  - 제로패딩의 bin 간격과 실제 분해능·측정 시간을 분리 반환. 빈 입력·길이·비유한값 검증
  - Roadmap에 M1.2 완료 기준 구체화, Contents에 DSP API·검증값·R-12(NumPy 공식 DFT 정의) 기록
- 확인: 새 테스트 23개, 전체 43개 통과 (직접 DFT, 복소 음의 주파수, 켤레 대칭, Parseval, 사각파 홀수 하모닉, 진폭·위상·t₀, 제로패딩, DC·나이퀴스트). `npm run check` 오류·경고 0, `npm run build` 12페이지 통과
- 환경 메모: 이 Codex 셸의 PATH에는 Node가 없어 프로세스 PATH에 `C:\Program Files\nodejs`를 추가했다. 테스트·빌드의 자식 프로세스 실행은 샌드박스 밖에서 검증 (EPERM). 프로젝트 설정·의존성 변경 없음
- 다음: M1.3 공통 랩 UI (I-016 랩 폭, N=4096 성능 확인)

### 2026-10-02 · Claude · M1.1 DSP 코어 ① 신호 모델
- 한 일
  - `random.ts`: 시드 고정 난수 `createRng` (mulberry32 균등, Box–Muller 정규)
  - `signal.ts`: `SignalSpec` = sine / harmonics / noise 성분의 합, `evaluate(t)`(참 신호, 잡음 제외), `evaluateRange()`
  - `sampling.ts`: `acquire(spec, {fs, n, t0})` — 샘플 시각 t0 + i/fs, 잡음은 샘플 번호 기준 시드 생성
  - 정현파 표기를 `A·cos(2πft + φ)`로 통일 (FFT 위상과 φ가 바로 대응). SineDemo도 신호 모델을 쓰도록 변경
  - Contents §3(신호 표기·성분 목록), §6(에일리어스 위상 반전, 난수 기준값) 갱신
- 확인: 테스트 20개 통과 (난수 통계, 하모닉 = 정현파 합, 선형성, 940 Hz(φ) = 60 Hz(−φ) 위상 반전, 잡음 rms·재현성), `astro check` 0 errors, 빌드 12페이지, SSR 수식에 `cos` 연산자 정상
- 메모: 셸 heredoc으로 코드를 쓰면 백슬래시가 사라지는 일이 있었다 → 백슬래시가 있는 코드는 Write 도구로 쓴다
- 다음: M1.2

### 2026-10-02 · Claude · M0 마무리 기록
- 한 일: M0.5·M0 완료 처리와 회고, AGENTS.md(`npm test` 명령, push 후 Actions 확인), README(사이트 주소·테스트 명령), I-018 등록
- 다음: M1.1

### 2026-10-02 · 사용자 · M0.5 (3~5단계) GitHub Actions · Pages 배포
- 한 일: `.github/workflows/deploy.yml` 작성(checkout → setup-node 24 → `npm ci` → check → test → build → upload-pages-artifact → deploy-pages), Settings › Pages › Source "GitHub Actions"
- 경과: 첫 커밋 `f98e472`은 파일이 저장되지 않은 빈 상태로 올라가 0초 만에 실패 → 내용을 저장해 `ca771c1`로 다시 push → 실행 36970127342 성공 (build 21 s, deploy 9 s)
- 확인 (Claude): https://tg-jang03.github.io/Vibration_study/ 홈·`/parts/1/`·`/dev/math-plot/`·파비콘 HTTP 200, 배포 페이지의 KaTeX 렌더 확인
- 알림: `ubuntu-latest` → Ubuntu 26 전환 예정 (I-018)

### 2026-10-02 · Claude · M0.5 (1~2단계) Vitest · 첫 DSP 테스트
- 요청: 사용자 — "3번부터 직접 해보고 싶으니 2번까지 해달라"
- 한 일: Vitest 5.0.3 설치, `npm test`·`npm run test:watch` 스크립트, `vitest.config.ts`(캐시 `node_modules/.vite-tasks`, I-017), 첫 DSP 함수 `aliasFrequency()`와 테스트 3개(Contents §6 기준값: 60 Hz·760 Hz)
- 확인: `npm test` 3 passed, `npm run check` 0 errors, `npm run build` 12페이지
- 다음: 사용자가 3단계(GitHub Actions)부터 진행

### 2026-10-02 · Claude · M0.4 후속: 개발 서버 플롯 멈춤 수정 (I-017)
- 사용자 제보: 개발 서버에서 그래프가 "불러오는 중…"에 멈춤
- 원인: 개발 서버 실행 중 에이전트의 install·check·build가 Vite 의존성 캐시를 덮어써 KaTeX 모듈 504 → hydration 실패
- 수정: `vite.cacheDir` 분리(dev ↔ build/check), `optimizeDeps.include`(katex, plotly), `Plot` 로드 실패 문구, `@types/node` 추가
- 확인: 사용자 개발 서버에서 플롯 렌더(헤드리스 Edge), check·build 후에도 개발 캐시 불변, `astro check` 0 errors, 빌드 12페이지. 사용자 확인 "잘 되는 것 같다"

### 2026-10-02 · Claude · M0.4 수식 · 플롯 검증 (+ 작업 방식·계정명 변경)
- 요청: 사용자 — "다음 작업 진행", "main 하나에서 다 작업해도 괜찮다", "GitHub 계정명 바꿨다"
- 한 일
  - PR #1(M0.3)을 사용자 승인으로 Claude가 병합 (`e7b620c`). 이후 작업 방식을 main 단일 브랜치로 변경 (D-019): AGENTS.md §1·§4·§7, Roadmap §6, Decisions D-003·D-018 상태 갱신. 병합된 `m0.3-scaffold` 브랜치 삭제(로컬·원격)
  - 계정명 `taegyu10732` → `tg-jang03`: 원격 주소, 커밋 메일, `site`, `REPO_URL`, README·AGENTS·Roadmap 주소 갱신. 과거 기록(D-018, I-002, I-003)에는 갱신 줄을 덧붙임
  - 수식: Astro 7 기본 처리기(Sätteri) 대신 `unified()` + remark-math + rehype-katex, KaTeX CSS 전역 로드
  - 컴포넌트: `Formula`(KaTeX 실시간), `Plot`(Plotly cartesian 부분 번들 지연 로드, 라이트/다크 색 토큰), `ParamSlider`, `texNumber()`
  - 검증 페이지 `/dev/math-plot/`: 본문 인라인·블록 수식, 중괄호 많은 식, `SineDemo`(슬라이더 → 플롯 → 대입 수식)
- 확인: `npm run check` 0 errors, `tsc --noEmit` 통과, `npm run build` 12페이지, 빌드 HTML에 KaTeX 6곳·오류 0, 폰트·CSS가 `/Vibration_study/` 경로. Edge 헤드리스 캡처로 수식·플롯·홈 화면 확인 (축 제목이 주황빛으로 보인 것은 ClearType 서브픽셀 효과, 실제 색은 회색)
- 크기: Plotly 청크 1.44 MB(그래프가 있는 페이지에서만 지연 로드), SineDemo 청크 265 KB(KaTeX 포함)
- 이슈: I-016 등록 (랩 폭)
- 다음: M0.5
### 2026-10-02 · Claude · M0.3 사이트 골격
- 한 일
  - Astro 7.3.5 + React 19 + MDX 통합, TypeScript strict(`astro/tsconfigs/strict`), `@astrojs/check`
  - GitHub Pages용 `site`/`base`(`/Vibration_study`) 설정, 경로 헬퍼 `withBase()`
  - 레이아웃(헤더·내비·푸터, 라이트/다크 토큰), 홈 커리큘럼 지도(Part 0~9 카드, 진행 막대), Part별 페이지 10개(절 목록 + 상태 배지 + 이전/다음)
  - 목차 데이터 `src/data/curriculum.ts`, 파비콘, README
- 확인: `npm run check` 0 errors · `npm run build` 11페이지 · `astro preview`에서 홈·Part 페이지·파비콘 200, 링크에 `/Vibration_study/` 접두 확인. 브라우저 화면은 직접 보지 않음 (HTML/HTTP 수준 확인)
- 이슈: I-015 등록·해결 (npm 11 설치 스크립트 경고, 영향 없음)
- 다음: PR #1 병합 후 M0.4

### 2026-10-02 · Claude · M0.2 저장소 연결 · 2단계 마일스톤
- 요청: 사용자 — Node.js 설치 완료, 저장소 지정, "마일스톤 한 개 단위가 너무 크다. 큰 범위 → 세부로 나눠라."
- 한 일
  - 환경 확인: node v24.19.0, npm 11.17.0, GitHub 저장소(공개·빈 저장소·기본 브랜치 main), gh CLI 로그인(taegyu10732)
  - 마일스톤 2단계 재구성: 큰 M0~M10, 세부 61개 (`Roadmap.md` §6). `Contents.md` M 열, `AGENTS.md` §4(브랜치·커밋·PR 흐름), §7(공개 저장소 주의) 갱신
  - `origin` 연결, 초기 커밋 push
- 결정: D-017(2단계 마일스톤, D-016 대체), D-018(GitHub 저장소·Pages·PR 병합)
- 이슈: I-001 해결(Node), I-003 해결(저장소), I-002 해결(git 사용자 설정), I-009 갱신(공개 사이트 → 규격 원문·경계값 미포함 정책)
- 다음: M0.3 사이트 골격

### 2026-10-02 · Claude · M0.1 (2) 커리큘럼 재구성
- 요청: 사용자 — "Phase 10은 필요 없고, Phase를 그대로 따를 필요 없다. 보강할 부분은 보강하고 다듬어서 커리큘럼을 더 디테일하게."
- 한 일
  - `docs/Curriculum.md` 신설: Part 0~9, 절마다 목표·내용·수식·랩·과제·함정·원본 대응. 신규 절 8개, 보강 항목 다수 (부록 A).
  - `Contents.md` 재작성: 페이지 ID `P{Part}-{절}`, Part 1 신규 랩 5개 사양, 전체 랩 목록, 기호·검증값 보강.
  - `Roadmap.md` 재작성, `AGENTS.md` 문서 지도에 Curriculum.md 추가.
- 결정: D-014(재구성, 원칙 확정), D-015(Curriculum.md), D-016(마일스톤, D-013 대체)
- 이슈: I-011~I-014 등록, I-007·I-008·I-010 참조 갱신

### 2026-10-02 · Claude · M0.1 (1) 문서 체계
- 한 일: 문서 체계 생성(AGENTS/CLAUDE/docs 6종), 원본 커리큘럼 보존, 로드맵·Phase 1 랩 사양 초안, 원본 콘텐츠 1차 검토, `.gitignore`/`.gitattributes`
- 확인한 환경: Windows 11, git 있음(커밋 0개, 원격 없음, 사용자 정보 미설정), Node 없음
- 결정: D-001 확정, D-002~D-013 제안
- 이슈: I-001~I-010 등록
