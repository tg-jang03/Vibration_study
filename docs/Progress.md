# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 최신 항목을 맨 위에 추가한다.
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6).

## 현재 상태

| 항목 | 값 |
|---|---|
| 큰 마일스톤 | M0 기반 구축 |
| 세부 마일스톤 | M0.3 사이트 골격 → **리뷰 대기** (PR #1) |
| 담당 | Claude |
| 브랜치 | `m0.3-scaffold` |
| 사용자 확인 대기 | `Curriculum.md` 전체, `Roadmap.md` §6 세부 마일스톤 목록, `Decisions.md`의 `제안` 항목 (특히 D-007 기술 스택, D-015 문서 추가) |

## 핸드오프 (다음 작업자에게)

- **사용자**: PR #1(M0.3) 확인 후 병합. 로컬 확인은 `npm install` → `npm run dev` → http://localhost:4321/Vibration_study/
- **다음 세부 마일스톤: M0.4 수식 · 플롯 검증** (`Roadmap.md` §6-2). PR #1 병합 후 최신 `main`에서 `m0.4-math-plot` 브랜치로 시작한다. 시작할 때 이 문서에서 M0.3을 `완료`로 바꾼다.
- 사이트는 `/Vibration_study/` 하위 경로로 빌드된다. 내부 링크는 `withBase()`를 쓴다 (AGENTS.md §6).
- 사이트 목차 데이터는 `src/data/curriculum.ts`. Curriculum.md·Contents.md §4와 함께 고친다.
- 사용자 피드백이 오면 Curriculum/Roadmap/Decisions에 먼저 반영한다 (확정된 결정은 상태를 `확정`으로).

## 큰 마일스톤 현황

| M | 범위 | 상태 | 세부 진행 | 완료일 |
|---|---|---|---|---|
| M0 | 기반 구축 | 진행 중 | 2 / 5 | — |
| M1 | 신호처리 기초 (Part 1) | 대기 | 0 / 15 | — |
| M2 | 출발점: MCK → 회전체 (Part 0) | 대기 | 0 / 4 | — |
| M3 | 센서와 측정 체인 (Part 2) | 대기 | 0 / 4 | — |
| M4 | 신호처리 확장 (Part 3) | 대기 | 0 / 8 | — |
| M5 | 현장 플롯 읽기 (Part 4) | 대기 | 0 / 6 | — |
| M6 | 결함별 진단 (Part 5) | 대기 | 0 / 7 | — |
| M7 | GT/ST 특화 현상 (Part 6) | 대기 | 0 / 4 | — |
| M8 | 구조 시험 · 밸런싱 · 정렬 (Part 7) | 대기 | 0 / 3 | — |
| M9 | 규격 · 판정 · 진단 절차 (Part 8) | 대기 | 0 / 2 | — |
| M10 | 종합 진단 연습 + 레퍼런스 (Part 9) | 대기 | 0 / 3 | — |

상태: `대기` → `진행 중` → `리뷰 대기` → `완료`

## 세부 마일스톤 현황 — M0 기반 구축

| 세부 | 내용 | 상태 | 담당 | 브랜치 / PR | 완료일 |
|---|---|---|---|---|---|
| M0.1 | 문서 체계 · 상세 커리큘럼 초안 | 완료 | Claude | main (초기 커밋에 포함) | 2026-10-02 |
| M0.2 | 저장소 연결 · 초기 커밋 | 완료 | Claude | main | 2026-10-02 |
| M0.3 | 사이트 골격 | 리뷰 대기 | Claude | `m0.3-scaffold` / [PR #1](https://github.com/taegyu10732/Vibration_study/pull/1) | — |
| M0.4 | 수식 · 플롯 검증 | 대기 | 미배정 | — | — |
| M0.5 | 테스트 · CI · 배포 | 대기 | 미배정 | — | — |

### 남은 사용자 확인 사항 (M0 완료 전까지)
- [ ] 계획 피드백 (Curriculum, Roadmap §6, Decisions 제안 항목)
- [ ] I-009 규격 인용 정책 확인 (공개 저장소 기준)

## 세션 로그 (최신이 위)

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
