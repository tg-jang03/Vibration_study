# Session Log — 지난 세션 기록 (보관)

> `Progress.md`에는 최근 세션 로그 3개만 둔다 (D-020). 넘친 로그는 이 파일 **맨 위**에 옮긴다 (최신이 위).
> 세션 시작 때 읽을 필요는 없다. 과거 경위를 찾을 때만 본다.

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
