# AGENTS.md — 공통 작업 규칙 & 문서 인덱스

> **Claude Code와 Codex가 함께 따르는 단일 규칙 파일**입니다.
> Codex는 이 파일을 자동으로 읽고, Claude Code는 `CLAUDE.md`의 `@AGENTS.md`로 같은 내용을 읽습니다 (D-002).
> 규칙을 바꿀 때는 `docs/Decisions.md`에 결정을 먼저 남기고 이 파일을 고칩니다.

## 1. 프로젝트

학교에서 배운 MCK·모드해석과 현장 회전체(GT/ST) 진단 사이의 간극을 메우는 **개인 학습용 웹사이트**.
재구성한 커리큘럼(Part 0~9, `docs/Curriculum.md`)을 페이지로 정리하고, 신호처리는 가상 신호를 직접 조작하는 **인터랙티브 랩 + 수식**으로 만든다.

| 역할 | 누구 |
|---|---|
| 학습자, 최종 결정권자, main 병합 | 사용자 |
| 작업자 (마일스톤 단위로 담당) | Claude Code, Codex |
| 공유 수단 | 이 git 저장소와 `docs/` 문서 |

## 2. 문서 지도

| 문서 | 무엇을 담나 | 언제 갱신하나 |
|---|---|---|
| `AGENTS.md` | 공통 규칙, 문서 인덱스 (이 파일) | 규칙이 바뀔 때 (Decision 선행) |
| `docs/Roadmap.md` | 큰 그림: 목표, 사이트 구조, 기술 구조, 마일스톤 정의·완료 기준 | 마일스톤 범위가 바뀔 때 |
| `docs/Progress.md` | 현재 마일스톤, 체크리스트, 핸드오프, 세션 로그 | **매 세션 끝 (필수)** |
| `docs/Decisions.md` | 결정 기록 `D-xxx` (맥락·결정·대안·영향) | 되돌리기 어려운 선택을 했을 때 |
| `docs/Issues.md` | 블로커·환경·설계 질문·콘텐츠 검증 `I-xxx` | 발견 즉시, 해결 즉시 |
| `docs/Curriculum.md` | 상세 커리큘럼 (Contents의 하위 문서): Part 0~9 절별 목표·내용·수식·과제·함정 = **무엇을 가르치나** | 교육 내용이 바뀔 때 (D-015) |
| `docs/Contents.md` | 사이트 콘텐츠 목록과 사양: 페이지·랩·기호·수식·검증값·참고자료 = **어떻게 구현하나** | 콘텐츠를 추가·변경·완료할 때 |
| `docs/source/curriculum.md` | 사용자가 처음 준 원본 커리큘럼 | **수정 금지** (읽기 전용, D-004) |

## 3. 세션 절차

**시작할 때**
1. `git status` / `git branch` / `git log --oneline -10`으로 현재 상태 확인
2. `docs/Progress.md`의 "현재 상태"와 "핸드오프" 읽기
3. `docs/Roadmap.md`에서 담당 마일스톤의 산출물·완료 기준 확인
4. `docs/Issues.md`의 열린 항목, `docs/Decisions.md`의 관련 결정 확인
5. 구현할 페이지의 교육 내용은 `docs/Curriculum.md`, 페이지·랩 사양은 `docs/Contents.md`에서 확인 (사양이 비어 있으면 먼저 작성)

**끝낼 때**
1. `docs/Progress.md`: 체크리스트 갱신, 세션 로그 1건을 **맨 위**에 추가, 핸드오프 갱신
2. 새 결정 → `Decisions.md`, 새 문제 → `Issues.md`, 콘텐츠 상태 변화 → `Contents.md`
3. 테스트·빌드가 있다면 통과를 확인한 뒤 커밋 (§4 규칙)

## 4. 마일스톤 & Git 협업 (D-003, D-017, D-018)

- 저장소: `origin` = https://github.com/taegyu10732/Vibration_study (**공개**, 기본 브랜치 `main`)
- 마일스톤은 2단계다: 큰 마일스톤 `M{n}`(커리큘럼의 큰 범위) → 세부 마일스톤 `M{n}.{m}`(실제 작업 단위). 목록은 `docs/Roadmap.md` §6.
- **한 번에 하나의 세부 마일스톤만 "진행 중"**. 담당 에이전트와 브랜치를 `Progress.md`에 적는다.
- 세부 마일스톤 1개 = 브랜치 1개 = PR 1개
  - 브랜치: `m{n}.{m}-{영문-slug}` (예: `m1.2-fft`). 최신 `main`에서 만든다.
  - 초기 커밋(M0.2)을 빼고는 `main`에 직접 커밋하지 않는다.
- 커밋 메시지: `[M{n}.{m}] {type}: {요약}` — type은 `feat` `fix` `docs` `test` `refactor` `chore`
  - 예: `[M0.3] feat: Astro 사이트 골격`, `[M1.5] feat: 샘플링 랩(LAB-SMP-01) 추가`
- **main 병합은 사용자만** 한다. 에이전트는 PR 병합, force push, 히스토리 재작성을 하지 않는다.
- 다른 에이전트가 진행 중인 브랜치는 수정하지 않는다. 필요한 점은 `Issues.md`에 남긴다.
- 세부 마일스톤 완료 흐름
  1. 담당자: Roadmap의 완료 기준 충족 + `npm run check`·`npm run build` 통과(M0.5부터 `npm test` 포함) + 문서 갱신 (Progress, 필요하면 Contents·Issues·Decisions)
  2. `Progress.md` 상태를 `리뷰 대기`로 바꾸고 커밋
  3. 브랜치 push → PR 생성 (`gh pr create`). PR 본문에 무엇을 했고 어떻게 확인하는지 적는다.
  4. (선택) 다른 에이전트가 교차 리뷰 → PR 코멘트, 지적 사항은 `Issues.md`
  5. 사용자가 PR 병합 → 다음 세션의 담당자가 새 브랜치에서 상태를 `완료`로 바꾸고 다음 세부 마일스톤으로
- 큰 마일스톤의 마지막 세부가 끝나면 `Progress.md`에 짧은 회고(잘된 점, 바꿀 점)를 남기고, 다음 큰 마일스톤의 세부 목록을 사용자와 확인한다.

## 5. 문서 작성 규칙

- 날짜는 절대 날짜 `YYYY-MM-DD`. "어제", "다음 주" 같은 상대 표현은 쓰지 않는다.
- ID 체계 (한 번 쓴 ID는 재사용하지 않음)

  | 대상 | 형식 | 예 |
  |---|---|---|
  | 큰 마일스톤 | `M{n}` | M1 |
  | 세부 마일스톤 | `M{n}.{m}` | M1.5 |
  | 결정 | `D-{3자리}` | D-007 |
  | 이슈 | `I-{3자리}` | I-004 |
  | 페이지 | `P{Part}-{절}` (Curriculum 절 번호) | P1-4 (Part 1-4 윈도우) |
  | 랩 | `LAB-{주제}-{2자리}` | LAB-WIN-01 |
  | 참고자료 | `R-{2자리}` | R-05 |

- `Decisions.md`는 **추가만** 한다. 결정을 바꾸려면 새 결정을 쓰고 이전 결정의 상태를 `대체됨 → D-xxx`로 바꾼다.
- 결정 상태: `제안`(사용자 확인 전) → `확정` / `폐기` / `대체됨`. 제안 상태인 결정 위에 큰 작업을 쌓아야 하면 먼저 사용자에게 확인한다.
- 작성자는 `Claude` / `Codex` / `사용자` 중 하나로 표기한다.
- 문서와 사이트 UI는 한국어. 전문용어는 처음 나올 때 영문을 병기한다 (예: 누설(Spectral Leakage)). 코드와 식별자는 영어 (D-005).

## 6. 코드 규칙 (M0 스캐폴딩 이후 적용)

기술 스택은 `docs/Decisions.md` D-006~D-012, 디렉터리 구조는 `docs/Roadmap.md` §4를 따른다.

- 명령: `npm install` → `npm run dev`(개발 서버) · `npm run check`(타입 검사) · `npm run build`(정적 빌드) · `npm test`(M0.5부터)
- 사이트는 `/Vibration_study/` 하위 경로로 배포된다. 내부 링크와 정적 파일 경로는 반드시 `withBase()`(`src/lib/site.ts`)로 만든다.
- 사이트 목차(`src/data/curriculum.ts`)는 `docs/Curriculum.md`의 절 구성, `docs/Contents.md` §4의 페이지 상태와 같아야 한다. 한쪽을 고치면 다른 쪽도 고친다.

- `src/lib/dsp/`에는 **순수 함수만** 둔다. DOM·React·플롯 라이브러리에 의존하지 않는다.
- 내부 단위는 SI (s, Hz, rad, m, m/s, m/s²). rpm, mm/s, µm, g, dB 변환은 UI 계층에서만 한다 (D-012).
- 난수는 반드시 시드를 고정한다 (같은 파라미터 → 같은 결과).
- 새 DSP 함수에는 **해석해 또는 문헌값으로 검증하는 테스트**를 함께 넣는다 (예: Hann ENBW = 1.5 bin, bin 중심 톤의 진폭 = 입력 진폭). 기준값은 `docs/Contents.md` §6.
- 기호·수식 표기는 `docs/Contents.md` §3을 단일 기준으로 쓴다.
- 랩은 `docs/Contents.md`의 랩 사양을 먼저 채우고 구현한다. 구조: 조작 → 플롯 → 수식(현재 값 대입) → 실험 과제.

## 7. 하지 말 것

- `docs/source/curriculum.md` 수정 — 오류나 의문은 `docs/Issues.md`에 유형 `콘텐츠`로 등록
- 사용자 확인 없는 main 병합, force push, 히스토리 재작성
- **저장소와 사이트는 공개다.** 다음은 커밋하지 않는다.
  - ISO/API 규격의 본문·표·경계값 전재 — 자체 표현으로 요약하고 출처를 밝힌다 (I-009)
  - 회사 현장 데이터, 도면, 비밀정보, 개인 연락처
