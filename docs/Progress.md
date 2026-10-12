# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 자기 트랙 절 맨 위에 1건, 트랙마다 **최근 2개**만 (넘치면 `archive/SessionLog.md` 맨 위로). 로그 1건 8줄 이내, 이 파일 **60줄 이하** (D-055).
> 구축 단계(M0 ~ M11)의 핸드오프·마일스톤 현황은 `archive/Handoffs.md`, 세부 표·회고는 `archive/Milestones.md` — 평소에는 읽지 않는다.

## 트랙 현황

| 트랙 | 담당 | 작업 폴더 | 지금 세부 | 상태 |
|---|---|---|---|---|
| **A** | Claude | `진동공부` | **M12 영어판·검색 노출** (D-054, Claude 단독) — M12.1 기본 검색 설정 | 진행 중 |
| **B** | Codex | 진동공부-Codex | 없음 (M0.15 완료) | 대기 |

- 사이트: https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포)
- M0 ~ M11 세부 완료. **사용자 확인 대기**: P1-1 ~ P11-3 전 페이지·랩·레퍼런스 허브, M0.15 모바일 그림.

## 핸드오프 — 공통

- **문서 보관 (2026-10-12, M0.16·D-055)**: `Curriculum.md` → `archive/`, Contents 개념 척추·기준값 → `archive/ContentsBuild.md`, Roadmap 세부 표 → `archive/Milestones.md` 끝, Progress 구축 핸드오프 → `archive/Handoffs.md`. 지금 기준은 페이지·코드·테스트·`Glossary.md`·`PageGuide.md`.
- **재사용 계산**: `lib/` 목록은 Roadmap §4-2 — 새 랩·그림은 있는 모듈부터 찾는다. 참고자료 **다음 번호 R-96** (`references.ts` 머리).
- **공용 코어 최근 추가**: `ui/Plot`의 `bands`(M10), `ResponsiveSvg`·`useMobileLayout`·QA `--visuals`/`--mobile-*`(M0.15, PageGuide §5-2).
- **함정**: 유효숫자 인자, 이론상 0 → 0 표시(hydration), MDX 함정 PageGuide §8. Node·gh는 PATH에 있음, Python 없음. rebase 충돌 때 다른 트랙의 행·절·로그는 origin 쪽 그대로 (I-026).

## 핸드오프 — 트랙 A (Claude)

- **M12 (D-054)**: 계획·완료 기준은 Roadmap §6-3. M12에서는 트랙 B 파일도 Claude가 고친다. 한국어가 원본, 영어는 `/en/`에 번역이 끝난 페이지만.
- **다음**: M12.1 기본 검색 설정.

## 핸드오프 — 트랙 B (Codex)

- 배정 없음. M0.15 모바일 그림 대응 완료(D-053), 사용자 모바일 검토 대기. 영어판(M12) 파일은 Claude 단독이라 건드리지 않는다.

## 세션 로그 — 트랙 A (Claude) · 최근 2개, 최신이 위

### 2026-10-12 · Claude · M12 계획(D-054) · M0.16 구축 단계 문서 보관(D-055)
- 요청: 사용자 — "검색이 잘되도록 영어도 … 기획" → 도메인은 안 삼·단계적·영어 이름 OK·Claude 단독, "구축 문서는 토큰 절약을 위해 아카이브로"
- 산출: D-054(영어판·검색 노출, I-031 종결)·D-055, Roadmap §6-3 M12 표. 문서 보관(위 공통 핸드오프), AGENTS 9.1 → 8.1 KB·Progress 25 → 약 5 KB, PageGuide·README·`curriculum.ts` 주석의 옛 경로 고침
- 다음: M12.1
### 2026-10-12 · Claude · M11.3 P11-3 복기 가이드 · 레퍼런스 정리 → M11 세부 완료
- 요청: 사용자 — "M11.2 진행해"(리밋 뒤 다른 세션이 M11.2를 마침, CI 성공 확인) → "M11.3 진행해"
- 산출: `lib/review/`(펄스·회전마다 nX·slow roll·캐스케이드, 합성 정지 기록 A·B), LAB-REV-01, P11-3(9절, 그림 6), 레퍼런스 허브(공식 Part 9 ~ 11·바로 가기·데이터셋 안내), M11 회고
- 고침: V 단위 CSV(gap DC −9.5 V)에서 1X가 틀림 — 한 바퀴 샘플 수가 정수가 아니어서 DC가 새던 것, 바퀴마다 평균을 빼고 테스트 추가
- 검증: check 0·test 1222·별도 outDir 빌드 161쪽·링크 5243개 문제 0·verify:page 7쪽 OK·브라우저로 CSV(V)·MAT 기록 올리기 → 합성 기록과 같은 값, 오류 0
- 다음: 배정 대기. 사용자 확인: P11-1 ~ P11-3·랩 3개·레퍼런스
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
