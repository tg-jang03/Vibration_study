# Progress — 진행 상황

> **매 세션 끝에 갱신한다** (AGENTS.md §3). 세션 로그는 자기 트랙 절 맨 위에 1건, 트랙마다 **최근 2개**만 (넘치면 `archive/SessionLog.md` 맨 위로). 로그 1건 8줄 이내, 이 파일 **60줄 이하** (D-055).
> 구축 단계(M0 ~ M11)의 핸드오프·마일스톤 현황은 `archive/Handoffs.md`, 세부 표·회고는 `archive/Milestones.md` — 평소에는 읽지 않는다.

## 트랙 현황

| 트랙 | 담당 | 작업 폴더 | 지금 세부 | 상태 |
|---|---|---|---|---|
| **A** | Claude | `진동공부` | **M12 영어판·검색 노출** (D-054) — M12.13 Part 10 완료 (영어 58절, Part 1 ~ 10 전부). 남은 것 Part 11 (지시 대기) | 진행 중 |
| **B** | Codex | 진동공부-Codex | **M12.11 Part 8 영어판 완료** (D-057, 영어 총 55절) — 다음 배정 대기 | 대기 |

- 사이트: https://tg-jang03.github.io/Vibration_study/ (push → GitHub Actions 검사·배포)
- M0 ~ M11 세부 완료. **사용자 확인 대기**: P1-1 ~ P11-3 전 페이지·랩·레퍼런스 허브, M0.15 모바일 그림.

## 핸드오프 — 공통
- **문서 보관 (2026-10-12, M0.16·D-055)**: `Curriculum.md` → `archive/`, Contents 개념 척추·기준값 → `archive/ContentsBuild.md`, Roadmap 세부 표 → `archive/Milestones.md` 끝, Progress 구축 핸드오프 → `archive/Handoffs.md`. 지금 기준은 페이지·코드·테스트·`Glossary.md`·`PageGuide.md`.
- **재사용 계산**: `lib/` 목록은 Roadmap §4-2 — 새 랩·그림은 있는 모듈부터 찾는다. 참고자료 **다음 번호 R-96** (`references.ts` 머리).
- **영어판 뼈대 (2026-10-12, M12.2·D-054) — 공용 코어 변경**: `BaseLayout`·`MdxLayout`이 주소(/en/)로 언어를 정함(html lang·hreflang·언어 전환 버튼·KO 표시). 홈·Part·랩 모음·랩 단독 페이지 본문은 `components/site/*`(lang prop)로 옮기고 `pages/`·`pages/en/`은 얇은 껍데기. `LabFrame`에 `lang`·`slug`, 공용 UI(읽음값·재생 막대·Plot·Polar)는 `ui/lang.tsx`의 LangContext로 문구를 고름. `Figure`·`Callout`·`References`는 영어 페이지에서 사전으로 옮김. 한국어 화면은 그대로. 만드는 법 PageGuide §13.
- **공용 코어 최근 추가**: `ui/Plot`의 `bands`(M10), `ResponsiveSvg`·`useMobileLayout`·QA `--visuals`/`--mobile-*`(M0.15, PageGuide §5-2). `Figure.astro` 모바일 제목 줄바꿈이 영어 낱말·숫자(`8.7|2 Hz`, `150 H|z`) 가운데서 자르지 않음(M12.6) — 한국어는 그런 제목이 있던 P1-5·P2-2·P2-9·P5-1·P5-7 모바일만 바뀜, PC 그대로.
- **함정**: 유효숫자 인자, 이론상 0 → 0 표시(hydration), MDX 함정 PageGuide §8. Node·gh는 PATH에 있음, Python 없음. rebase 충돌 때 다른 트랙의 행·절·로그는 origin 쪽 그대로 (I-026).

## 핸드오프 — 트랙 A (Claude)
- **M12.1 완료 (2026-10-12)**: sitemap(`/sitemap-index.xml`)·canonical·OG·JSON-LD·`/dev/` noindex(`lib/seo.ts`). **사용자 할 일**: Search Console 확인·sitemap 제출(소유 확인 태그는 `lib/site.ts`에 넣음), 네이버는 보류.
- **M12.2 완료 (2026-10-12)**: `src/i18n/`(경로·`ui.ts` 문구·`translate.ts` 사전·`lab.ts` tr/k·`routes.ts` 영어판 목록·`en/` 목차·랩 모음·그림·랩 사전), 영어 홈·Part 11·랩 모음·랩 3·**P2-3 전체**(본문·그림 8·SMP-01~03). 검사: `src/i18n/*.test.ts`(빠진 영어·감싸지 않은 한글·그림 사전), `npm run verify:i18n`(CI에 추가), `npm run i18n:status`. sitemap에 ko↔en 짝. 레퍼런스는 아직 한국어만(영어 메뉴에 KO 표시).
- **M12.3 완료 (2026-10-13)**: 영어 P2-3 · P2-5 · P4-2 · P5-6 · P6-3, 랩 13개(SMP·WIN·JEF·ENV·SK·ORB). 고침: Plot 범례 끝 잘림(Plotly 글꼴 이름), `translateDeep`이 Float64Array(그림 heatmap z)를 평범한 객체로 바꾸던 것. 확인법: 한·영 그림의 도형 수 비교(5절 모두 같음).
- **M12.4 · M12.5 완료 (2026-10-13)**: Part 2 전부(영어 P2-1 ~ P2-9, 랩 13개 더: BAS-02·FOU-01 셋·RES·ZOOM·AVG 둘·SPC 둘·UNIT·MOD·SBX), Part 5 전부(P5-1 ~ P5-7, 랩 9개 더: FLT·INT·STFT·XCH·FULL·ORD·FLT-02·CEP·FEAT). 등록은 `node scripts/i18n/register-lab.mjs <랩>`. `lib/`의 한국어 라벨(sandbox 판정·목적, orbit 모양, 주파수 지도)은 랩 안에서 `k()` 목록 + `tr`로 옮김 — `lib`의 글을 바꾸면 그 랩 사전도. 한국어 "준비 중" 5곳 정리(P2-7·P2-8·P2-9·P8-2·P10-3).
- **M12.6 · M12.8 ~ M12.10 완료 (2026-10-13)**: Part 1 전부(영어 P1-1 ~ P1-9), 랩 9개 더(MCK·BAS-01·DAMP·FRC·2DOF·SUP·UNB·FMAP·SRC). 용어: **박자 = "rhythm"**, "beat"는 맥놀이만 (지시문에 적음). 앞서 만든 영어 페이지의 옛 한국어 링크(절·랩에 영어판이 새로 생긴 것)는 `node scripts/i18n/relink.mjs`, 남은 것은 `i18n.test.ts`가 잡는다. **M12.8**: Part 4 전부(영어 P4-1 · P4-3 · P4-4, P4-2는 M12.3), 랩 3개 더(AF·SCL·STB). P4-1 그림 1·4 ~ 6 캡션은 한국어처럼 MDX에 직접 적음(한국어가 그림 번호를 바꿔 씀) — 그림 숫자를 바꾸면 영어 MDX 캡션도. `verify:page`의 `--centerline-smoke`·`--stability-smoke`는 한국어 라벨로 값을 읽어 영어 랩에서는 실패 → 한국어 쪽으로 확인. 한·영 공통으로 남은 겹침(P4-1 Polar 라벨, P4-3 그림 2 W↓·hmin)은 원래 그림 문제라 손대지 않음. **M12.9**: Part 6 전부(영어 P6-1 · P6-2 · P6-4, P6-3은 M12.3), 랩 3개 더(TWF·WF·TRND). `lib/plots`의 한국어 라벨(waveform·cascade·trend)도 OrbitLab처럼 랩 안 `k()` 사본 + `tr` — lib 글을 바꾸면 랩 사본·사전도. **M12.10**: Part 7 전부(영어 P7-1 ~ P7-9), 랩 13개 더(MAP·FAULT·RPM·1X·NL·SUB·BRG 둘·GEAR 둘·ELEC·FLOW·CAMP). 결함 목록(`lib/faults/catalog.ts`)은 사본 대신 `src/i18n/en/faults.ts`(결함 ID별 영어, `faultText`·`familyLabel`·`spotLabel`, 테스트가 빠진 필드·한글을 잡음) — P11 CaseLab도 이것을 쓴다. `verify:page --anim-smoke`는 애니메이션 없는 페이지에서 FAIL로 찍힘(무시). **M12.12**: Part 9 전부(영어 P9-1 ~ P9-3), 랩 3개 더(HPB·BAL·ALN). `lib/fieldwork`의 한국어(해머 팁, 불평형 사례, `balance()`의 런 이름)도 랩 안 `k()` 사본 + `tr` — 런 이름처럼 화면에 `tr(q.label)`로만 나오는 글은 `void` 목록(SandboxLab의 `LIB_TEXT`처럼). **M12.13**: Part 10 전부(영어 P10-1 ~ P10-3), 랩 3개 더(ISO·SM·DIAG). `lib/assessment`의 `TRUTH_LABEL`도 랩 안 `k()` 사본. 규격 값을 새로 옮기지 않았는지(I-009)는 한국어에 없는 숫자가 영어 본문·사전에 있는지로 대조(0). `--severity-smoke`는 한국어 쪽에서 확인.
- **다음**: Part 11만 남음(M12.14, 지시 대기 — P11 CaseLab은 `i18n/en/faults.ts` 사용). Part마다 파일별 병렬 번역(`archive/TranslationBrief.md`, 링크할 영어판 목록을 과제에 적는다) → `scan-lab --check` ✓ → `register-lab.mjs` → 다 되면 `relink.mjs` → check·test·build·`verify:i18n`·`verify:links`·그림 비교·`verify:page` → 커밋·push·Actions.
  - 그림 비교: 한·영 도형 수는 `<text>`를 빼고 같아야 한다 (영어 제목이 모바일 사본에서 줄이 더 늘어 글 수는 다름). 미리보기: 10-08에 띄운 옛 `astro preview`(4337)가 새 파일을 404로 내고 `--force`로도 안 바뀜 → dist를 내보내는 작은 정적 서버 + `--base`. Git Bash에서는 `MSYS_NO_PATHCONV=1 npm run verify:page -- …`(아니면 `/en/…`이 Windows 경로로 바뀜). 미뤄 둔 것: 영어 제목의 대소문자(Title Case·문장형) 섞임 — M12 끝에 한꺼번에.

## 핸드오프 — 트랙 B (Codex)
- **M12.7 완료 (2026-10-13, D-056)**: Part 3 본문 5절·그림 36개·랩 6개와 애니메이션 3개 영어화, 이전 영어 링크 5곳 갱신. 공용 `Figure.astro`는 영어 모바일 세로 기준선 라벨이 오른쪽에 안 들어가면 왼쪽으로 배치(문구·숫자 유지, 한국어·PC 그대로).
- **M12.11 완료 (2026-10-13, D-057)**: 영어 P8-1 ~ P8-5·그림 39개·BODE/ST/GT/GEN 랩 4개. Trend·GearTsa는 A 지원을 lang="en"으로 사용, lib 라벨은 랩 안 k() 사본 + tr(원문 변경 시 사본·사전도). 영어 Bode 범례·Polar 라벨 축약, 한·영 공통 P8-1 그림4의 1500 rpm 라벨 y만 이동. 739468e의 GearTsa 등록 확인, Part 9(7d9a800) 반영 뒤 rebase·공유 등록 양쪽 보존·relink 7곳. 원문 P8-3 그림4 캡션의 상·하향 화살표와 실제 상향만 있는 도형 차이는 미수정.

## 세션 로그 — 트랙 A (Claude) · 최근 2개, 최신이 위
### 2026-10-13 · Claude · M12.13 Part 10 영어판 (Sonnet 에이전트 3개)
- 요청: 사용자 — 위 M12.12와 같은 지시의 뒤 절반 (Part 10)
- 산출: 영어 P10-1 ~ P10-3 + 그림 사전 3 + 랩 3개(Severity·SeparationMargin·Diagnosis) 변환·등록, Part 8 영어판(e2ea243) 위로 rebase(공유 등록 양쪽 보존) 뒤 relink 3곳(P10-1 → P8-4·P8-5, P10-2 → P8-1)
- 고침: 영어만 넘친 그림 라벨 6곳 줄임(P10-1 그림 5 알람, P10-2 그림 2·6, P10-3 그림 2·5·6), P10-1 그림 5 캡션 문장
- 검증: check 0·test 1498·빌드 309쪽·verify:i18n 영어 148쪽 한글 0·링크 10005개 문제 0·P9·P10 그림 도형 수 같음·영어에만 있는 숫자 0·verify:page 영어 7쪽 OK(모바일 3폭)·severity smoke 한국어 14항목 OK·한·영 PC 캡처 비교
- 다음: M12.14 Part 11 (지시 대기). 미룬 것: 영어 제목 대소문자 통일(M12 끝)
### 2026-10-13 · Claude · M12.12 Part 9 영어판 (Sonnet 에이전트 3개, Part 7 세션과 같은 폴더에서 동시)
- 요청: 사용자 — "M12 영어판 이어서: Part 9(M12.12) → Part 10(M12.13)"
- 산출: 영어 P9-1 ~ P9-3 + 그림 사전 3 + 랩 3개(Impact·Balance·Alignment) 변환·등록. 영어 쪽에서 Part 9로 가는 옛 링크 없음(relink 0곳)
- 고침: 영어만 넘친 2곳 줄임(정렬 랩 y축 제목, P9-2 그림 6 모드 세트 라벨), BalanceLab 런 이름 찾기를 `tr(q.label)`로 단순화
- 검증: check 0·test 1476·빌드 294쪽(스크래치 outDir)·verify:i18n 영어 133쪽 한글 0·링크 9432개 문제 0·P9 3절 그림 도형 수 같음·verify:page 영어 7쪽 OK(모바일 3폭)·한·영 PC 캡처 38쌍 비교
- 다음: M12.13 Part 10 (번역 끝, 검사 중)
## 세션 로그 — 트랙 B (Codex) · 최근 2개, 최신이 위
### 2026-10-13 · Codex · M12.11 Part 8 영어판
- 산출: 영어 본문 5절·그림 사전 5·랩 4개(205키) 변환·등록, Trend·GearTsa는 영어 prop만 사용.
- 고침: 영어 Bode 범례·Polar 라벨 축약, P8-2 U tip 축약, 양쪽 언어 P8-1 그림4 라벨 위치; Part 7의 옛 P8 링크 7곳 relink.
- 검증: check 오류0·test1489·build303쪽·영어142쪽 한글0·링크9785 문제0·그림39개 도형 수 일치·본문 수식 보존.
- 화면: 영어9쪽 × 모바일360/390/430px 오류·넘침0, 한국어4랩 smoke56항목 통과; 최초 기존 회전수 추정 테스트1건 실패는 단독·전체 재실행 통과.
### 2026-10-13 · Codex · M12.7 Part 3 영어판
- 요청: 사용자 — "part3 부터 진행"; 단순 번역은 낮은 추론 강도로 전환.
- 산출: 영어 P3-1 ~ P3-5·그림 사전 5·랩 6개와 애니메이션 3개, 영어 랩 등록·기존 링크 5곳 갱신·P3-4 설명 번역 보완. 한국어 원본·계산 유지.
- 검증: check 0·test 1408·build 254쪽·i18n 영어 93쪽 한글 0·링크 8248개 문제 0·한국어 초기 화면 11경로 같음·그림 36개 도형 수 같음.
- 화면: 영어 13경로·모바일 360/390/430px 오류·넘침 0, 확대·재생 통과. 한국어 PC 캡처 90개 픽셀 동일(텍스트 노드 경계도 유지).
- 다음: Part 3 커밋·push 후 Actions 확인, Part 4 지시 대기.
