# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 최신 항목을 맨 위에 추가한다.
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6). 모든 작업은 `main`에서 한다 (D-019).

## 현재 상태

| 항목 | 값 |
|---|---|
| 큰 마일스톤 | **M0 기반 구축 완료** → M1 신호처리 기초 (Part 1) 시작 |
| 세부 마일스톤 | 다음 **M1.1 DSP 코어 ① 신호 모델** |
| 담당 | Claude |
| 사이트 | https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포) |
| 사용자 확인 대기 | `Curriculum.md` 전체, `Roadmap.md` §6-3 M1 세부 목록, `Decisions.md`의 `제안` 항목 (특히 D-007 기술 스택, D-015 문서 추가), I-009 규격 인용 정책 |

## 핸드오프 (다음 작업자에게)

- **다음: M1.1 DSP 코어 ① 신호 모델** (`Roadmap.md` §6-3): SignalSpec(정현파·하모닉·잡음), evaluate, 시드 난수, acquire(fs, N) + 테스트
- 이미 있는 것
  - `src/lib/dsp/sampling.ts`: `aliasFrequency()` + 테스트
  - `components/ui/`: `Formula`(살아있는 수식), `Plot`(Plotly 래퍼), `ParamSlider` / `src/lib/format.ts`: `texNumber()`
  - 예시 `src/components/labs/SineDemo.tsx`, 확인 페이지 `/Vibration_study/dev/math-plot/`
  - 본문 수식은 MDX에서 `$…$`, `$$…$$`
- push 후 Actions 탭에서 `CI & Deploy` 성공을 확인한다 (실패하면 사이트는 바뀌지 않음).
- 화면 확인: `npm run build` → `npx astro preview` 후 Edge 헤드리스 캡처 (AGENTS.md §6).
- 열린 이슈: I-016 (랩 폭, M1.3), I-018 (Actions Ubuntu 26 전환, 깨지면 대응)

## 큰 마일스톤 현황

| M | 범위 | 상태 | 세부 진행 | 완료일 |
|---|---|---|---|---|
| M0 | 기반 구축 | **완료** | 5 / 5 | 2026-10-02 |
| M1 | 신호처리 기초 (Part 1) | 진행 중 | 0 / 15 | — |
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
| M1.1 | DSP 코어 ① 신호 모델 | 진행 중 | Claude | — | — |
| M1.2 | DSP 코어 ② FFT · 스펙트럼 | 대기 | 미배정 | — | — |
| M1.3 | 공통 랩 UI | 대기 | 미배정 | — | — |
| M1.4 | 푸리에 기초 (P1-1, LAB-FOU-01) | 대기 | 미배정 | — | — |
| M1.5 | 샘플링 · 에일리어싱 (LAB-SMP-01) | 대기 | 미배정 | — | — |
| M1.6 | AAF · ADC (LAB-SMP-02, 03) | 대기 | 미배정 | — | — |
| M1.7 | 분해능 · Smearing (LAB-RES-01, 02) | 대기 | 미배정 | — | — |
| M1.8 | Zoom FFT (LAB-ZOOM-01) | 대기 | 미배정 | — | — |
| M1.9 | 윈도우 라이브러리 | 대기 | 미배정 | — | — |
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

## 세션 로그 (최신이 위)

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
