# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 최신 항목을 맨 위에 추가하고 최근 3개만 남긴다 (나머지는 `archive/SessionLog.md`, D-020).
> 마일스톤은 2단계다: 큰 마일스톤 `M{n}` → 세부 마일스톤 `M{n}.{m}` (D-017, 목록은 `Roadmap.md` §6). 모든 작업은 `main`에서 한다 (D-019).

## 현재 상태

| 항목 | 값 |
|---|---|
| 큰 마일스톤 | M1 신호처리 기초 (Part 1) — 14 / 18 (M1.0, M1.T, M1.T2 포함) |
| 세부 마일스톤 | **M1.T2 Part 1 개편 ② (D-026) 완료** — P1-0 ~ P1-5. M1.11(평균화)도 함께 완료. 다음은 M1.12(TSA) |
| 담당 | 없음 (다음 세부 시작 전 사용자 확인) |
| 사이트 | https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포) |
| 사용자 확인 대기 | **P1-4·P1-5 새 본문**(그림 16개, 랩 4종 보완·연결), **Part 0 재구성 계획 (D-027)**: Part 0 = 진동 입문 7절, 회전체 동역학 = 새 Part 4, 옛 Part 4~9 → 5~10 |

## 핸드오프 (다음 작업자에게)

- **작성 기준은 Contents §1 (D-025 톤 + D-026 구조)**. 핵심: 앞 페이지까지 나온 개념만 쓴다(개념 척추 표 §1-2), 개념마다 예시 그림(`Figure`), 강조 상자는 `Callout` 6종, 랩 앞 "따라 하기"·뒤 해석, **코드 블록·아스키 도표 금지**, 정리는 표.
- **커리큘럼 번호가 바뀌었다 (D-027, 2026-10-02)**: Part 0은 진동을 처음 배우는 사람용 입문(P0-1 ~ P0-7), 옛 Part 0의 Bode/AF·Jeffcott·유막 안정성은 새 **Part 4 회전체 동역학 기초**(P4-1 ~ P4-3)로, 옛 Part 4~9는 **5~10**으로 밀렸다 (예: 임팩트 시험 P7-1 → **P8-1**, 결함 Part 5 → **Part 6**, 플롯 읽기 Part 4 → **Part 5**). M 번호도 M5 = Part 4(신규), M6 ~ M11 = Part 5 ~ 10. 대응표는 D-027.
- **그림**: `src/figures/p{Part}-{절}.ts`에서 `lib/dsp`로 계산 → `Figure.astro`가 빌드 시 SVG. 그림 색은 c1 파랑·c2 주황·c3 초록·c4 보라·warn 갈색 주황(캡션의 색 이름과 맞출 것). dB 스펙트럼은 stem이 0 dB에서 내려오므로 선+점으로 그린다. 그림 숫자 회귀 테스트 예: `src/figures/figures-p1-4-5.test.ts`.
- **랩 시작 상태**: 같은 랩을 한 페이지 여러 곳에 둘 때는 props로 시작 상태를 다르게 하고 `client:visible`로 둔다 (`AveragingLab`의 `initialMode` 등).
- **함정**: `texNumber`/`formatNumber` 둘째 인자는 유효숫자(아주 작은 값은 지수 표기가 되므로 캡션에선 `toFixed`). 이론상 0인 값은 0으로 정리(hydration). MDX에서 문장부호로 끝나는 굵은 글씨 + 한글은 `<strong>`, 표 안 수식에 `|` 금지, Callout title 속 따옴표는 `'`. 이 PC의 PowerShell은 Node가 PATH에 없을 수 있다 → `$env:Path = "C:\Program Files\nodejs;" + $env:Path`.
- **다음 작업**: 사용자 확인 뒤 M1.12 TSA(P1-5에 LAB-AVG-02 추가) → M1.13 스케일링·단위(P1-6). Part 0 페이지(M2)와 P1-0 정리(M2.8)는 D-027 계획대로 Part 1 뒤에.

## 큰 마일스톤 현황

| M | 범위 | 상태 | 세부 진행 | 완료일 |
|---|---|---|---|---|
| M0 | 기반 구축 | **완료** | 5 / 5 | 2026-10-02 |
| M1 | 신호처리 기초 (Part 1) | 진행 중 | 14 / 18 | — |
| M2 | 진동의 기초 (Part 0) | 대기 | 0 / 8 | — |
| M3 | 센서와 측정 체인 (Part 2) | 대기 | 0 / 4 | — |
| M4 | 신호처리 확장 (Part 3) | 대기 | 0 / 8 | — |
| M5 | 회전체 동역학 기초 (Part 4) | 대기 | 0 / 3 | — |
| M6 | 현장 플롯 읽기 (Part 5) | 대기 | 0 / 6 | — |
| M7 | 결함별 진단 (Part 6) | 대기 | 0 / 7 | — |
| M8 | GT/ST 특화 현상 (Part 7) | 대기 | 0 / 4 | — |
| M9 | 구조 시험 · 밸런싱 · 정렬 (Part 8) | 대기 | 0 / 3 | — |
| M10 | 규격 · 판정 · 진단 절차 (Part 9) | 대기 | 0 / 2 | — |
| M11 | 종합 진단 연습 + 레퍼런스 (Part 10) | 대기 | 0 / 3 | — |

상태: `대기` → `진행 중` → `완료`

## 세부 마일스톤 현황 — M1 신호처리 기초 (Part 1)

| 세부 | 내용 | 상태 | 담당 | 커밋 | 완료일 |
|---|---|---|---|---|---|
| M1.0 | 기초 페이지 (P1-0) | 완료 (D-025·D-026 개편) | Claude / Antigravity | main | 2026-10-02 |
| M1.1 | DSP 코어 ① 신호 모델 | 완료 | Claude | main | 2026-10-02 |
| M1.2 | DSP 코어 ② FFT · 스펙트럼 | 완료 | Codex | main | 2026-10-02 |
| M1.3 | 공통 랩 UI | 완료 | Claude (M1.2와 병렬, D-021) | main | 2026-10-02 |
| M1.4 | 푸리에 기초 (P1-1, LAB-FOU-01) | 완료 (D-025·D-026 개편) | Claude / Antigravity | main | 2026-10-02 |
| M1.5 | 샘플링 · 에일리어싱 (LAB-SMP-01) | 완료 (D-025·D-026 개편) | Antigravity / Claude | main | 2026-10-02 |
| M1.6 | AAF · ADC (LAB-SMP-02, 03) | 완료 (D-025·D-026 개편) | Antigravity / Claude | main | 2026-10-02 |
| M1.7 | 분해능 · Smearing (LAB-RES-01, 02) | 완료 (D-025·D-026 개편) | Antigravity / Claude | main | 2026-10-02 |
| M1.8 | Zoom FFT (LAB-ZOOM-01) | 완료 (D-025·D-026 개편) | Antigravity / Claude | main | 2026-10-02 |
| M1.9 | 윈도우 라이브러리 | 완료 | Antigravity (M1.4와 병렬, D-021) | main | 2026-10-02 |
| M1.10 | 윈도우 랩 (LAB-WIN-01~03, P1-4) | 완료 (M1.T2 보완) | Antigravity / Claude | main | 2026-10-02 |
| M1.T | Part 1 전체 개편 (D-025 스토리텔링 & 랩 밀착형, 학교/현장 이분법 지양) | 완료 | Antigravity | main | 2026-10-02 |
| M1.T2 | Part 1 개편 ② (그림·미니 랩·개념 순서, D-026) | **완료** (P1-0 ~ P1-5, 사용자 확인 대기) | Claude | main | 2026-10-02 |
| M1.11 | 평균화 (LAB-AVG-01) | **완료** (M1.T2에서 본문 재작성·랩 연결) | Codex / Claude | main | 2026-10-02 |
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
