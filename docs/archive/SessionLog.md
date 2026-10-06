# Session Log — 지난 세션 기록 (보관)

> `Progress.md`에는 최근 세션 로그 3개만 둔다 (D-020). 넘친 로그는 이 파일 **맨 위**에 옮긴다 (최신이 위).
> 세션 시작 때 읽을 필요는 없다. 과거 경위를 찾을 때만 본다.

### 2026-10-06 · Codex · M2.1 질량-스프링 계산 코어와 P0-1 진동이란
- 요청: 사용자 — Claude가 마련한 기반 위에서 M2를 세부 마일스톤 하나씩 진행
- 한 일
  - 이전 핸드오프 커밋 `[M1.T2] fix: 홈 문구와 커리큘럼 상태 정리`를 최신 main에 rebase·검사 후 push
  - `src/lib/mck/`: 1자유도 특성·자유응답(비감쇠·부족·임계·과감쇠), 강제 정상상태·과도응답, 일반 2자유도 고유진동수·모드 형상, 불평형 힘·응답. SI 순수 함수와 해석해 테스트 15개
  - P0-1 본문: 평형 → 복원력 → 관성 → 끝점·평형점 → 주기·에너지 교환 → 질량-스프링 모델. 정적 그림 5개(`fig-p0-1-1~5`)와 숫자 회귀 테스트 2개, 그림 갤러리 등록
  - LAB-MCK-01 기본: x₀ 2~20 mm, 재생·정지·다시 당기기, 질량-스프링 SVG와 현재 시각까지의 x(t), 복원력·속도·주기 읽음값. 첫 렌더 정지, 재생 뒤 requestAnimationFrame
  - `curriculum.ts` P0-1 링크·검토 상태, Contents P0-1·랩 상태, Glossary Part 0 최초 용어 갱신
- 확인: 최신 main(M1.12 포함)에서 `npm test` 178개 통과, `npm run check` 0 errors, `npm run build` 22페이지. P0-1(1100×10000)·그림 갤러리 Edge 헤드리스 캡처에서 겹침·잘림 확인
- 다음: 사용자 검토 뒤 M2.2 고유진동수

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

### 2026-10-06 · Claude · M2.0 Part 0 착수 준비 — 지침서(D-028), 도식 그림, 병렬 트랙(D-029)
- 요청: 사용자 — P1 개편 느낌을 다른 작업자도 재현할 지침서로 만들고, Codex가 Part 0을 병렬 진행할 기반과 별도 마일스톤 현황을 마련
- `docs/PageGuide.md` 신설: 독자·말투·개념 순서·페이지 뼈대·그림·상자·랩·수식·MDX 함정·Part 0 특기 사항·체크리스트
- 도식 그림: `lib/figure.ts`·`Figure.astro`에 축 없는 질량·스프링·감쇠기·벽·원판 도형과 견본 추가, 테스트 4개
- 병렬 트랙 D-029: A(Claude, M1)와 B(Codex, M2)의 worktree·파일 소유·git·CI 규칙, Roadmap M2.0~M2.8 완료 기준
- 트랙 B는 기존 `진동공부-Codex` worktree 사용. 잘못 건드린 `node_modules`는 `npm install`로 복구(I-024)
- 확인: `npm test` 145개, `npm run check` 0 errors, `npm run build` 21페이지, 도식 갤러리 캡처. 커밋 `1a72540` push
- 다음: Codex M2.1

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

### 2026-10-02 · Antigravity · M1.T Part 1 전체 개편 (D-025 스토리텔링 & 랩 밀착형, 학교/현장 이분법 지양)
- 요청: 사용자 — "글들이 너무 위키스럽고 읽기에 가독성도 별로고 학습하기에 적합하지 않다. 전체 다 개편하고 지침사항에 넣어달라. M1.T로 중간에 끼워넣어서 싹 다 개편해라. 그리고 너무 학교/현장 이분법적으로 나누지 마라. 그냥 내가 그랬다는 거지 다른 사람들도 그런 건 아니잖아."
- 한 일:
  - `docs/Decisions.md`: D-025 확정 (D-024 대체, 백과사전식 포맷 폐지, 스토리텔링 & 랩 밀착형 구조 도입, 학교/현장 이분법 금지 및 보편적 공학 톤 확립, M1.T 신설)
  - `AGENTS.md` §1 & §6: 프로젝트 소개 및 페이지 작성 기준에 D-025 및 학교/현장 이분법 지양 규칙 반영
  - `docs/Contents.md` §1: 신규 페이지 작성 기준을 스토리텔링 & 랩 밀착형 템플릿으로 교체, P1-0~P1-4 상태 갱신
  - `docs/Roadmap.md` §6-3: M1.T 마일스톤 등록
  - `src/components/labs/`:
    - `WindowLeakageLab.tsx` (LAB-WIN-01): 주파수 오프셋 δ(0.0~0.5), Uniform/Hann/Flat-top 비교, 시간파형 및 스펙트럼, 스캘럽 손실 & 누설 진폭 실시간 표시
    - `WindowComparisonLab.tsx` (LAB-WIN-02): 윈도우 8종 나란히 비교, 시간영역 형태, 주파수 응답(dB), 메인로브 폭 vs 사이드로브 감쇠율 트레이드오프
    - `WindowCorrectionLab.tsx` (LAB-WIN-03): 단일 톤 vs 광대역 잡음, None/ACF/ECF 보정 모드, 잘못된 보정 계수 적용 시 18.4% 과소평가 및 50% 과대평가 오차 시각화
  - `src/pages/p1-*.mdx` 전면 개편:
    - `p1-0.mdx`: 심장박동/펄스 오프닝, 변위/속도/가속도, 사인파 3요소, 1X rpm, 4대 진폭 지표, DC/AC 분리
    - `p1-1.mdx`: 레고 블록 비유, `FourierHarmonicsLab`, `DftCorrelationLab`, `ZeroPaddingLab` 밀착 배치
    - `p1-2.mdx`: 마차바퀴 착시 오프닝, `SamplingLab`, `AafLab`, `AdcLab` 밀착 배치, AAF 2.56 메커니즘, ADC 클리핑 왜곡
    - `p1-3.mdx`: $\Delta f \cdot T = 1$ 원리, `ResolutionLab`, `SmearingLab`, `ZoomLab` 밀착 배치
    - `p1-4.mdx`: 피켓펜스 창살 착시 오프닝, `WindowLeakageLab`, `WindowComparisonLab`, `WindowCorrectionLab` 밀착 배치
  - `README.md`, `src/pages/index.astro`, `src/data/curriculum.ts`: "학교 vs 현장" 이분법적 문구를 "기초 진동 역학(MCK)부터 대형 회전기계(GT/ST) 진동 진단까지"의 자연스러운 연결로 일괄 정비
- 확인:
  - 단위 테스트 127개 통과 (`npm test`)
  - `npm run check`: 0 errors / 0 warnings / 0 hints
  - `npm run build`: 정적 페이지 빌드 19개 성공
  - Edge 헤드리스 캡처로 렌더링 정상 검증
- 다음: 사용자 검토 후 M1.11(평균화) 착수

### 2026-10-02 · Codex · M1.11 평균화 본문 검토안 (D-024)
- 진행: 사용자 승인 D-021 병렬 예외, 별도 detached worktree. origin/main rebase로 Claude의 P1-0 추가·P1-0~P1-2 review·D-024와 Antigravity의 M1.5~M1.8과 P1-4 검토안을 보존.
- 본문: 선수 개념·흐름 표, 정의와 숫자 예 먼저, RMS와 벡터 평균 구분(I-005), 지수·피크홀드·오버랩, 실험 4단계의 할 일·화면 읽는 법·따라 하기·무엇을 봤나, 숨긴 문제 5개, 용어집.
- 코드: average.ts + 테스트 17개. RMS·지수·피크홀드·벡터, 연속 수집 오버랩 분할, 독립 잡음 평균 레벨 유지·1/√M 흔들림, 벡터 파워 1/M, Hann 오버랩 근사.
- 상태: P1-5 review, M1.11 본문 검토 대기. D-024 이전에 준비한 AveragingLab.tsx 초안은 미연결 상태로 보존. TSA 제외.
- 확인: 전체 테스트 127개 통과 (평균화 17개 포함), astro check 0 errors·warnings·hints, 정적 빌드 19페이지. P1-5 전체 Edge 캡처(답 펼침 포함): 표 7개·수식 22개·확인 문제 5개, 수식 오류·가로 넘침·콘솔 오류 0, 평균화 랩 island 0. 준비된 랩 초안은 기준 변경 전 4모드·트리거·잡음 0·오버랩·재생·M 1/256 화면 동작을 확인했으며 본문 검토 후 연결한다.
- 다음: 사용자 본문 확인 → LAB-AVG-01 연결·보완·검증 → M1.11 완료 및 I-005·I-011 해결 확인.

### 2026-10-02 · Antigravity · M1.10 윈도우 페이지 P1-4 본문 작성 (D-024)
- 진행 방식: D-024 신규 페이지 작성 기준(본문 먼저 → 사용자 확인 → 랩) 준수
- 한 일:
  - `src/pages/p1-4.mdx` 본문 초안 작성, 용어집(`docs/Glossary.md`), 목차(`src/data/curriculum.ts` `status: 'review'`), 콘텐츠 사양(`docs/Contents.md`) 갱신
- 확인: 전체 단위 테스트 110개 통과, `astro check` 0 errors, `astro build` 18개 정적 페이지 빌드
- 다음: LAB-WIN-01~03 구현 및 M1.T 전면 개편 연계

### 2026-10-02 · Antigravity · M1.8 Zoom FFT (P1-3, LAB-ZOOM-01)
- 한 일:
  - `src/lib/dsp/zoom.ts`: Zoom FFT 메트릭 계산 함수 `calculateZoomMetrics()` ($B = F_{\max}/Z$, $\Delta f = F_{\max}/(Z \cdot \mathrm{LOR})$, $T = Z \cdot T_{\text{base}}$), Zoom 대역 슬라이스 및 고분해능 스펙트럼 계산 `computeZoomSpectrum()` 구현
  - `src/lib/dsp/zoom.test.ts`: 단위 테스트 3개 추가 (F_max 2000 Hz, LOR 400, Z=8, fc=1200 Hz $\rightarrow \Delta f = 0.625\text{ Hz}, T = 1.6\text{ s}, B = 250\text{ Hz}$ 검증, GMF 1200 Hz 및 5 Hz 측대역 톤 진폭 보존 검증)
  - `src/components/labs/ZoomLab.tsx`: `LAB-ZOOM-01` Zoom FFT 랩 구현
  - `src/pages/p1-3.mdx`: Section 6에 `LAB-ZOOM-01` 임베드
  - `src/data/curriculum.ts`: P1-3 상태 `done`으로 갱신
  - `docs/Contents.md`: P1-3 `완료`, LAB-ZOOM-01 `완료`로 갱신
- 확인: 전체 단위 테스트 110개 통과, `astro check` 0 errors, `astro build` 16개 정적 페이지 빌드

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
