# Contents — 사이트 콘텐츠 목록 & 사양

> 사이트에 실제로 들어가는 페이지, 랩, 기호·수식, 검증값, 참고자료의 **단일 목록**이다. 구현하기 전에 여기에 사양을 먼저 쓰고, 진행에 따라 상태를 갱신한다.
> 무엇을 가르치는지(학습 목표, 내용, 과제)는 `Curriculum.md`, 어떻게 구현하는지(조작, 출력, 검증값)는 이 문서에 있다.
> 원본 커리큘럼: `source/curriculum.md` (읽기 전용). 원본과 달라진 내용은 `Issues.md`(유형: 콘텐츠)에 근거와 함께 기록한다.
> **읽는 법 (D-030)**: 통째로 읽지 않는다. `grep -n "^##" docs/Contents.md`로 목차를 보고 필요한 절만 읽는다 — 개념 척추 §1-2, 기호·식 §3, 페이지 상태 §4, 그 랩의 사양 §5(`grep -n "LAB-XXX"`), 기준값 §6.

## 0. 상태 표기

`계획`(Curriculum.md에 개요만 있음) → `사양`(이 문서에 구현 사양 작성) → `구현중` → `검토` → `완료`

## 1. 페이지 작성 기준 (D-025 톤 + D-026 그림·개념 순서 + D-028 지침서)

> **작성 방법(톤, 뼈대, 그림, 강조 상자, 랩 배치, 수식, 체크리스트)은 `docs/PageGuide.md`가 기준이다** (D-028, 2026-10-06). 기준 페이지는 P1-0 ~ P1-4.
> 이 절에는 콘텐츠별 기준인 **§1-2 개념 척추**만 둔다. 아래 1-1·1-3·1-4·1-5는 옛 참조가 끊기지 않도록 남긴 자리표시다.

### 1-1. 독자와 톤 → `PageGuide.md` §1

### 1-2. 개념 순서 규칙 (가장 중요)

1. 페이지는 **앞 페이지까지 설명한 개념만** 쓴다. 뒤에서 다룰 개념이 꼭 필요하면 한 줄로 풀고 "(P1-4에서 자세히)"처럼 위치를 밝힌다.
2. 처음 나오는 전문용어는 그 자리에서 한 줄로 푼다 — 괄호 풀이 또는 `용어 풀이` 상자. 영문 병기(D-005).
3. 진단 용어(오일 휠, GMF, BPFI, 러브, 2LF 등)를 예로 쓸 때도 무엇인지 한 줄로 푼다. 풀기 어려우면 예로 쓰지 않는다.
4. 개념 척추 — 각 페이지는 이 순서를 지킨다. Part 0이 먼저이고, Part 1은 Part 0 위에 쌓는다 (D-027).

**Part 0 개념 척추** (기준 독자: 고교 물리 F = ma, 미분 = 변화율)

| 페이지 | 새로 도입하는 개념 | 기대고 있는 개념 |
|---|---|---|
| P0-1 | 진동(왕복 운동), 평형 위치, 복원력 F = −kx·강성 k, 관성, 변위 x(t), 끝점·평형점, 주기 T, 위치·운동 에너지 교환(맛보기) | 고교 물리 (F = ma), 미분 = 변화율 |
| P0-2 | 운동방정식 m ẍ + kx = 0, 정현파 해, 진폭 A·주파수 f·위상 φ, ω = 2πf, 고유진동수 f_n = √(k/m)/2π, 초기조건 x₀·v₀, 속도·가속도와 위상 관계(90°씩 앞섬) | P0-1 |
| P0-3 | 감쇠·감쇠 계수 c, 감쇠비 ζ, 부족·임계·과감쇠, 포락선 e^{−ζω_n t}, 감쇠 고유진동수 ω_d, 대수감쇠율 δ(맛보기) | P0-2 |
| P0-4 | 가진력 F₀ cos ωt, 과도 응답 vs 정상상태 응답, 진동수비 r, 진폭비 X/X_st, 위상 지연 0° → 90° → 180°, 공진·Q ≈ 1/(2ζ), 주파수응답(FRF)·Bode 선도, 맥놀이(맛보기) | P0-2, P0-3 |
| P0-5 | 자유도, 2자유도계·연성, 고유진동수 2개, 모드 형상(동상·역상), 중첩, 연속체의 많은 모드 | P0-2, P0-4 |
| P0-6 | rpm·f = rpm/60·Ω, 불평형 m_u·e, 원심력 m_u e Ω², 회전하는 힘 = 주기 가진, 1X, 임계속도, 런업, 진폭·위상 vs rpm | P0-4, P0-5 |
| P0-7 | 세는 규칙(한 바퀴에 k번 → k·f_r), 하모닉(2X·3X), 날개 통과 N_b·f_r, 기어 맞물림 z·f_r·회전수비, 구름베어링 FTF·BPFO·BPFI(근사, 정수배가 아님), 충격 → 구조 고유진동수 울림(kHz), 유막 0.38 ~ 0.48X, 벨트, 2 f_L, 회전 관련 vs 고정, 관심 주파수 구간 4개 (D-032) | P0-2 ~ P0-4, P0-6 |
| P0-8 | 여러 원인의 합(1X·2X·날개 통과·구조 공진·잡음), 순문제 vs 역문제, 증거 5요소, "다시 나누려면?" (스펙트럼 동기) | P0-1 ~ P0-7 |

**Part 1 개념 척추**

| 페이지 | 새로 도입하는 개념 | 기대고 있는 개념 |
|---|---|---|
| P1-0 | 시간파형·측정량과 단위·측정 기준, 차수·서브싱크로너스, Peak·Pk-Pk·RMS·DC·CF, 스펙트럼 vs FRF, 샘플·f_s·Δt·N·T·Δf·f_N, 에일리어싱(맛보기). 정현파·d·v·a·1X의 물리는 P0-2·P0-6에서 가져와 짧게 되짚기만 한다 (M2.9) | Part 0 (P0-1 ~ P0-8) |
| P1-1 | 하모닉·푸리에 급수, 상관(내적), DFT·bin, 진폭/위상 스펙트럼, 단일측, 제로패딩, FFT | P1-0 |
| P1-2 | 나이퀴스트 상세, 에일리어스 주파수, AAF, F_max·2.56·LOR, ADC·비트·양자화·클리핑 | P1-0, P1-1 |
| P1-3 | Δf = 1/T 상세, 두 성분 분리, smearing, Zoom FFT (윈도우 없이 설명) | P1-1, P1-2 |
| P1-4 | 누설, 윈도우, 메인로브·사이드로브, 보정계수(ACF·ECF·ENBW) | P1-3 |
| P1-5 | 잡음의 흔들림, 평균 방식(선형·지수·피크 홀드·벡터), 오버랩, TSA(빗살 통과 특성 ∣H∣, 기어 맞물림 주파수, Residual) | P1-4 |
| P1-6 | 라인 수와 잡음 바닥(bin = Δf 폭의 바구니), 파워 스펙트럼, PSD·ASD, 대역 RMS(overall)와 ENBW로 나누기, derived peak(√2 × RMS) vs true peak, 단위 관례(µm pp·mil·mm/s rms·in/s pk·g)와 정현파 환산, dB(진폭 20 log·파워 10 log)·기준값, 로그 축 | P1-0 ~ P1-5 |
| P1-7 | 반송파·변조 주파수·변조 지수 m·포락선, AM → 측대역 f_c ± f_m(높이 m/2), 측대역 간격 = 원인 주파수, 짧은 변조 → 측대역 여러 쌍, FM·β·베셀 함수 Jₙ(β), AM + FM 비대칭, 맥놀이와 AM 구별 | P1-1(펄스열), P1-3(맥놀이·측대역 소개·분해능), P1-4, P1-5(기어 맞물림), P1-6(dB) |
| P1-8 | 설정을 정하는 순서(목적 → F_max → 라인 수 → T → 윈도우 → 평균 → 표시 → 확인), 최소 간격 ÷ 3.5로 라인 수 계산, F_max 위 성분과 AAF 점검, 목적별 출발점(예시값, I-014), 결과 확인표, 1X보다 낮은 성분(0.4 ~ 0.5X, 소개) | P1-0 ~ P1-7 |

**Part 2 개념 척추** (D-031, 2026-10-06)

| 페이지 | 새로 도입하는 개념 | 기대고 있는 개념 |
|---|---|---|
| P2-1 | 센서 세 종류(비접촉 변위·속도·가속도)와 재는 양(상대·절대), 감도(mV/g 등), 센서 = 기초가진 1자유도 계(질량·스프링이 든 통), 가속도계(r ≪ 1)·속도계(r ≫ 1)의 평탄 대역, 마운팅 공진, GT/ST에서 비접촉 변위 센서를 주로 쓰는 이유 | P0-4(공진·진폭비·위상 지연), P1-0(변위·속도·가속도), P1-2(대역·AAF), P1-6(단위) |
| P2-2 | 프로브 시스템(프로브·케이블·드라이버), gap 전압·감도·선형 범위, DC = 평균 위치·AC = 진동, 런아웃(기계적·전기적), X-Y 배치 | P2-1 |
| P2-3 | 키페이저(1회전 1펄스 → 회전수·각도 기준), 위상 = 지연각 φ = 360°·Δt/T(1X 성분으로, 동기 샘플링 DFT·트래킹 필터는 이름만), 관례(앞섬각 −φ·영점 기준 φ − 90°, 센서 종류·설치 각도), 1X 벡터 A∠φ = Ae^{−jφ}, Polar 플롯(0° = 센서, 지연 = 회전 반대, high spot은 이름만), 런업의 Bode vs Polar, Slow roll 보상(벡터 빼기, 구간 고르기), 위상차 진단(X-Y → 오빗 원·직선, 두 베어링 동상·역상 → 병진·원추, 정적·커플 불평형, 커플링 축방향 180° → 정렬 불량) | P2-2, P1-1(DFT 위상), P1-4(누설), P1-5(화살표·트리거), P0-2(속도·가속도 위상), P0-4(위상 지연), P0-5(동상·역상), P0-6(Bode) |
| P2-4 | 측정 체인(마운팅 → 센서 → 케이블 → 전원 → 분석기 입력 → 계산)과 단계별 가짜 신호: 설치·센서 공진 봉우리(넓고, 회전수를 따라가지 않음), IEPE·바이어스 전압(정상·끊김·합선)·AC 결합·정착 시간, ski-slope(v = a/2πf로 낮은 주파수가 부풂, 원인: 정착·열 충격·충격 뒤 회복·케이블), 그라운드 루프(60 Hz와 홀수배, 접지 분리), 케이블·커넥터 잡음(마찰전기는 이름만), 입력 넘침(클리핑 → 정수배 막대), 확인 습관(바이어스·시간파형·넘침 표시·지난 측정·다른 센서) | P2-1(설치 공진), P2-2, P1-2(클리핑·양자화), P1-3·P1-8(분해능), P1-6(v = a/2πf, overall), P0-7(회전 관련 vs 고정, 2f_L) |
| P2-5 | 정상상태 vs 과도 수집, Δt 트리거 vs Δrpm 트리거(임계 구간을 놓침), 동기 샘플링 → 차수 스펙트럼(스미어링 없음), 런업 그림(Bode·Polar·Cascade·Shaft centerline), 기계 보호 시스템(채널 구성: X·Y·축 방향 위치·키페이저·케이싱), Alert·Danger·트립·헛트립, 시간 지연, 보팅(1oo1·1oo2·2oo2), 기동 중 트립 배율, Danger bypass, 보호 vs 상태감시 | P2-2(gap·Not OK), P2-3(키페이저·1X 벡터·직선 오빗), P2-4(튐·센서 이상), P1-3(스미어링·차수 추적 소개), P1-5(차수 스펙트럼), P0-6(임계속도·런업) |

**Part 4 개념 척추** (D-034·D-036, 2026-10-06 — 트랙 B가 M5에서 쓴다)

| 페이지 | 새로 도입하는 개념 | 기대고 있는 개념 |
|---|---|---|
| P4-0 | 구동기/피동기·모터/로터/고정자·축/커플링/축계, 베어링의 방식(구름/유막)과 하중 방향(반경/추력), 하우징/받침대/기초, 횡/축/비틀림 운동, 구성 → MCK 대응, 무질량 직렬 강성 예제 | P0-1~P0-5. P0-7의 요소 주파수는 다시 계산하지 않고 Part 2의 측정·Part 6의 결함과 경계를 둔다 |
| P4-1 | 불평형 응답의 Bode(1X 진폭·위상 vs rpm)와 Polar(1X 벡터 궤적), heavy spot vs high spot, 증폭계수 AF = N_c/(N₂ − N₁) ≈ 1/(2ζ)·Half-power, 분리여유 SM(개념, 규격 수치 없음), 런업 데이터의 오차(rpm 간격·잡음·런아웃) | P4-0, P0-4, P0-6, P2-3(1X 벡터·위상 관례, §3) |
| P4-2 | 자전/선회·강체 병진/기울기와 축 굽힘 도입 → Jeffcott 로터(원판 + 탄성축), 복소 좌표 z = x + jy, 정방향 동기 선회·원형 오빗, 비등방 지지 → 타원 오빗·임계속도 2개·역방향 선회, 정/역 성분 A_f·A_b(페이지에서 직접 계산 — Full spectrum P3-4는 아직 없다), 강성/유연 로터 | P4-0, P0-5, P0-6, P4-1, P1-1(복소 표현) |
| P4-3 | 유막의 압력 생성·하중 지지 → 저널 베어링(간극·편심률·자세각), 유막 계수(K_xx … C_yy)와 교차연성 k_xy·접선력, Oil whirl(≈ 0.42 ~ 0.48X)·whip(1차 임계에 잠김), 복소 고유치 λ = σ ± jω_d·불안정(σ > 0), Log decrement, 안정 한계(k_xy = 2ζk, k_xy = cΩ/2 모델 → Ω = 2ω_n), Campbell 선도(개념) | P4-0, P0-3, P0-7(기름막 0.38 ~ 0.48X), P4-2 |

### 1-3. 그림 · 강조 상자 · 랩 배치 → `PageGuide.md` §5 · §6

### 1-4. 페이지 구성 → `PageGuide.md` §3 · §4

### 1-5. push 전 체크리스트 → `PageGuide.md` §11

## 2. 랩 사양 템플릿

```
#### LAB-XXX-00 이름
- 페이지 · 마일스톤 · 상태
- 목적: 이 랩으로 무엇을 체감하나 (1문장)
- 신호: SignalSpec 기본값
- 조작: 컨트롤 (범위, 기본값)
- 출력: 플롯, 읽음값
- 수식: 살아있는 수식 (§3 기호)
- 실험 과제: 예측 → 확인
- 검증: 단위테스트로 확인할 값 (§6)
```

구현할 때는 `LabFrame`의 칸에 그대로 대응시킨다: 조작 → `controls`, 출력(플롯) → children, 수식 → `formulas`, 읽음값 → `readouts`(`ReadoutTable`), 실험 과제 → `tasks`(질문 + 접힌 확인).

## 3. 공통 기호·수식 표기 (단일 기준)

| 기호 | 의미 | 단위 | 비고 |
|---|---|---|---|
| f_s | 샘플링 주파수 | Hz | f_s = 2.56 F_max |
| F_max | 분석 최대 주파수 | Hz | |
| f_N | 나이퀴스트 주파수 | Hz | f_N = f_s / 2 |
| LOR | 분해능 라인 수 (Lines of Resolution) | — | 100, 200, 400, 800, 1600, 3200, 6400 |
| N | 프레임 샘플 수 | — | 패딩이 없으면 FFT 크기와 같음. N = 2.56 LOR (LOR 400 → N 1024) |
| N_FFT | 제로패딩 후 FFT 크기 | — | N_FFT ≥ N, 2의 거듭제곱. 패딩이 없으면 N_FFT = N |
| T | 프레임 길이 (측정 시간) | s | T = N / f_s = 1 / Δf |
| Δf | 주파수 분해능 (bin 간격) | Hz | Δf = f_s / N = F_max / LOR |
| n, k | 시간 샘플 / 주파수 bin 인덱스 | — | |
| δ | 톤의 bin 오프셋 | bin | f = (k₀ + δ) Δf |
| x(t) | 참(연속) 신호 — 정현파 성분은 A·cos(2π f t + φ) | SI | A: 피크 진폭, φ: 위상 [rad]. 모든 랩 공통 (M1.1, `lib/dsp/signal.ts`) |
| x[n] | 샘플된 신호 | SI | |
| w[n] | 윈도우 (주기형, DFT-even) | — | n = 0 … N−1 |
| X[k] | 윈도우를 적용한 DFT | | X[k] = Σ w[n] x[n] e^(−j2πkn/N) |
| S₁, S₂ | 윈도우 합 / 제곱합 | — | S₁ = Σ w[n], S₂ = Σ w[n]² (R-05 표기) |
| CG | 코히어런트 이득 (Coherent Gain) | — | S₁ / N |
| ACF | 진폭 보정계수 | — | N / S₁ = 1 / CG |
| ECF | 에너지(잡음) 보정계수 | — | √(N / S₂) |
| ENBW | 등가잡음대역폭 | bin | N·S₂ / S₁² (Hz 단위는 × Δf) |
| b | ADC 비트 수 | bit | |
| M | 평균 횟수 | — | |
| r | 오버랩 비율 | — | 0, 0.5, 0.75 |
| α | 지수 평균 가중치 | — | α = 1 / M |
| f_c, f_m | 반송파 / 변조 주파수 | Hz | |
| m, β | AM 변조 지수 / FM 변조 지수 | — | |
| f_r, 1X | 회전 주파수 | Hz | f_r = rpm / 60 |
| z | 기어 잇수 | — | 맞물림 f_GM = z f_r (P0-7) |
| N_b | 날개 수 | — | 날개 통과 f_BP = N_b f_r |
| N_r, d, D | 구름베어링 볼(구름요소) 수 / 볼 지름 / 피치 지름 | —, m, m | 접촉각은 P6-4에서 (지수 평균 α와 기호 구분 필요) |
| f_L | 전원 주파수 | Hz | 60 Hz. 전자기력 2 f_L |
| θ | 축 회전 각도 | rad | 키페이저 기준 |
| N_c, N_n | 임계속도(피크 회전수) / 고유 회전수 | rpm | |
| S | 비접촉 변위 센서 감도 | V/m (표시 V/mm) | 예 7.87 V/mm = 200 mV/mil (P2-2) |
| z | 복소 변위 x + jy | m | Jeffcott·안정성 (P4-2, P4-3) |
| A_f, A_b | 정방향 / 역방향 선회 성분 | m | z = A_f e^{jΩt} + A_b e^{−jΩt} (P4-2) |
| k_xy | 교차연성 강성 | N/m | 유막·씰 (P4-3) |
| λ = σ ± jω_d | 복소 고유치 | 1/s | σ > 0이면 불안정 (P4-3) |
| ζ | 감쇠비 | — | |
| k_eq, k_sh, k_br, k_sup | 직렬 예제의 등가 / 축 / 베어링 / 지지 강성 | N/m | P4-0 한 방향·무질량 연결 예제. k_br은 한 경로의 등가 값, 실제 두 베어링 일반식이 아님 |
| AF | 증폭계수 (Amplification Factor) | — | |
| G_xy | 교차 스펙트럼 | | |
| γ² | 코히어런스 | — | 0~1 |

**신호 성분** (`SignalSpec`, `src/lib/dsp/signal.ts`): `sine`(f, A, φ), `harmonics`(f₀, 차수별 A·φ), `noise`(백색 가우시안, rms, seed) — M1.1, `chirp`(선형 처프, 런업·코스트다운) — M1.7, `impulses`(감쇠 임펄스열: 반복 주파수, 울림 주파수, 시정수, 첫 충격 시각 — 기어 이빨 결함 충격) — M1.12. `modulated`(반송파·변조 주파수·AM 지수 m·FM 지수 β·둘 사이 위상차 — AM, FM, AM + FM) — M1.14.

**핵심 식 (KaTeX 원문)** — 페이지와 랩은 이 표기를 그대로 쓴다.

- 나이퀴스트: `f_N = \dfrac{f_s}{2}`
- 에일리어스 주파수: `f_a = \left| f - k f_s \right|,\quad k = \operatorname{round}(f / f_s)`
- ADC 양자화 SNR (풀스케일 정현파): `SNR \approx 6.02\,b + 1.76\ \mathrm{dB}`
- 분해능 3식: `\Delta f = \dfrac{F_{max}}{\mathrm{LOR}},\quad T = \dfrac{1}{\Delta f},\quad N = 2.56\,\mathrm{LOR}`
- DFT: `X[k] = \sum_{n=0}^{N-1} w[n]\,x[n]\,e^{-j 2\pi k n / N}`
- 단일측 피크 진폭: `A_k = \dfrac{2\,|X[k]|}{S_1}` (0 < k < N/2. k = 0과 N/2에는 2를 곱하지 않음)
- 파워 스펙트럼 (rms²): `PS_k = \dfrac{2\,|X[k]|^2}{S_1^2}`
- PSD: `PSD_k = \dfrac{2\,|X[k]|^2}{f_s\,S_2} = \dfrac{PS_k}{\mathrm{ENBW}\cdot\Delta f}`
- 윈도우 계수: `CG = \dfrac{S_1}{N},\; ACF = \dfrac{N}{S_1},\; ECF = \sqrt{\dfrac{N}{S_2}},\; \mathrm{ENBW} = \dfrac{N S_2}{S_1^2}`
- 지수 평균: `\bar S_m = (1-\alpha)\,\bar S_{m-1} + \alpha\, S_m`
- 오버랩 총 측정시간: `T_{tot} = T\,[\,1 + (M-1)(1-r)\,]`
- ASD: `ASD_k = \sqrt{PSD_k}` (단위 mm/s/√Hz)
- 대역 RMS (overall): `\sqrt{\dfrac{\sum_k PS_k}{\mathrm{ENBW}}} = \sqrt{\sum_k PSD_k\,\Delta f}` (k는 대역 안의 bin, ENBW는 bin 단위)
- derived peak: `\sqrt 2\,A_{rms}` (정현파 하나일 때만 true peak와 같다)
- 파워 평균 흔들림 (dB, 경험칙): `\approx 4.34/\sqrt{M}`
- TSA: `\bar x(\theta) = \dfrac{1}{M}\sum_{m=0}^{M-1} x(\theta + 2\pi m)`
- TSA 비동기 성분 이득: `|H(f)| = \left| \dfrac{\sin(\pi M f / f_r)}{M \sin(\pi f / f_r)} \right|`
- dB: `L = 20\log_{10}(A / A_{ref})`
- 정현파 진폭 관계 (정현파일 때만 성립): `A_{rms} = \dfrac{A_{pk}}{\sqrt 2},\quad A_{pp} = 2 A_{pk}`
- Crest factor: `CF = \dfrac{A_{pk}}{A_{rms}}`
- 변위·속도·가속도 (정현파): `v = 2\pi f\, d,\quad a = (2\pi f)^2 d`
- AM: `(1 + m\cos 2\pi f_m t)\cos 2\pi f_c t` → 측대역 f_c ± f_m, 진폭 m/2
- FM: `\cos(2\pi f_c t + \beta\sin 2\pi f_m t) = \sum_n J_n(\beta)\cos 2\pi(f_c + n f_m)t`
- 맥놀이: `\cos 2\pi f_1 t + \cos 2\pi f_2 t = 2\cos\pi(f_1 - f_2)t\,\cos\pi(f_1 + f_2)t`
- 증폭계수 (Half-power): `AF = \dfrac{N_c}{N_2 - N_1} \approx \dfrac{1}{2\zeta}` (N₁, N₂: 피크 진폭의 0.707배 지점, I-004)
- 1자유도 불평형 응답: `\dfrac{X}{m_u e / M} = \dfrac{r^2}{\sqrt{(1-r^2)^2 + (2\zeta r)^2}},\quad \phi = \operatorname{atan2}(2\zeta r,\ 1-r^2),\quad r = \dfrac{N}{N_n}`
- Log decrement: `\delta = -\dfrac{2\pi\sigma}{\omega_d} \approx 2\pi\zeta`
- 지지 강성 직렬 예제(P4-0): `\dfrac{1}{k_{eq}} = \dfrac{1}{k_{sh}} + \dfrac{1}{k_{br}} + \dfrac{1}{k_{sup}}`, `f_n = \dfrac{1}{2\pi}\sqrt{\dfrac{k_{eq}}{m}}` (연결부 질량 무시, 같은 힘, 각 변형 합의 가정)
- 1X 벡터와 Slow roll 보상: `\vec V = A\,e^{-j\phi}`, `\vec V_c = \vec V - \vec V_{sr}`
- **위상 관례 (P2-3·P4-1·P5-5 공통, D-034)**: 위상 φ는 **지연각**(0° ≤ φ < 360°) — 키페이저 펄스에서 1X 신호의 다음 양의 피크까지의 회전각. 1X 벡터 = A∠φ (A의 단위·Peak/Pk-Pk를 함께 적는다), 복소수로는 `A\,e^{-j\phi}`. Polar 플롯은 0°를 위쪽(센서 방향)에 두고 지연이 커지는 쪽을 **회전 반대 방향**으로 그린다(기본 회전은 반시계 → 지연은 시계 방향). 시간에서 각도로: `arphi = 360^circ 	imes Delta t / T`. 장비마다 다른 관례(P2-3 §3): 앞섬각(cos 기준, FFT 위상) `psi = -arphi`, 영점 기준 `arphi - 90^circ`. Polar 플롯 랩은 `components/ui/PolarPlot`(D-035)
- 비접촉 변위 센서: `d = V_{gap} / S`, AC `d_{pp} = \Delta V_{pp} / S` (출력은 음전압, gap이 클수록 더 음)
- Jeffcott (P4-2): `m\ddot z + c\dot z + k z = m e \Omega^2 e^{j\Omega t}` (등방). 비등방이면 x·y를 따로 풀고 `A_f = (\tilde X + j\tilde Y)/2`, `A_b = (\tilde X^* + j\tilde Y^*)/2` (x = Re(X̃ e^{jΩt}), y = Re(Ỹ e^{jΩt}))
- 안정성 (P4-3): `m\ddot z + c\dot z + (k - j k_{xy}) z = 0` → `m\lambda^2 + c\lambda + k - j k_{xy} = 0`, `\delta = -2\pi\sigma/\omega_d`. 한계: `k_{xy} = c\,\omega_n = 2\zeta k`. 모델 `k_{xy} = c\Omega/2`이면 한계 `\Omega = 2\omega_n`
- 트래킹 필터 (lock-in): `\vec V_{nX}(t) = 2\,\mathrm{LPF}\{x(t)\,e^{-jn\theta(t)}\}`
- FRF 추정, 코히어런스: `H_1 = \dfrac{G_{xy}}{G_{xx}},\; H_2 = \dfrac{G_{yy}}{G_{yx}},\; \gamma^2 = \dfrac{|G_{xy}|^2}{G_{xx}G_{yy}}`
- 영향계수 밸런싱: `H = \dfrac{\vec V_1 - \vec V_0}{\vec W_t},\quad \vec W_c = -\dfrac{\vec V_0}{H}`
- 요소 주파수 (P0-7, D-032): `f_{GM} = z\,f_r`, `f_{BP} = N_b\,f_r`, `f_{FTF} = \dfrac{f_r}{2}\left(1 - \dfrac{d}{D}\cos\alpha\right)`, `f_{BPFO} = N_r f_{FTF}`, `f_{BPFI} = N_r (f_r - f_{FTF})`, `f_{BSF} = \dfrac{D}{2d} f_r \left(1 - \left(\dfrac{d}{D}\cos\alpha\right)^2\right)`, `f_{belt} = \pi D_p f_r / L` (D_p 풀리 지름, L 벨트 길이). P0-7은 α = 0과 근사(FTF ≈ 0.4 f_r)만 쓴다
- 응답 합성 (P0-8): `x(t) = \sum_i A_i\cos(2\pi f_i t + \phi_i) + n(t)` (정현파 + 잡음). φ_i는 시간 원점의 **시작 위상**, 키페이저 지연각과 구분한다. 감쇠 울림은 고정 A_i 정현파 하나가 아니라 별도 시간 응답으로 더한다.
- 베어링 결함 주파수: 원본 4-2 식 사용 (BSF 관례는 I-008). 위 요소 주파수 식과 같다

### 3-1. 공통 DSP 코어 구현 사양

코드와 테스트가 기준이다. 랩·그림을 만들 때 알아야 할 규약만 적는다 (끝난 코어의 설계 메모는 `archive/Milestones.md`, D-030).

- `singleSidedSpectrum` (`lib/dsp/spectrum.ts`): 진폭은 **Pk**(입력 SI 단위), 위상은 첫 샘플 기준(atan2), 정확히 0인 bin의 위상은 `NaN`. DC·나이퀴스트는 두 배 하지 않는다. 제로패딩 후에도 진폭 분모는 원래 N, 분해능·측정 시간은 패딩 전과 같다.
- `lib/dsp/average.ts`: 입력·반환은 **파워**(제곱근은 UI에서). 벡터 평균은 이미 위상 정렬된 복소 스펙트럼을 받는다(정렬은 수집 쪽 책임). 오버랩은 `frameLayout`·`splitOverlappingFrames`로 실제 샘플을 겹쳐 자른다.
- 모든 코어 함수는 입력을 바꾸지 않고, 잘못된 입력은 `RangeError`. 기준값은 §6.

## 4. 페이지 목록

페이지 ID = `Curriculum.md`의 절 번호 (`P{Part}-{절}`). M 열은 세부 마일스톤 (`Roadmap.md` §6). 상태를 바꾸면 사이트 목차 `src/data/curriculum.ts`도 함께 고친다.

페이지 파일: `src/pages/p{Part}-{절}.mdx` (예: `p1-1.mdx` → `/p1-1/`). frontmatter에 `layout: ../layouts/MdxLayout.astro`, `sectionId: P1-1`을 넣으면 경로 표시와 이전/다음 절 이동이 붙는다. 목차 `src/data/curriculum.ts`의 `href`·`status`도 함께 고친다 (D-023).

| ID | 제목 | 랩 | M | 상태 |
|---|---|---|---|---|
| HOME | 홈 · 학습 지도 | — | M0.3 골격, M1.15, M0.6 개편 | 검토 (4단계 학습 지도·히어로, D-037) |
| LAB | Signal Lab 랩 모음 · 랩별 단독 페이지 | 모든 랩 | M0.6 | 검토 (/lab/ + /lab/{slug}/, 원문 링크 자동, D-037) |
| P0-1 | 진동이란: 평형 · 복원력 · 관성 | LAB-MCK-01 | M2.1 | 검토 (본문·그림 5·LAB-MCK-01 기본) |
| P0-2 | 고유진동수: 물체마다 정해진 박자 | LAB-MCK-01, LAB-BAS-01 (P1-0에서 이동) | M2.2 | 검토 (본문·그림 7·LAB-MCK-01 확장·LAB-BAS-01 이동) |
| P0-3 | 감쇠: 흔들림은 왜 잦아드나 | LAB-DAMP-01 | M2.3 | 검토 (본문·그림 6·감쇠 자유진동 랩) |
| P0-4 | 강제진동과 공진 | LAB-FRC-01 | M2.4 | 검토 (본문·그림 7·강제진동 랩) |
| P0-5 | 여러 질량과 모드 | LAB-2DOF-01 | M2.5 | 검토 (본문·그림 7·2자유도 모드 랩) |
| P0-6 | 회전기계의 진동: 불평형과 1X | LAB-UNB-01 | M2.6 | 검토 (본문·그림 7·불평형 런업 랩) |
| P0-7 | 기계 요소가 만드는 주파수: 한 바퀴에 몇 번? | LAB-FMAP-01 | M2.7 | 검토 (그림 10, LAB-FMAP-01 1곳, D-032·D-033) |
| P0-8 | 응답에서 원인으로: 진단은 거꾸로 푸는 문제 | LAB-SRC-01 | M2.8 | 검토 (그림 7, LAB-SRC-01 1곳) |
| P1-0 | 신호와 스펙트럼의 기본 | LAB-BAS-02 (LAB-BAS-01은 P0-2) | M1.0, M1.T, M1.T2, M2.9 | 검토 (측정 관점으로 정리, 기존 그림 7 재사용·LAB-BAS-02 1곳·Part 0 되짚기 링크) |
| P1-1 | 푸리에 기초 | LAB-FOU-01 | M1.4, M1.T, M1.T2 | 완료 (2026-10-06 사용자 확인, 그림 9) |
| P1-2 | 샘플링 · 에일리어싱 · AAF · ADC | LAB-SMP-01, 02, 03 | M1.5~M1.6, M1.T, M1.T2 | 완료 (2026-10-06 사용자 확인, 그림 8) |
| P1-3 | 분해능 · 측정 시간 · Zoom FFT | LAB-RES-01, 02, LAB-ZOOM-01 | M1.7~M1.8, M1.T, M1.T2 | 완료 (2026-10-06 사용자 확인, 그림 5) |
| P1-4 | 윈도우 | LAB-WIN-01, 02, 03 | M1.9~M1.10, M1.T, M1.T2 | 완료 (2026-10-06 사용자 확인, 그림 8) |
| P1-5 | 평균화와 TSA | LAB-AVG-01, 02 | M1.11~M1.12, M1.T2 | 검토 (D-026 개편: 평균화 그림 8 + TSA 그림 4, LAB-AVG-01 4곳·LAB-AVG-02 2곳 연결) |
| P1-6 | 스펙트럼 스케일링과 진동 단위 | LAB-SPC-01, 02, LAB-UNIT-01 | M1.13 | 검토 (그림 7, LAB-SPC-01·LAB-UNIT-01 각 1곳, LAB-SPC-02 2곳) |
| P1-7 | 변조 · 측대역 · 맥놀이 | LAB-MOD-01 | M1.14 | 검토 (그림 8, LAB-MOD-01 4곳) |
| P1-8 | 측정 설정 종합 | LAB-SBX-01 | M1.15 | 검토 (그림 4, LAB-SBX-01, Signal Lab 페이지 `/lab/`) |
| P2-1 | 센서 원리와 선택 | LAB-SNS-01 | M3.1 | 검토 (그림 7, LAB-SNS-01 3곳) |
| P2-2 | 프록시미티 프로브 시스템 | LAB-PROX-01 | M3.2 | 검토 (그림 6, LAB-PROX-01 3곳) |
| P2-3 | 키페이저 · 위상 · 1X 벡터 | LAB-PHS-01, LAB-SRO-01 | M3.3 | 검토 (그림 10, LAB-PHS-01 2곳, LAB-SRO-01 2곳) |
| P2-4 | 측정 체인 함정 | LAB-CHAIN-01 (판정 퀴즈) | M3.4 | 검토 (그림 7, LAB-CHAIN-01 3곳: 살펴보기 2 + 퀴즈 1) |
| P2-5 | 과도 데이터 수집과 보호 시스템 | LAB-ALM-01 | M3.5 | 검토 (그림 6, LAB-ALM-01 3곳) |
| P3-1 | 디지털 필터 | LAB-FLT-01 | M4.1 | 계획 |
| P3-2 | 적분과 미분 | LAB-INT-01 | M4.2 | 계획 |
| P3-3 | 시간-주파수 분석 | LAB-STFT-01 | M4.3 | 계획 |
| P3-4 | 2채널 분석 · Full spectrum | LAB-XCH-01, LAB-FULL-01 | M4.4 | 계획 |
| P3-5 | 차수추적 | LAB-ORD-01 | M4.5 | 계획 |
| P3-6 | 트래킹 · 노치 필터 | LAB-FLT-02 | M4.6 | 계획 |
| P3-7 | 엔벨로프 · Spectral Kurtosis | LAB-ENV-01, LAB-SK-01 | M4.7 | 계획 |
| P3-8 | 켑스트럼 · 특징량 | LAB-CEP-01, LAB-FEAT-01 | M4.8 | 계획 |
| P4-0 | 회전기계의 구성: 무엇이 돌고, 무엇이 받치나? | LAB-SUP-01 | M5.0 | 검토 (구성·지지계 본문, 그림 7, 지지 강성 랩) |
| P4-1 | 1자유도 불평형 응답을 Bode/Polar로 | LAB-AF-01 | M5.1 | 검토 (본문 8절, 그림 7, LAB-AF-01) |
| P4-2 | Jeffcott 로터 | LAB-JEF-01 | M5.2 | 계획 |
| P4-3 | 유막 베어링과 안정성 입문 | LAB-STB-01 | M5.3 | 계획 |
| P5-1 | 시간파형 | LAB-TWF-01 | M6.1 | 계획 |
| P5-2 | 스펙트럼 · Waterfall · Cascade | LAB-WF-01 | M6.2 | 계획 |
| P5-3 | 오빗 | LAB-ORB-01 | M6.3 | 계획 |
| P5-4 | Shaft Centerline | LAB-SCL-01 | M6.4 | 계획 |
| P5-5 | Bode · Polar · APHT | LAB-BODE-01 | M6.5 | 계획 |
| P5-6 | 트렌드 & 벡터 트렌드 | LAB-TRND-01 | M6.6 | 계획 |
| P6-0 | 진단 주파수 지도 · 회전수 추정 | LAB-FAULT-01, LAB-RPM-01 | M7.1 | 계획 |
| P6-1 | 1X 계열 | (LAB-FAULT-01 프리셋) | M7.2 | 계획 |
| P6-2 | 미스얼라인먼트 · 풀림 · 러브 | (LAB-FAULT-01 프리셋) | M7.2 | 계획 |
| P6-3 | 유체막 · 유체력 불안정 | (LAB-WF-01, LAB-STB-01 프리셋) | M7.3 | 계획 |
| P6-4 | 구름베어링 | LAB-BRG-01 | M7.4 | 계획 |
| P6-5 | 기어 | LAB-GEAR-01 | M7.5 | 계획 |
| P6-6 | 전기적 원인 | (LAB-MOD-01 프리셋) | M7.6 | 계획 |
| P6-7 | 유체 · 공력 원인 | (LAB-FAULT-01 프리셋) | M7.6 | 계획 |
| P6-8 | 비틀림 · 블레이드 진동 | LAB-CAMP-01 | M7.7 | 계획 |
| P7-1 | 기동·정지와 임계속도 통과 | (LAB-BODE-01 프리셋) | M8.1 | 계획 |
| P7-2 | Thermal bow · Turning gear · Morton | (LAB-TRND-01 프리셋) | M8.1 | 계획 |
| P7-3 | ST 특화 | (시나리오 프리셋) | M8.2 | 계획 |
| P7-4 | GT 특화 | (시나리오 프리셋) | M8.3 | 계획 |
| P7-5 | 발전기와 축계 | (시나리오 프리셋) | M8.4 | 계획 |
| P8-1 | 구조 공진 판별과 임팩트 시험 | LAB-HPB-01 | M9.1 | 계획 |
| P8-2 | 밸런싱 | LAB-BAL-01 | M9.2 | 계획 |
| P8-3 | 정렬 | LAB-ALN-01 (선택) | M9.3 | 계획 |
| P9-1 | 진동 판정 규격 | LAB-ISO-01 | M10.1 | 계획 |
| P9-2 | API 규격 요점 | — | M10.2 | 계획 |
| P9-3 | 진단 절차와 보고 | — | M10.2 | 계획 |
| P10-1 | 가상 기계 케이스 | LAB-CASE-01 | M11.1 | 계획 |
| P10-2 | 공개 데이터셋 실습 | (데이터셋 뷰어) | M11.2 | 계획 |
| P10-3 | 현장 데이터 복기 가이드 | — | M11.3 | 계획 |
| REF-1 | 공식 모음 | — | 세부 M마다 누적, M11.3 정리 | 계획 |
| REF-2 | 용어집 | — | 세부 M마다 누적, M11.3 정리 | 계획 |
| REF-3 | 참고자료 · 데이터셋 | — | M11.3 | 계획 |

## 5. 랩 사양

### 5-1. 구현된 랩 (한 줄 요약) — 원래 사양·검증 기준은 `archive/LabSpecs.md` (D-038)

구현이 끝난 랩은 코드와 테스트가 기준이다. 여기에는 찾아가는 길만 둔다. 랩 단독 페이지는 `/lab/{slug}/` (D-037).

| 랩 | 이름 | 처음 쓰인 곳 | 컴포넌트 (단독 페이지) · 계산 모듈 |
|---|---|---|---|
| LAB-BAS-01 | 정현파의 세 숫자 (진폭 · 주파수 · 위상) | P0-2 | `SineBasicsLab` (/lab/bas-01/) |
| LAB-BAS-02 | 진폭을 숫자 하나로 (Peak · Pk-Pk · RMS · Crest factor) | P1-0 | `AmplitudeMeasuresLab` (/lab/bas-02/) |
| LAB-FOU-01 | 푸리에 기초 | P1-1 | `FourierHarmonicsLab` (/lab/fou-01/), `DftCorrelationLab` (/lab/fou-01-dft/), `ZeroPaddingLab` (/lab/fou-01-zeropad/) |
| LAB-SMP-01 | 샘플링 & 에일리어싱 | P1-2 | `SamplingLab` (/lab/smp-01/) |
| LAB-SMP-02 | AAF와 f_s = 2.56 F_max | P1-2 | `AafLab` (/lab/smp-02/) |
| LAB-SMP-03 | ADC & 입력 레인지 | P1-2 | `AdcLab` (/lab/smp-03/) |
| LAB-RES-01 | 분해능: 두 성분 분리 | P1-3 | `ResolutionLab` (/lab/res-01/) |
| LAB-RES-02 | Smearing: 변하는 회전수 | P1-3 | `SmearingLab` (/lab/res-02/) |
| LAB-ZOOM-01 | Zoom FFT | P1-3 | `ZoomLab` (/lab/zoom-01/) |
| LAB-WIN-01 | 누설과 가리비 손실 | P1-4 | `WindowLeakageLab` (/lab/win-01/) |
| LAB-WIN-02 | 윈도우 비교: 메인로브와 사이드로브 | P1-4 | `WindowComparisonLab` (/lab/win-02/) |
| LAB-WIN-03 | 보정계수 & ENBW | P1-4 | `WindowCorrectionLab` (/lab/win-03/) |
| LAB-AVG-01 | 평균화 | P1-5 | `AveragingLab` (/lab/avg-01/) |
| LAB-AVG-02 | TSA (시간 동기 평균) | P1-5 | `TsaLab` (/lab/avg-02/) |
| LAB-SPC-01 | 스펙트럼의 세로축: 진폭 · 파워 · PSD | P1-6 §3 | `SpectrumScalingLab` (/lab/spc-01/) · lib/dsp/scaling.ts, lib/scalingDemo.ts |
| LAB-SPC-02 | 진폭 표기와 dB | P1-6 §5 | `AmplitudeScaleLab` (/lab/spc-02/) |
| LAB-UNIT-01 | 진동 단위 환산기 | P1-6 §6 | `UnitConverterLab` (/lab/unit-01/) · lib/units.ts |
| LAB-MOD-01 | 변조 · 측대역 · 맥놀이 | P1-7 §2 | `ModulationLab` (/lab/mod-01/) · lib/dsp/modulation.ts, lib/modulationDemo.ts |
| LAB-SBX-01 | Signal Lab 샌드박스 + 설정 도우미 | P1-8 §6 | `SandboxLab` (/lab/sbx-01/) · lib/sandbox.ts |
| LAB-SNS-01 | 센서 = 질량-스프링 계 | P2-1 §3· | `SensorLab` (/lab/sns-01/) · lib/sensor.ts |
| LAB-PROX-01 | 비접촉 변위 센서: gap 전압과 런아웃 | P2-2 §3· | `ProximityLab` (/lab/prox-01/) · lib/proximity.ts |
| LAB-PHS-01 | 위상 측정: 키페이저 펄스와 1X 위상 | P2-3 §2· | `PhaseLab` (/lab/phs-01/) · lib/phase.ts |
| LAB-SRO-01 | Slow roll 보상: 런아웃을 벡터로 빼기 | P2-3 §5· | `SlowRollLab` (/lab/sro-01/) · lib/phase.ts |
| LAB-CHAIN-01 | 센서 문제인가, 기계 문제인가 (측정 체인 판정 퀴즈) | P2-4 §4· | `ChainQuizLab` (/lab/chain-01/) · lib/measurementChain.ts |
| LAB-ALM-01 | 보호 시스템 알람 논리: 레벨 · 지연 · 보팅 · 트립 배율 | P2-5 §4· | `AlarmLab` (/lab/alm-01/) · lib/protection.ts, lib/transient.ts |
| LAB-MCK-01 | 질량-스프링 자유진동 | P0-1 | `MassSpringLab` (/lab/mck-01/) |
| LAB-DAMP-01 | 감쇠 자유진동 | P0-3 | `DampingLab` (/lab/damp-01/) |
| LAB-FRC-01 | 강제진동과 공진 | P0-4 | `ForcedVibrationLab` (/lab/frc-01/) |
| LAB-2DOF-01 | 2자유도 모드 | P0-5 | `TwoDofModeLab` (/lab/2dof-01/) |
| LAB-UNB-01 | 불평형 런업 입문 | P0-6 | `UnbalanceLab` (/lab/unb-01/) |
| LAB-FMAP-01 | 주파수 지도: 기계 요소별 관심 구간 | P0-7 | `FrequencyMapLab` (/lab/fmap-01/) · lib/machine/frequencies.ts |
| LAB-SRC-01 | 원인 합성: 파형 한 줄에 섞인 원인들 | P0-8 | `SourceSynthesisLab` (/lab/src-01/) |
| LAB-SUP-01 | 지지 강성과 고유진동수 (D-036) | P4-0 | `SupportStiffnessLab` (/lab/sup-01/) · lib/machine/supportModel.ts |
| LAB-AF-01 | Run-up Bode & 증폭계수 | P4-1 | `RunUpBodeLab` (/lab/af-01/) · lib/rotor/runup.ts |

### 5-1b. 상세 사양 — 아직 구현하지 않은 랩

새 랩은 여기에 사양을 먼저 쓰고 구현한다 (템플릿 §2). 구현이 끝나면 사양을 `archive/LabSpecs.md`로 옮기고 위 표에 한 줄을 더한다.

#### LAB-JEF-01 Jeffcott 로터: 선회와 오빗
- P4-2 · M5.2 · 사양 (2026-10-06 Claude, D-034 — 트랙 B 구현)
- 목적: 회전체의 응답을 축 단면이 그리는 궤적(오빗)으로 보고, 등방 지지면 원형 정방향 선회, 비등방이면 타원·임계속도 2개·두 임계속도 사이의 역방향 선회가 생긴다는 것을 본다.
- 모델 (`lib/rotor/jeffcott.ts`, 해석해): `m\ddot x + c\dot x + k_x x = m e \Omega^2\cos\Omega t`, `m\ddot y + c\dot y + k_y y = m e \Omega^2\sin\Omega t` (감쇠는 두 방향 같게). 정/역 성분 A_f·A_b는 §3 식
- 조작: 회전수 (0 ~ 2.5 N_x), k_y/k_x (1 ~ 1.6, 기본 1), ζ (0.01 ~ 0.2, 기본 0.05), 재생/정지 (오빗 위 점이 도는 애니메이션 — 표시용으로 느리게, 재생할 때만)
- 출력: 오빗(X-Y, 정방향 파랑·역방향 주황, 회전 방향 화살표, 키페이저 점), X·Y 시간파형, 진폭 X·Y vs rpm(두 피크) + 현재 점, ∣A_f∣·∣A_b∣ vs rpm. 읽음값 — 두 임계속도, X·Y 진폭·위상, ∣A_f∣, ∣A_b∣, 선회 방향
- 수식: 운동방정식, 등방 해 = P4-1의 불평형 응답, z = A_f e^{jΩt} + A_b e^{−jΩt}
- 실험 과제: k_y = k_x와 1.3 k_x의 오빗·역방향 성분 비교 / 두 임계속도 사이에서 선회 방향은? / ζ를 키우면 역방향 구간은?
- 검증 (§6): 등방 → A_b = 0, 원형 오빗, 반지름 = 1자유도 불평형 응답 / ζ = 0이면 두 임계속도 사이에서 ∣A_b∣ > ∣A_f∣
- 주의: Full spectrum(P3-4)·오빗 판독(P5-3)보다 앞이므로 정/역 성분은 페이지에서 직접 계산해 보여 주고 판독은 그쪽으로 넘긴다.

#### LAB-STB-01 안정성: 교차연성과 Log decrement
- P4-3 · M5.3 · 사양 (2026-10-06 Claude, D-034 — 트랙 B 구현)
- 목적: 교차연성 강성 k_xy가 선회 방향으로 미는 힘을 만들고, 감쇠가 그것을 이기지 못하면 자유진동이 줄지 않고 커진다(불안정)는 것을 고유치·오빗·Log dec로 본다.
- 모델 (`lib/rotor/stability.ts`): 복소 계수 2차 방정식 `m\lambda^2 + c\lambda + k - j k_{xy} = 0`의 근(정방향 근의 σ로 판정), 자유응답 z(t). 모드 [k_xy 직접 / k_xy = cΩ/2 모델(기름막 평균 원주속도 ≈ 표면속도의 절반)]
- 조작: 모드, k_xy (0 ~ 0.5 k) 또는 회전수 Ω (0 ~ 3 ω_n), ζ (0.01 ~ 0.2), 초기 변위
- 출력: 자유응답 오빗(수렴/발산), x(t)와 포락선, 고유치 평면(σ–ω) 위 근의 궤적과 현재 점, Log dec vs k_xy(또는 Ω)와 안정 한계 표시. 읽음값 — σ, ω_d, δ, 안정/불안정, 한계 k_xy 또는 한계 Ω/ω_n
- 수식: 특성방정식, δ = −2πσ/ω_d, 한계 k_xy = 2ζk, 모델이면 한계 Ω = 2ω_n
- 실험 과제: k_xy를 올리며 δ = 0이 되는 값 / c를 2배로 하면 한계는? (k_xy 직접이면 한계 k_xy도 2배, k_xy = cΩ/2 모델이면 한계 회전수는 그대로 2ω_n — 감쇠와 교차연성이 함께 커지는 모델이라서) / 선택: Whirl → Whip 워터폴 미리 보기(P5-2에서 자세히)
- 검증 (§6): k_xy = 0 → σ = −ζω_n, δ = 0.3146 (ζ = 0.05) / δ = 0 ↔ k_xy = 2ζk / 모델에서 Ω = 2ω_n → σ = 0, Ω < 2ω_n → σ < 0

### 5-2. 그 밖의 랩 (개요 — 해당 마일스톤 시작 시 상세화)

| ID | 이름 | 핵심 조작 → 보이는 것 | 페이지 | M |
|---|---|---|---|---|
| LAB-FLT-01 | 필터 설계 | 종류·차수 → 크기·위상·군지연, filtfilt 비교 | P3-1 | M4.1 |
| LAB-INT-01 | 적분 & Ski-slope | 시간/주파수 영역 적분, HP 컷오프 → 저주파 발산 | P3-2 | M4.2 |
| LAB-STFT-01 | 스펙트로그램 · 워터폴 | 프레임 길이·오버랩 → 시간-주파수 트레이드오프 | P3-3 | M4.3 |
| LAB-XCH-01 | FRF · 코히어런스 | 입력/출력 잡음, 평균 수 → H1 vs H2, γ² | P3-4 | M4.4 |
| LAB-FULL-01 | Full spectrum | X/Y 진폭·위상 → 오빗과 정/역 성분 | P3-4 | M4.4 |
| LAB-ORD-01 | 차수추적 | 등각도 재샘플링 on/off, 키페이저 유/무 → smearing 제거 | P3-5 | M4.5 |
| LAB-FLT-02 | 트래킹 & 노치 | 대역폭 → 1X 진폭·위상 추정 지연, 1X 제거 | P3-6 | M4.6 |
| LAB-ENV-01 | 엔벨로프 분석 | BPF 대역 → 엔벨로프 스펙트럼의 BPFO/BPFI | P3-7 | M4.7 |
| LAB-SK-01 | Spectral Kurtosis / Kurtogram | 임펄스 대역 자동 탐색 → ENV-01 대역 추천 | P3-7 | M4.7 |
| LAB-CEP-01 | 켑스트럼 | 하모닉/측대역 패밀리 → quefrency 피크, liftering | P3-8 | M4.8 |
| LAB-FEAT-01 | 시간영역 특징량 | 결함 진행 시뮬레이션 → RMS·CF·Kurtosis 추세 | P3-8 | M4.8 |
| LAB-TWF-01 | 시간파형 패턴 | 패턴 갤러리 + 맞히기 퀴즈 | P5-1 | M6.1 |
| LAB-WF-01 | Waterfall & Full spectrum cascade | 회전수 스윕 → Oil whirl(추종) vs Whip(고정) | P5-2 | M6.2 |
| LAB-ORB-01 | 오빗 | 성분·위상·dot → 오빗 형태, 프리세션 방향 | P5-3 | M6.3 |
| LAB-SCL-01 | Shaft centerline | 하중·회전수 → 편심률·자세각 | P5-4 | M6.4 |
| LAB-BODE-01 | Bode / Polar | LAB-AF-01 확장: 2모드 로터, 위상 반전, Polar 루프 | P5-5 | M6.5 |
| LAB-TRND-01 | 벡터 트렌드 | 1X 벡터 회전 시나리오 → 스칼라 vs 벡터 트렌드, Acceptance region | P5-6 | M6.6 |
| LAB-FAULT-01 | 결함 신호 합성기 | 결함 종류·정도 → 스펙트럼·파형·오빗 패턴 (Part 10 엔진) | P6-0 | M7.1 |
| LAB-RPM-01 | 회전수 추정 | 하모닉 패밀리 / 켑스트럼 / STFT로 1X 후보 찾기 | P6-0 | M7.1 |
| LAB-BRG-01 | 베어링 결함주파수 | n, d, D, α, rpm → BPFO/BPFI/BSF/FTF + 단계 시뮬레이터 (I-008). 계산은 `lib/machine/frequencies.ts`(P0-7) 확장 | P6-4 | M7.4 |
| LAB-GEAR-01 | 기어 측대역 | 잇수·결함 축 → GMF ± n×RPM, 헌팅 투스 | P6-5 | M7.5 |
| LAB-CAMP-01 | Campbell 선도 | 고유진동수 강성화, 엔진 차수선 → 교차점 | P6-8 | M7.7 |
| LAB-HPB-01 | Half-power & 임팩트 시험 | FRF 피크 → ζ, 지수 윈도우 영향, 해머 팁 → 가진 대역 | P8-1 | M9.1 |
| LAB-BAL-01 | 영향계수 밸런싱 | 시험추 → 영향계수 → 보정추 → 잔류 진동 | P8-2 | M9.2 |
| LAB-ALN-01 | 정렬 계산기 (선택) | 측정값 → 이동량, 열성장 보정 | P8-3 | M9.3 |
| LAB-ISO-01 | 진동 등급 판정 | 측정값·기계 분류 → Zone (경계값은 I-009 정책) | P9-1 | M10.1 |
| LAB-CASE-01 | 가상 기계 케이스 | 숨은 결함 → 측정 설정·플롯 선택 → 진단 제출 → 해설 | P10-1 | M11.1 |

## 6. 검증 기준값

단위테스트의 기대값. 윈도우 값은 주기형(DFT-even) 정의, N이 충분히 클 때 기준이다 (R-06, R-05).

| 윈도우 | CG | ACF | ECF | ENBW (bin) | 최대 스캘럽 손실 | 최대 사이드로브 | 메인로브 (첫 영점) |
|---|---|---|---|---|---|---|---|
| Uniform | 1.000 | 1.000 | 1.000 | 1.000 | 3.92 dB (−36.3 %) | −13.3 dB | ±1 bin |
| Hann | 0.500 | 2.000 | 1.633 | 1.500 | 1.42 dB (−15.1 %) | −31.5 dB | ±2 bin |
| Hamming | 0.540 | 1.852 | 1.586 | 1.363 | 1.78 dB | −42.7 dB | ±2 bin |
| Blackman-Harris (4항) | 0.359 | 2.787 | 1.969 | 2.004 | 0.83 dB | −92 dB | ±4 bin |
| Flat top (5항) | 0.216 | 4.639 | 2.389 | 3.770 | < 0.01 dB (−0.11 %) | −93 dB | ±5 bin |

* Flat top 계수 출처 (I-010, D-022): ISO 18431-2, SciPy `flattop`, MATLAB `flattopwin` (periodic), D'Antona & Ferrero (2006). 계수: $a = [0.21557895, 0.41663158, 0.277263158, 0.083578947, 0.006947368]$.

기타 기준값

| 항목 | 조건 | 기대값 |
|---|---|---|
| 사각파 하모닉 | 진폭 1 | n차(홀수) 진폭 4/(nπ), 짝수 0 |
| 제로패딩 | 정수배 P | 원래 bin k 값 = 패딩 후 bin P·k 값 |
| 단일측 톤 위상 | A·cos(2πft+φ), bin 중심, t₀ = 0 | 피크 진폭 A, 위상 φ (rad, −π~π) |
| 위상 기준 | bin 중심, 첫 샘플 시각 t₀ ≠ 0 | 위상 φ + 2πft₀ (2π 주기), 진폭 A |
| DC·나이퀴스트 | x[n] = −2 + 0.75·(−1)ⁿ | DC 진폭 2·위상 ±π, 나이퀴스트 진폭 0.75·위상 0 (두 배 제외) |
| 패딩과 정규화 | N=128, N_FFT=512, fs=128 Hz | bin 간격 0.25 Hz, 원래 Δf=1 Hz·T=1 s, 원래 bin 진폭·위상 보존 |
| 실신호 켤레 대칭 | 임의 실수 샘플열, 짝수 N | X[N−k] = conj(X[k]), DC·나이퀴스트 허수부 0 |
| 단일측 평균제곱 | 윈도우·패딩 없음 | mean(x²) = A₀² + A_{N/2}² + ½Σ A_k² (내부 bin만 합산) |
| 에일리어스 | f_s 1000 Hz, f = 940 / 1060 / 1940 Hz | 모두 60 Hz |
| 에일리어스 위상 | f_s 1000 Hz, 위상 φ | 940 Hz(φ)의 샘플 = 60 Hz(−φ), 1060 Hz(φ)의 샘플 = 60 Hz(+φ) — 위쪽에서 접히면 위상 반전 |
| 시드 난수 | `createRng(seed).normal()` 10만 개 | 평균 0 ± 0.02, 표준편차 1 ± 0.02, 같은 시드 → 같은 수열 |
| AAF 접힘 | F_max 1000 Hz, f = 1800 Hz | 760 Hz |
| Butterworth 감쇠 | 8차, f/f_c = 1.8 | 40.8 dB |
| ADC 양자화 SNR | 풀스케일 정현파, b bit | 6.02b + 1.76 dB (16 bit ≈ 98 dB) |
| 분해능 | F_max 1000 Hz, LOR 3200 | f_s 2560 Hz, N 8192, Δf 0.3125 Hz, T 3.2 s |
| Smearing | 60 rpm/s, T = 3.2 s, Δf = 0.3125 Hz | 1X 변화 3.2 Hz ≈ 10.2 bin |
| bin 중심 톤 | A = 1, 모든 윈도우 + ACF | 1.000 |
| bin 사이 톤 | δ = 0.5 | Uniform 0.637 (2/π), Hann 0.849 |
| Parseval | 윈도우 없음 | Σ x[n]² = (1/N) Σ \|X[k]\|² |
| 백색 잡음 PSD | 표준편차 σ, 단일측 | 2σ²/f_s, 0~f_N 적분 = σ² |
| RMS 파워 평균 | RMS 진폭 1·3 → 파워 1·9 | 평균 파워 5, 표시 √5 (산술 평균 2와 구분) |
| 지수 평균 | 파워 1·5·9, α=0.25, 첫 프레임 초기화 | 최종 파워 3.75; α=1은 최신 프레임 |
| 피크홀드 | 파워 1·4·2 | 최대 파워 4 유지 |
| 벡터 평균 | 벡터 1·j·−1·−j | 벡터 평균 0, 파워 평균 1 |
| 오버랩 분할 | N=512, M=16, r=0.75, f_s=512 Hz | H=128, 총 2432 샘플, 4.75 s |
| RMS 독립 잡음의 흔들림 | N=64, bin 11, M=1·4·16·64, 768회 고정 시드 | 평균 파워 2/N ±10%, (std/mean)√M=1 ±12% |
| 벡터 독립 잡음의 레벨 | 위와 같은 수집 | 파워 2/(NM) ±12%, 위상 정렬된 톤 보존 |
| TSA 동기 성분 | 정수 차수 cos, M = 10 | 그대로 (이득 1) |
| TSA 비동기 성분 | ρ = 13.4, M = 16 / ρ = 13.05, M = 16·20·64 | ∣H∣ = 1/16 / 0.235·0·0.0587 (평균 파형 = 해석해 (1/M)Σe^(j2πρm)배) |
| TSA 잡음 | 백색 잡음 σ = 1, 한 바퀴 256점, M = 64 | RMS 0.125 ±12 % (σ/√M) |
| Residual | cos 15θ + 0.5 cos(7θ + 1) + 0.2에서 15차 제거 | 0.5 cos(7θ + 1) + 0.2 (0차도 빼면 0.2 제거) |
| 감쇠 임펄스열 | 울림 700 Hz, 시정수 2.5 ms, 1/4 주기 뒤 | amp·e^(−τ/decay), 다음 충격 주기마다 같은 모양 |
| Uniform 오버랩 근사 | N=8, M=4, H=4 | CV²=0.34375, CV≈0.5863, 등가 M≈2.91 |
| Hann 75% 실제 공유 샘플 | N=64, M=16, 연속 잡음의 겹친 FFT | CV 근사 ±12%, 독립 1/√M보다 큼 |
| 정현파 | — | CF = √2 ≈ 1.414 |
| 단위 환산 | 25 Hz, 50 µm pp | 2.78 mm/s rms |
| 단위 환산 | 1 in/s pk | 17.96 mm/s rms |
| 파워 바닥과 Δf | 백색 잡음 σ, Hann, N 1024 → 8192 | bin 파워 2σ²·ENBW/N → 1/8 (−9 dB), PSD는 2σ²/f_s 그대로 |
| 톤의 PSD | bin 중심 톤 RMS A, Hann | A²/(1.5·Δf) — Δf가 1/8이면 8배 |
| 대역 RMS (Hann 톤) | bin 중심 톤 1 RMS | 세 bin 파워 0.25·1·0.25, ÷ 1.5 → 1 (안 나누면 √1.5 = 1.22) |
| dB 기준값 | 1 mm/s | re 1 mm/s 0 dB = re 1 nm/s 120 dB |
| AM 측대역 | m = 0.5 | 반송파 대비 0.25 (−12.0 dB) |
| FM 베셀 | β = 1 | J₀ 0.765, J₁ 0.440, J₂ 0.115 |
| FM 반송파 소멸 | β = 2.4048 | J₀ = 0 |
| AM + FM 비대칭 | m 0.4, β 0.6, 위상차 0 | 위 측대역 0.478, 아래 0.096 (∣Jₙ + (m/2)(e^{jψ}Jₙ₋₁ + e^{−jψ}Jₙ₊₁)∣) |
| 맥놀이 | 30 Hz(1)·29.5 Hz(0.6) | 주기 2 s, 포락선 0.4 ~ 1.6 |
| 샌드박스 측대역 판정 | 3000 rpm, 맞물림 750 Hz ± 12.5 Hz, F_max 2000 Hz, Hann | 400 라인 2.5 bin → 붙음, 800 라인 5 bin → 갈라짐 (T 0.4 s, 8회·50 % → 1.8 s) |
| 샌드박스 AAF | F_max 1000 Hz(f_s 2560 Hz), 울림 3 kHz | AAF 없음 → 440 Hz로 접힘, 8차 AAF → (1/3)⁸ ≈ −76 dB |
| 샌드박스 1X 읽기 | 2970 rpm(49.5 Hz), F_max 500 Hz·400 라인 | Flat top 오차 < 0.2 %, Hann 5 % 이상 낮음 |
| 증폭계수 (LAB-AF-01) | 1자유도 N_n 3000 rpm, ζ = 0.05, 25 rpm 간격 | N_c 3000, N₁ 2866.5, N₂ 3171.5 rpm → AF ≈ 9.84 (이론 1/(2ζ) = 10, -1.6 %), 피크 r = 1.0025(3008 rpm) vs 90° 3000 rpm |
| Slow roll 보상 | 50 µm∠120° − 15 µm∠60° | ≈ 44.4 µm∠137° (크기만 빼면 35, 21 % 작게) |
| 위상: 시간 → 각도 (M3.3) | 3600 rpm, Δt 5.556 ms | 120° (T 16.67 ms) |
| 위상 관례 | 지연각 120° | 앞섬각 −120°, 영점 기준 30° |
| 동기 DFT | A/2·cos(θ − φ) + 2X, 펄스에서 시작한 정수 바퀴 | 1X bin = (A/2)e^{−jφ} 그대로, 2X는 1X로 새지 않는다 |
| 원신호 봉우리 | 1X 50 µm pp∠120° + 2X 20 µm pp∠300° | 138.4° (1X 피크와 18° 차이) |
| 1X 벡터 변화 | 50∠120° → 50∠240° | 86.6∠270° (50√3) |
| 키페이저 펄스 | gap 1.2 mm, 홈 깊이 1.0 mm, 7.87 V/mm | −9.45 V → −17.3 V, 문턱 −13.4 V |
| Slow roll 런업 (예시 로터) | 운전 3600 rpm에서 45 µm pp, 런아웃 15∠60°, Slow roll 300 rpm | 측정 42.06∠151.4°, 벡터 보상 45.71∠171.0°(참값 45∠170.9°), 크기만 26.67 (−41 %), 1200 rpm에서 잡으면 61.68 (+37 %), 임계 158 → 측정 171 µm pp |
| 설치 응답 (M3.4) | 손으로 대기 f_n 2 kHz, ζ 0.1 / 자석 7 kHz, ζ 0.05 | f_n에서 5배(+14 dB) / 10배(+20 dB), 그 아래는 H(r) 그대로 |
| 가속도 → 속도 | 0.001 g rms | 1 Hz 1.561 mm/s, 100 Hz 0.01561 mm/s (100배 차이) |
| 클리핑된 정현파 | A = 1, ±0.5에서 자름 | 기본파 (2A/π)(α + sinα cosα) = 0.609 (α = 30°) |
| IEPE 정착 (예시) | AC 결합 시정수 τ 2 s | 10 s 뒤 e^{−5} = 0.67 % |
| 측정 체인 예시 (LAB-CHAIN-01) | 펌프 2970 rpm, 2 ~ 1000 Hz | 정상 1X 1.80·전체 2.12 mm/s / ski-slope 6.22 / 케이블 9.88 / 클리핑(±0.25 g) 1X 1.28·5X +25 dB / 그라운드 루프 60 Hz 0.552 mm/s / 불평형 1X 7.50 → 2400 rpm 4.90 |
| 과도 수집 (M3.5) | 예시 기동: 임계 2000 rpm·ζ 0.05·운전 20 µm pp, 임계 구간 20 rpm/s | 10초마다 33점·1900 ~ 2100 rpm 안 2점·최대 104 µm pp(참 139의 75 %) / 10 rpm마다 331점·21점 |
| 동기 샘플링 | 1X 50·2X 15 µm pp, 1900 rpm부터 20 rpm/s | 고정 f_s(1280 Hz, 6.4 s) 봉우리 26.5·5.73 µm pp / 한 바퀴 64점 × 256바퀴 → 차수 1·2에 50·15 그대로 |
| 알람 논리 (LAB-ALM-01) | Alert 90·Danger 125 µm pp, 지연 1 s (예시) | 0.3 s 튐 무시, 케이블 튐 1oo2 16 s 헛트립·2oo2 없음, 기동 2oo2 144.75 s 트립·배율 ×2면 없음 |
| 비접촉 변위 센서 감도 (M3.2) | 200 mV/mil (1 mil = 25.4 µm) | 7.874 V/mm |
| gap 전압 → 거리 | −9.5 V, 7.87 V/mm | 1.207 mm |
| Jeffcott 등방 (D-034, M5.2) | k_x = k_y | A_b = 0, 원형 오빗, 반지름 = 1자유도 불평형 응답 (P0-6·P4-1과 같다) |
| Jeffcott 비등방 | ζ = 0, √(k_x/m) < Ω < √(k_y/m) | X·Y 부호 반대 → ∣A_b∣ > ∣A_f∣ (역방향 선회), 임계속도 2개 |
| 안정성 (M5.3) | k_xy = 0, ζ = 0.05 | σ = −ζω_n, δ = 0.3146 (P0-3과 같다) |
| 안정 한계 | k_xy 독립 / k_xy = cΩ/2 | δ = 0 ↔ k_xy = cω_n = 2ζk / Ω = 2ω_n (c와 무관) |
| 가속도계 평탄 대역 | 공진 25 kHz, ±10 %, 감쇠 무시 | ≈ 7.5 kHz |
| 고유진동수 (D-027, M2.1) | m = 1 kg, k = 1000 N/m | f_n = 5.033 Hz, T = 0.1987 s |
| 대수감쇠율 | ζ = 0.05 | δ = 0.3146, ω_d/ω_n = 0.99875, 반감 ≈ 2.2주기 |
| 강제진동 진폭비·위상 | ζ = 0.05, r = 0.5 / 1 / 2 | 1.330·3.8° / 10.0·90° / 0.3326·176.2° |
| 2자유도 고유진동수 | 같은 m, 스프링 k–k_c–k | ω₁ = √(k/m), ω₂ = √((k + 2k_c)/m), 모드 [1, 1]·[1, −1] |
| 불평형 응답 | ζ = 0.05, r = 1 / r ≫ 1 | 10·m_u e/M, 90° / → m_u e/M, → 180° |
| 원인 합성 (M2.8) | 3000 rpm, 날개 12, 응답 40·20·10 µm | 50·100·600 Hz, 합 신호 = 원인별 응답 합(모든 샘플), 단일측 중심 진폭 40·20·10 µm, 시드 80 재현 |
| 역문제의 진폭 모호성 | k = 10⁶ N/m, ζ = 0.05, f = 50 Hz, A = 40 µm | f_n = 100 Hz → F₀ = 30.0666 N·지연 3.814° / f_n = 50 Hz → 4 N·90° |
| 구조 울림 합성 | 85 Hz, 시정수 25 ms, 충격 주기 100 ms | 첫 충격 뒤 x = 30 µm·exp(−t/0.025)·sin(2π·85t), 다음 충격부터 이전 응답도 더함 |
| 기어 맞물림 (D-032) | 3000 rpm, 이빨 15 · 60 | 맞물림 750 Hz, 상대 축 12.5 Hz (750 / 60) |
| 날개 통과 | 3600 rpm, 날개 7 | 420 Hz |
| 구름베어링 6205 | N_r 9, d 7.94 mm, D 39.04 mm, α 0 (CWRU 시험 베어링 치수, R-10) | FTF 0.3983X, BPFO 3.585X, BPFI 5.415X, BSF 2.357X (2× 4.713X, CWRU 표는 2×). BPFO + BPFI = 9X |
| 전자기력 | 전원 60 Hz | 2 f_L = 120 Hz (3600 rpm 2극이면 2X와 같음) |

P4-0 직렬 예제의 기준: m = 100 kg, k_sh = 1 MN/m, k_br = 2 MN/m, k_sup = 1 MN/m → k_eq = 0.4 MN/m, f_n = 10.06584242 Hz. 같은 강성 3개면 k_eq = k/3, 지지 강성을 키우면 f_n 단조 증가, m 두 배면 f_n/√2. §5 LAB-SUP-01과 테스트가 함께 확인한다.

## 7. 참고자료

| ID | 자료 | 용도 | 비고 |
|---|---|---|---|
| R-01 | R. B. Randall, *Vibration-based Condition Monitoring* | Envelope, Cepstrum, TSA | 원본 추천 |
| R-02 | D. Bently, C. Hatch, *Fundamentals of Rotating Machinery Diagnostics* | GT/ST, 오빗, 로터다이나믹스 | 원본 추천 |
| R-03 | V. Wowk, *Machinery Vibration: Measurement and Analysis* | 진단 전반 | 원본 추천 |
| R-04 | J. Vance, *Machinery Vibration and Rotordynamics* / A. Muszynska, *Rotordynamics* | 로터다이나믹스 이론 (Part 4) | 원본 추천 |
| R-05 | G. Heinzel, A. Rüdiger, R. Schilling, *Spectrum and spectral density estimation by the DFT…* (2002) | 스케일링·윈도우 검증 기준 | 공개 PDF |
| R-06 | F. J. Harris, "On the use of windows for harmonic analysis with the DFT", Proc. IEEE (1978) | 윈도우 특성표 | |
| R-07 | API 684 | 로터다이나믹스, AF, SM | 유료, 요약만 (I-009) |
| R-08 | ISO 20816 시리즈 | 진동 판정 | 유료, 요약만 (I-009) |
| R-09 | Bently Nevada ORBIT Magazine 아카이브 | GT/ST 사례 | 공개 |
| R-10 | CWRU Bearing Data Center | 베어링 데이터셋 | 공개, M11.2 |
| R-11 | J. Antoni, "Fast computation of the kurtogram…" (2007) | Kurtogram (P3-7) | |
| R-12 | [NumPy DFT 정의·정규화](https://numpy.org/doc/stable/reference/routines.fft.html), [fft 제로패딩](https://numpy.org/doc/stable/reference/generated/numpy.fft.fft.html) | M1.2 FFT의 부호·bin 순서·위상·정규화 검증 | 공식 문서, 2026-10-02 확인 |

| R-13 | [NI Spectrum Averaging Mode](https://www.ni.com/docs/en-US/bundle/rfsacref/page/rfsacref/nirfsa_attr_spectrum_averaging_mode.html) | RMS·피크홀드·벡터 평균과 트리거 조건 (P1-5) | 공식 문서, 2026-10-02 확인 |
| R-14 | [SciPy Welch](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.welch.html) | 겹친 구간의 파워 평균·오버랩 조건 (P1-5) | 공식 문서, 2026-10-02 확인 |
| R-15 | [ABB 모터 설계](https://new.abb.com/motors-generators/motors-and-generators-for-explosive-atmospheres/design-of-motors--4-and-6-poles), [SKF bearing arrangement damping](https://evolution.skf.com/damping-in-a-rolling-bearing-arrangement/) | 모터 구성·베어링과 지지계 강성/감쇠 (P4-0) | 제조사 공개 자료, 2026-10-06 확인. 직렬 예제의 실제 기계 검증 자료로 쓰지 않음 |

그 밖의 데이터셋(IMS/NASA, MFPT, PRONOSTIA/FEMTO, Paderborn, PHM09)은 M11.2에서 라이선스와 용량을 확인한 뒤 추가한다.

## 8. 추가 콘텐츠 후보 (백로그)

- 원본 말미의 심화 제안 ①~④는 Curriculum에 반영됨 (① → P1-8, ② → P6-3 감별표, ③ → P3-7, ④ → P5-3·P5-4)
- 학습 진도 체크 (브라우저에 저장)
- 페이지별 자가 점검 퀴즈
- 사이트 랩과 같은 결과를 numpy로 재현하는 교차검증 스크립트 (`scripts/verify/`, 원본 실습 1)
- 피크 보간(P1-4 심화)을 별도 미니 랩으로
