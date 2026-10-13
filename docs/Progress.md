# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 자기 트랙 절 맨 위에 1건, 트랙마다 **최근 2개**만 (넘치면 `archive/SessionLog.md` 맨 위로). 로그 1건 8줄 이내, 이 파일 **60줄 이하** (D-055).
> 구축 단계(M0 ~ M11)의 핸드오프·마일스톤 현황은 `archive/Handoffs.md`, 세부 표·회고는 `archive/Milestones.md` — 평소에는 읽지 않는다.

## 트랙 현황

| 트랙 | 담당 | 작업 폴더 | 지금 세부 | 상태 |
|---|---|---|---|---|
| **A** | Claude | `진동공부` | **M12 영어판·검색 노출** (D-054, Claude 단독) — M12.4 Part 2 완료(영어 12절) → 다음 M12.5 Part 5 | 진행 중 |
| **B** | Codex | 진동공부-Codex | 없음 (M0.15 완료) | 대기 |

- 사이트: https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포)
- M0 ~ M11 세부 완료. **사용자 확인 대기**: P1-1 ~ P11-3 전 페이지·랩·레퍼런스 허브, M0.15 모바일 그림.

## 핸드오프 — 공통
- **문서 보관 (2026-10-12, M0.16·D-055)**: `Curriculum.md` → `archive/`, Contents 개념 척추·기준값 → `archive/ContentsBuild.md`, Roadmap 세부 표 → `archive/Milestones.md` 끝, Progress 구축 핸드오프 → `archive/Handoffs.md`. 지금 기준은 페이지·코드·테스트·`Glossary.md`·`PageGuide.md`.
- **재사용 계산**: `lib/` 목록은 Roadmap §4-2 — 새 랩·그림은 있는 모듈부터 찾는다. 참고자료 **다음 번호 R-96** (`references.ts` 머리).
- **영어판 뼈대 (2026-10-12, M12.2·D-054) — 공용 코어 변경**: `BaseLayout`·`MdxLayout`이 주소(/en/)로 언어를 정함(html lang·hreflang·언어 전환 버튼·KO 표시). 홈·Part·랩 모음·랩 단독 페이지 본문은 `components/site/*`(lang prop)로 옮기고 `pages/`·`pages/en/`은 얇은 껍데기. `LabFrame`에 `lang`·`slug`, 공용 UI(읽음값·재생 막대·Plot·Polar)는 `ui/lang.tsx`의 LangContext로 문구를 고름. `Figure`·`Callout`·`References`는 영어 페이지에서 사전으로 옮김. 한국어 화면은 그대로. 만드는 법 PageGuide §13.
- **공용 코어 최근 추가**: `ui/Plot`의 `bands`(M10), `ResponsiveSvg`·`useMobileLayout`·QA `--visuals`/`--mobile-*`(M0.15, PageGuide §5-2).
- **함정**: 유효숫자 인자, 이론상 0 → 0 표시(hydration), MDX 함정 PageGuide §8. Node·gh는 PATH에 있음, Python 없음. rebase 충돌 때 다른 트랙의 행·절·로그는 origin 쪽 그대로 (I-026).

## 핸드오프 — 트랙 A (Claude)
- **M12.1 완료 (2026-10-12)**: sitemap(`/sitemap-index.xml`)·canonical·OG·JSON-LD·`/dev/` noindex(`lib/seo.ts`). **사용자 할 일**: Search Console 확인·sitemap 제출(소유 확인 태그는 `lib/site.ts`에 넣음), 네이버는 보류.
- **M12.2 완료 (2026-10-12)**: `src/i18n/`(경로·`ui.ts` 문구·`translate.ts` 사전·`lab.ts` tr/k·`routes.ts` 영어판 목록·`en/` 목차·랩 모음·그림·랩 사전), 영어 홈·Part 11·랩 모음·랩 3·**P2-3 전체**(본문·그림 8·SMP-01~03). 검사: `src/i18n/*.test.ts`(빠진 영어·감싸지 않은 한글·그림 사전), `npm run verify:i18n`(CI에 추가), `npm run i18n:status`. sitemap에 ko↔en 짝. 레퍼런스는 아직 한국어만(영어 메뉴에 KO 표시).
- **M12.3 완료 (2026-10-13)**: 영어 P2-3 · P2-5 · P4-2 · P5-6 · P6-3, 랩 13개(SMP·WIN·JEF·ENV·SK·ORB). 고침: Plot 범례 끝 잘림(Plotly 글꼴 이름), `translateDeep`이 Float64Array(그림 heatmap z)를 평범한 객체로 바꾸던 것. 확인법: 한·영 그림의 도형 수 비교(5절 모두 같음).
- **M12.4 완료 (2026-10-13)**: Part 2 전부(영어 P2-1 ~ P2-9), 랩 13개 더(BAS-02·FOU-01 셋·RES·ZOOM·AVG 둘·SPC 둘·UNIT·MOD·SBX). 등록은 `node scripts/i18n/register-lab.mjs <랩>`. `lib/`의 한국어 라벨(sandbox 판정·목적, orbit 모양)은 랩 안에서 `k()` 목록 + `tr`로 옮김 — `lib`의 글을 바꾸면 그 랩 사전도. 한국어 "준비 중" 남은 것 5곳 정리(P2-7·P2-8·P2-9·P8-2·P10-3).
- **다음 M12.5 ~**: Part 5 나머지(P5-1 ~ P5-5·P5-7) → 6 → 7 → 1 → 3 → 4 → 8 → 9 → 10 → 11. 방식 그대로: Sonnet 에이전트 4개 동시 + 끝나는 대로 다음, 지시문 `archive/TranslationBrief.md`, Claude가 등록·검사(그림 도형 수 한·영 비교 포함)·Part별 커밋.

## 핸드오프 — 트랙 B (Codex)
- 배정 없음. M0.15 모바일 그림 대응 완료(D-053), 사용자 모바일 검토 대기. 영어판(M12) 파일은 Claude 단독이라 건드리지 않는다.

## 세션 로그 — 트랙 A (Claude) · 최근 2개, 최신이 위

### 2026-10-13 · Claude · M12.4 Part 2 영어판 (Sonnet 에이전트 7개)
- 요청: 사용자 — "진행해보자 다음거"
- 산출: 영어 P2-1·P2-2·P2-4·P2-6·P2-7·P2-8·P2-9 + 그림 사전 7 + 랩 13개 변환·등록, `register-lab.mjs`, verify:i18n이 링크 주소(한국어 앵커)는 건너뜀
- 고침: 한국어 "준비 중" 5곳(이미 있는 페이지), Fourier 랩 위상 축 제목 잘림
- 검증: check 0·test 1335·빌드 210쪽·verify:i18n 영어 49쪽 한글 0·링크 7004개 문제 0·그림 도형 수 한·영 같음·verify:page 영어 9쪽 OK
- 다음: M12.5 Part 5 나머지
### 2026-10-13 · Claude · M12.3 시범 번역 4절 + 범례 잘림·heatmap 번역 버그
- 요청: 사용자 — "문제사항 고치고 다음 작업 진행" → 한도 끊김 뒤 "이어서", "단순 번역은 Sonnet subagent로"
- 산출: 영어 P2-5(직접 마무리)·P4-2·P5-6·P6-3, 랩 7개 변환·등록, 참고자료 서지 사전 전체, `scan-lab.mjs --check`, 번역 지시문
- 고침: Plot 범례 끝 잘림(한·영 공통), 영어 그림 heatmap 칸 사라짐(typed array), Orbit 선택 상자 문구 짧게
- 검증: check 0·test 1300·빌드 189쪽·verify:i18n 영어 28쪽 한글 0·링크 6450개 문제 0·verify:page 영어 4·한국어 1쪽 OK, P2-5는 깨끗한 worktree에서 따로 검증 후 push
- 다음: 사용자 시범 품질 확인 → M12.4 Part 2 (Sonnet 에이전트)
## 세션 로그 — 트랙 B (Codex) · 최근 2개, 최신이 위
### 2026-10-12 · Codex · M0.15 모바일 그림 대응 (D-053)
- 요청: 전체 모바일 그림 개선, PC 화면 유지. 640px 이하에만 별도 표시.
- 변경: Figure 모바일 그래프·범례/제목·확대, Plot 높이·눈금, 랩 여백·그리드·MCK 빈 공간, 가로 애니메이션 8종 세로 분할(원판 2개는 나란히). 계산·그림 데이터 유지.
- 검증: check 오류0·test1192·build157쪽·링크5080 문제0, 모바일15경로 × 3폭 넘침/조작 통과. PC96개: 93 픽셀·3 Plot 데이터/축/SVG 경로/좌표/선 스타일 동일.
- 핸드오프: 공용 ResponsiveSvg·useMobileLayout 추가, A 애니메이션은 태그만 연결. QA --visuals/--compare-desktop/--mobile-widths/--mobile-smoke/--desktop-only(PageGuide §5-2).
- 다음: 모바일 사용자 검토. 자세한 기록은 archive/Milestones.md §M0.15.
### 2026-10-12 · Codex · M10 규격·판정·진단 절차
- 요청: 사용자 — M10 진행. D-051 계획·척추·랩 사양 → M10.1(d01473f)·M10.2, 전체2/2 구현.
- 산출물: P10-1~3·그림19·LAB-ISO-01, 적용 범위/측정량·크기/변화·API 역할·가설/확인/보고·CAT. 규격 경계·표 전재 없음.
- 검토: SI 등호 오차·미관측을 지지로 쓴 표현·3점으로 폭을 암시한 캡션 수정. A M9.1 보존·P9-1 링크·참고자료 번호 충돌 해소.
- 최종 검증: check 오류0·test1069·build149쪽·링크4812 문제0·화면5경로 오류/넘침0·랩조작19항목씩. M10.1 Actions 성공, M10.2 push 후 확인.
- 다음: M10 페이지·랩 사용자 검토, M11.1~3의 범위·담당 확인 대기. 자세한 표·회고는 archive §M10.
