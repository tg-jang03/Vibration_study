# Contents — 사이트 콘텐츠 목록 & 사양

> 사이트에 실제로 들어가는 페이지, 랩, 기호·수식, 검증값, 참고자료의 **단일 목록**이다. 구현하기 전에 여기에 사양을 먼저 쓰고, 진행에 따라 상태를 갱신한다.
> 무엇을 가르치는지(학습 목표, 내용, 과제)는 `Curriculum.md`, 어떻게 구현하는지(조작, 출력, 검증값)는 이 문서에 있다.
> 원본 커리큘럼: `source/curriculum.md` (읽기 전용). 원본과 달라진 내용은 `Issues.md`(유형: 콘텐츠)에 근거와 함께 기록한다.
> **읽는 법 (D-030)**: 통째로 읽지 않는다. `grep -n "^##" docs/Contents.md`로 목차를 보고 필요한 절만 읽는다 — 개념 척추 §1-2, 기호·식 §3, 페이지 상태 §4, 그 랩의 사양 §5(`grep -n "LAB-XXX"`), 기준값 §6.

## 0. 상태 표기

`계획`(Curriculum.md에 개요만 있음) → `사양`(이 문서에 구현 사양 작성) → `구현중` → `검토` → `완료`

## 1. 페이지 작성 기준 (D-025 톤 + D-026 그림·개념 순서 + D-028 지침서)

> **작성 방법(톤, 뼈대, 그림, 강조 상자, 랩 배치, 수식, 체크리스트)은 `docs/PageGuide.md`가 기준이다** (D-028, 2026-10-06). 기준 페이지는 P2-1 ~ P2-5.
> 이 절에는 콘텐츠별 기준인 **§1-2 개념 척추**만 둔다. 아래 1-1·1-3·1-4·1-5는 옛 참조가 끊기지 않도록 남긴 자리표시다.

### 1-1. 독자와 톤 → `PageGuide.md` §1

### 1-2. 개념 순서 규칙 (가장 중요)

1. 페이지는 **앞 페이지까지 설명한 개념만** 쓴다. 뒤에서 다룰 개념이 꼭 필요하면 한 줄로 풀고 "(P2-5에서 자세히)"처럼 위치를 밝힌다.
2. 처음 나오는 전문용어는 그 자리에서 한 줄로 푼다 — 괄호 풀이 또는 `용어 풀이` 상자. 영문 병기(D-005).
3. 진단 용어(오일 휠, GMF, BPFI, 러브, 2LF 등)를 예로 쓸 때도 무엇인지 한 줄로 푼다. 풀기 어려우면 예로 쓰지 않는다.
4. 개념 척추 — 각 페이지는 이 순서를 지킨다. Part 1이 먼저이고, Part 2는 Part 1 위에 쌓는다 (D-027).

**Part 1 개념 척추** (기준 독자: 고교 물리 F = ma, 미분 = 변화율)

| 페이지 | 새로 도입하는 개념 | 기대고 있는 개념 |
|---|---|---|
| P1-1 | 진동(왕복 운동), 평형 위치, 복원력 F = −kx·강성 k, 관성, 변위 x(t), 끝점·평형점, 주기 T, 위치·운동 에너지 교환(맛보기) | 고교 물리 (F = ma), 미분 = 변화율 |
| P1-2 | 운동방정식 m ẍ + kx = 0, 정현파 해, 진폭 A·주파수 f·위상 φ, ω = 2πf, 고유진동수 f_n = √(k/m)/2π, 초기조건 x₀·v₀, 속도·가속도와 위상 관계(90°씩 앞섬) | P1-1 |
| P1-3 | 감쇠·감쇠 계수 c, 감쇠비 ζ, 부족·임계·과감쇠, 포락선 e^{−ζω_n t}, 감쇠 고유진동수 ω_d, 대수감쇠율 δ(맛보기) | P1-2 |
| P1-4 | 가진력 F₀ cos ωt, 과도 응답 vs 정상상태 응답, 진동수비 r, 진폭비 X/X_st, 위상 지연 0° → 90° → 180°, 공진·Q ≈ 1/(2ζ), 주파수응답(FRF)·Bode 선도, 맥놀이(맛보기) | P1-2, P1-3 |
| P1-5 | 자유도, 2자유도계·연성, 고유진동수 2개, 모드 형상(동상·역상), 중첩, 연속체의 많은 모드 | P1-2, P1-4 |
| P1-6 | 구동기/피동기·모터/로터/고정자·축/커플링/축계, 베어링의 방식(구름/유막)과 하중 방향(반경/추력), 하우징/받침대/기초, 횡/축/비틀림 운동, 구성 → MCK 대응, 무질량 직렬 강성 예제 | P1-1~P1-5. 요소 주파수(P1-8)·측정(Part 3)·결함(Part 7)은 뒤에서, 여기서는 구성만 |
| P1-7 | rpm·f = rpm/60·Ω, 불평형 m_u·e, 원심력 m_u e Ω², 회전하는 힘 = 주기 가진, 1X, 임계속도, 런업, 진폭·위상 vs rpm | P1-4, P1-5 |
| P1-8 | 세는 규칙(한 바퀴에 k번 → k·f_r), 하모닉(2X·3X), 날개 통과 N_b·f_r, 기어 맞물림 z·f_r·회전수비, 구름베어링 FTF·BPFO·BPFI(근사, 정수배가 아님), 충격 → 구조 고유진동수 울림(kHz), 유막 0.38 ~ 0.48X, 벨트, 2 f_L, 회전 관련 vs 고정, 관심 주파수 구간 4개 (D-032) | P1-2 ~ P1-4, P1-7 |
| P1-9 | 여러 원인의 합(1X·2X·날개 통과·구조 공진·잡음), 순문제 vs 역문제, 증거 5요소, "다시 나누려면?" (스펙트럼 동기) | P1-1 ~ P1-8 |

**Part 2 개념 척추**

| 페이지 | 새로 도입하는 개념 | 기대고 있는 개념 |
|---|---|---|
| P2-1 | 시간파형·측정량과 단위·측정 기준, 차수·서브싱크로너스, Peak·Pk-Pk·RMS·DC·CF, 스펙트럼 vs FRF, 샘플·f_s·Δt·N·T·Δf·f_N, 에일리어싱(맛보기). 정현파·d·v·a·1X의 물리는 P1-2·P1-7에서 가져와 짧게 되짚기만 한다 (M2.9) | Part 1 (P1-1 ~ P1-9) |
| P2-2 | 하모닉·푸리에 급수, 상관(내적), DFT·bin, 진폭/위상 스펙트럼, 단일측, 제로패딩, FFT | P2-1 |
| P2-3 | 나이퀴스트 상세, 에일리어스 주파수, AAF, F_max·2.56·LOR, ADC·비트·양자화·클리핑 | P2-1, P2-2 |
| P2-4 | Δf = 1/T 상세, 두 성분 분리, smearing, Zoom FFT (윈도우 없이 설명) | P2-2, P2-3 |
| P2-5 | 누설, 윈도우, 메인로브·사이드로브, 보정계수(ACF·ECF·ENBW) | P2-4 |
| P2-6 | 잡음의 흔들림, 평균 방식(선형·지수·피크 홀드·벡터), 오버랩, TSA(빗살 통과 특성 ∣H∣, 기어 맞물림 주파수, Residual) | P2-5 |
| P2-7 | 라인 수와 잡음 바닥(bin = Δf 폭의 바구니), 파워 스펙트럼, PSD·ASD, 대역 RMS(overall)와 ENBW로 나누기, derived peak(√2 × RMS) vs true peak, 단위 관례(µm pp·mil·mm/s rms·in/s pk·g)와 정현파 환산, dB(진폭 20 log·파워 10 log)·기준값, 로그 축 | P2-1 ~ P2-6 |
| P2-8 | 반송파·변조 주파수·변조 지수 m·포락선, AM → 측대역 f_c ± f_m(높이 m/2), 측대역 간격 = 원인 주파수, 짧은 변조 → 측대역 여러 쌍, FM·β·베셀 함수 Jₙ(β), AM + FM 비대칭, 맥놀이와 AM 구별 | P2-2(펄스열), P2-4(맥놀이·측대역 소개·분해능), P2-5, P2-6(기어 맞물림), P2-7(dB) |
| P2-9 | 설정을 정하는 순서(목적 → F_max → 라인 수 → T → 윈도우 → 평균 → 표시 → 확인), 최소 간격 ÷ 3.5로 라인 수 계산, F_max 위 성분과 AAF 점검, 목적별 출발점(예시값, I-014), 결과 확인표, 1X보다 낮은 성분(0.4 ~ 0.5X, 소개) | P2-1 ~ P2-8 |

**Part 3 개념 척추** (D-031, 2026-10-06)

| 페이지 | 새로 도입하는 개념 | 기대고 있는 개념 |
|---|---|---|
| P3-1 | 센서 세 종류(비접촉 변위·속도·가속도)와 재는 양(상대·절대), 감도(mV/g 등), 센서 = 기초가진 1자유도 계(질량·스프링이 든 통), 가속도계(r ≪ 1)·속도계(r ≫ 1)의 평탄 대역, 마운팅 공진, GT/ST에서 비접촉 변위 센서를 주로 쓰는 이유 | P1-4(공진·진폭비·위상 지연), P2-1(변위·속도·가속도), P2-3(대역·AAF), P2-7(단위) |
| P3-2 | 프로브 시스템(프로브·케이블·드라이버), gap 전압·감도·선형 범위, DC = 평균 위치·AC = 진동, 런아웃(기계적·전기적), X-Y 배치 | P3-1 |
| P3-3 | 키페이저(1회전 1펄스 → 회전수·각도 기준), 위상 = 지연각 φ = 360°·Δt/T(1X 성분으로, 동기 샘플링 DFT·트래킹 필터는 이름만), 관례(앞섬각 −φ·영점 기준 φ − 90°, 센서 종류·설치 각도), 1X 벡터 A∠φ = Ae^{−jφ}, Polar 플롯(0° = 센서, 지연 = 회전 반대, high spot은 이름만), 런업의 Bode vs Polar, Slow roll 보상(벡터 빼기, 구간 고르기), 위상차 진단(X-Y → 오빗 원·직선, 두 베어링 동상·역상 → 병진·원추, 정적·커플 불평형, 커플링 축방향 180° → 정렬 불량) | P3-2, P2-2(DFT 위상), P2-5(누설), P2-6(화살표·트리거), P1-2(속도·가속도 위상), P1-4(위상 지연), P1-5(동상·역상), P1-7(Bode) |
| P3-4 | 측정 체인(마운팅 → 센서 → 케이블 → 전원 → 분석기 입력 → 계산)과 단계별 가짜 신호: 설치·센서 공진 봉우리(넓고, 회전수를 따라가지 않음), IEPE·바이어스 전압(정상·끊김·합선)·AC 결합·정착 시간, ski-slope(v = a/2πf로 낮은 주파수가 부풂, 원인: 정착·열 충격·충격 뒤 회복·케이블), 그라운드 루프(60 Hz와 홀수배, 접지 분리), 케이블·커넥터 잡음(마찰전기는 이름만), 입력 넘침(클리핑 → 정수배 막대), 확인 습관(바이어스·시간파형·넘침 표시·지난 측정·다른 센서) | P3-1(설치 공진), P3-2, P2-3(클리핑·양자화), P2-4·P2-9(분해능), P2-7(v = a/2πf, overall), P1-8(회전 관련 vs 고정, 2f_L) |
| P3-5 | 정상상태 vs 과도 수집, Δt 트리거 vs Δrpm 트리거(임계 구간을 놓침), 동기 샘플링 → 차수 스펙트럼(스미어링 없음), 런업 그림(Bode·Polar·Cascade·Shaft centerline), 기계 보호 시스템(채널 구성: X·Y·축 방향 위치·키페이저·케이싱), Alert·Danger·트립·헛트립, 시간 지연, 보팅(1oo1·1oo2·2oo2), 기동 중 트립 배율, Danger bypass, 보호 vs 상태감시 | P3-2(gap·Not OK), P3-3(키페이저·1X 벡터·직선 오빗), P3-4(튐·센서 이상), P2-4(스미어링·차수 추적 소개), P2-6(차수 스펙트럼), P1-7(임계속도·런업) |

**Part 4 개념 척추** (D-034·D-036·D-040 — 트랙 B가 M5에서 쓴다. Part 3 다음, Part 5 앞)

| 페이지 | 새로 도입하는 개념 | 기대고 있는 개념 |
|---|---|---|
| P4-1 | 불평형 응답의 Bode(1X 진폭·위상 vs rpm)와 Polar(1X 벡터 궤적), heavy spot vs high spot, 증폭계수 AF = N_c/(N₂ − N₁) ≈ 1/(2ζ)·Half-power, 분리여유 SM(개념, 규격 수치 없음), 런업 데이터의 오차(rpm 간격·잡음·런아웃) | P1-6, P1-4, P1-7, P3-3(1X 벡터·위상 관례, §3) |
| P4-2 | 자전/선회·강체 병진/기울기와 축 굽힘 도입 → Jeffcott 로터(원판 + 탄성축), 복소 좌표 z = x + jy, 정방향 동기 선회·원형 오빗, 비등방 지지 → 타원 오빗·임계속도 2개·역방향 선회, 정/역 성분 A_f·A_b(페이지에서 식으로 직접 계산 — 데이터에서 꺼내는 Full spectrum은 P5-3), 강성/유연 로터 | P1-6, P1-5, P1-7, P4-1, P2-2(복소 표현) |
| P4-3 | 유막의 압력 생성·하중 지지 → 저널 베어링(간극·편심률 ε·자세각), Shaft centerline(gap 전압 DC로 그린 축 중심 vs rpm, cold gap 기준, 떠오름·비정상 위치·장기 변화), 유막 계수(K_xx … C_yy)는 이름과 뜻만 | P1-6, P3-2(gap 전압), P3-5(런업 그림), P4-1 |
| P4-4 | 교차연성 k_xy·접선력, Oil whirl(회전수 추종, 예시 0.45X)·whip(모드 주파수 근처에 잠김), 복소 고유치 λ = σ ± jω_d·불안정(σ > 0), Log decrement, 안정 한계(k_xy = 2ζk, k_xy = cΩ/2 모델 → Ω = 2ω_n), Campbell 선도(개념) | P1-3, P1-8(기름막 0.38 ~ 0.48X), P4-2, P4-3 |

**Part 5 개념 척추** (D-040 — 트랙 A가 M4에서 쓴다. Part 4 다음)

| 페이지 | 새로 도입하는 개념 | 기대고 있는 개념 |
|---|---|---|
| P5-1 | 크기 응답 ∣H(f)∣, 통과·차단·전이 대역, 차단 주파수(−3 dB), 저역·고역 통과, 옥타브·디케이드(차수당 6 dB/옥타브), Butterworth·Chebyshev(리플)·Bessel(Elliptic 이름만), IIR·FIR·탭, 위상 응답·군지연 τ_g·선형 위상, 넘침(overshoot), 필터 지연과 1X 위상, 두 번 거르기(영위상, ∣H∣², 저장된 데이터만), 적분 = 1/(j2πf) 필터, 하한 컷오프(2차면 1X의 1/3 이하), 누적합 적분·드리프트·적분 상수, 데시메이션(저역 통과 → 솎기) | P2-3(AAF·dB·차수), P2-2(위상과 파형 모양·사각파·복소 표현), P1-4(위상 지연), P1-2(속도·가속도 위상), P2-7(v = a/2πf), P3-4(ski-slope), P3-3(1X 위상), P2-4(Zoom FFT) |
| P5-2 | STFT(프레임·윈도우·FFT·hop, 프레임 시각), 스펙트로그램(시각 × 주파수 × 색), 프레임 길이 트레이드오프(Δf = 1/T vs 시각 T, 번짐 ≈ max(1/T, aT), T_best = 1/√a), 워터폴(세로 = 시간) vs 캐스케이드(세로 = 회전수), 줄 읽기(비스듬 = 회전·기울기 = 차수, 세로 = 고정, 꺾임 = 잠김, 교차 = 공진), 오일 휠 → 휩(모양만), 웨이블릿(개념) | P5-1, P2-4(스미어링·Δf), P2-5(윈도우), P2-6(오버랩), P3-5(Cascade·Δrpm), P1-8(기름막 0.38 ~ 0.48X), P1-4(공진) |
| P5-3 | 반공진, 교차 스펙트럼 G_xy = ⟨X*Y⟩(힘을 위상 기준으로 쓰는 벡터 평균)·자기 스펙트럼, H1·H2와 잡음 쪽에 따른 쏠림(평균으로 안 줄어듦), 코히어런스 γ² = ∣H1∣/∣H2∣(M = 1이면 항상 1), 채널 사이 위상, Full spectrum(z = x + jy의 FFT, ±f = 반시계·시계 반지름, 두 배 하지 않음), 센서 전제(90°·감도 → 가짜 역방향) | P1-4(FRF), P2-6(벡터 평균·화살표), P2-7(파워 스펙트럼), P2-2(반쪽 스펙트럼·복소), P4-2(A_f·A_b·오빗), P3-2·P3-3(X-Y 배치·위상), P5-2(오일 휠) |
| P5-4 | 계산형 차수추적(키페이저 시각 → 각도-시간 곡선(세 펄스의 2차식, 가속 반영) → 등각도의 시각 → 신호 보간 → 정수 바퀴 FFT), 등각도 재샘플링, 두 눈금(시간 FFT: 고정 주파수 또렷·회전 성분 번짐 / 차수 스펙트럼: 반대), Uniform 윈도우(정수 바퀴), 차수 분해능 Δo = 1/N_rev, 최대 차수 N_spr/2.56, 차수 영역 에일리어싱(넉넉히 찍고 걸러 솎기), 보간 오차(선형 vs 3차), tacholess(스펙트로그램 능선 → 적분 → 가상 펄스, 높은 차수 번짐·위상 없음) | P2-4(스미어링·Δf), P3-5(동기 샘플링·차수 스펙트럼), P3-3(키페이저·1X 위상), P2-3(에일리어싱·2.56), P2-5(윈도우·누설), P5-1(데시메이션·저역 통과), P5-2(스펙트로그램·캐스케이드) |
| P5-5 | 고정 띠 통과는 회전수마다 다른 성분을 잡음 → 트래킹 필터(통과 띠의 가운데가 1X를 따라감), 복소 복조 + 저역 통과 V_nX = 2 LPF{x e^{−jnθ}}(돌려 세우면 nX만 멈춤, 동기 DFT도 같은 일), 필터 폭 B = 2f_c(띠 통과로 본 −3 dB 폭), 잡음 흔들림 ∝ √B·지연 τ_g = √2/(πB) ≈ 0.45/B(2차 Butterworth), 런업 Bode의 밀림 ΔN ≈ Rτ_g와 깎임(AF가 작게), 런업↔코스트다운 반대로 밀림, 두 번 거르기(지연 0, 더 깎임), 노치·Not-1X(뽑은 1X 파형을 뺌, 1X가 빨리 변하면 새어 나옴), 1X 필터 오빗(이름과 모양, 판독은 P6-3) | P5-1(Butterworth·군지연·두 번 거르기), P2-2(템플릿 곱하기·복소 표현·반쪽 진폭), P3-3(키페이저·1X 벡터·동기 DFT), P5-4(θ(t)), P4-1(Bode·AF·반파워 폭), P5-2(시간-주파수 트레이드오프), P2-7(overall RMS), P4-2(오빗), P4-4(오일 휠) |
| P5-6 | 결함 = kHz 공진 울림이 결함 주파수로 진폭 변조 → 원신호 스펙트럼의 결함 주파수 자리엔 거의 없음·고주파 측대역은 박자 흔들림으로 번짐, 엔벨로프 분석(대역 통과 → 포락선 → 평균 빼고 FFT), 해석 신호 x + jH{x}·힐베르트 변환(90° 늦춤)·정류 + 저역 통과, 벤더 기법(비교 불가), 대역·폭 선택(엔벨로프 스펙트럼은 0 ~ 대역 폭만 담음, 틀린 대역 → 1X 줄·묻힘), 내륜 BPFI ± 1X 측대역, 첨도 K(잡음 3·정현파 1.5), Spectral Kurtosis(복소 포락선, −2로 잡음 = 0, 정현파 −1, 프레임 < 충격 간격), Kurtogram(가운데 × 폭, 반 칸씩, 결함 없어도 최댓값을 고름) | P1-8(BPFO·BPFI·충격 울림), P2-8(AM·측대역·포락선), P2-7(dB), P5-1(대역 통과), P5-2(STFT·트레이드오프), P5-5(복소 복조), P3-1(가속도계·설치 공진), P2-1(RMS) |
| P5-7 | 줄 무리(두 축의 측대역)가 섞이면 간격을 세기 어려움, 헌팅 투스(공약수 없는 이빨 수), 실 켑스트럼 c(τ) = F⁻¹{ln A}·quefrency·라모닉(봉우리 줄의 간격으로 읽음), 로그 = 곱 → 합·크기 차이 누름, 리프터링(빗 = 한 무리 지우기, 낮은 quefrency = 매끈한 모양·전달 경로), 자기상관 R(τ)(주기 찾기, 큰 성분에 덮임 → 포락선 뒤에), 특징량 RMS·Peak·CF·첨도·왜도(CF는 표본 하나에 흔들림), 결함 진행 추세(초기 첨도·CF 먼저, 말기 RMS 상승·첨도 하락 → 여러 특징량), MED·ANC/SANC(이름만) | P2-8(측대역·변조), P2-2(상관·템플릿), P1-8(기어 맞물림·요소 주파수 표), P5-6(첨도·포락선·BPFO), P2-1(RMS·CF), P2-6(TSA 잔차), P2-7(dB) |

**Part 6 개념 척추** (D-041 확정 — 트랙 B가 M6에서 쓴다. 앞 Part에서 원리를 배운 플롯은 판독만)

| 페이지 | 새로 도입하는 개념 | 되짚기만 하는 것 (위치) |
|---|---|---|
| P6-1 | 파형 판독 순서(주기 → 대칭 → 회전당 사건 수 → 충격), 절단(truncation)과 클리핑 구별, 위아래 비대칭의 단서와 한계(성분 합성·DC 이동도 구별, 러브·풀림은 이름만, P7-3), 키페이저 마커를 겹쳐 사건 수 세기, 패턴 맞히기 | RMS·CF·Pk-Pk(P2-1), 하모닉·위상과 모양(P2-2), 맥놀이·AM(P2-8), 클리핑(P2-3·P3-4), 필터가 파형을 바꿈(P5-1) |
| P6-2 | 스펙트럼 판독 순서, 1X 아래·비동기·고주파 대역 읽기, 휠(따라감) vs 휩(잠김) 판정, Full spectrum cascade(정/역 성분의 회전수 의존) | 요소 주파수(P1-8), STFT·스펙트로그램·워터폴/캐스케이드·줄 모양(P5-2), Full spectrum 계산(P5-3), 정/역 선회(P4-2) |
| P6-3 | 같은 시각 X/Y·AC/DC·동일 축척 → 직접 취득 대역 vs 실제 1X 필터 → blank→dot→시간 증가·센서/관찰 방향 → 형태와 성분/원인 후보 → 펄스 수 vs 서로 다른 자리(1/nX·p/nX·0.43X·정수 조합, I-012 해결) → 절단/포화 감별 | 오빗·정/역 선회(P4-2), X-Y 배치·위상(P3-2·P3-3), 트래킹 필터(P5-5) |
| P6-4 | 스칼라(overall) 트렌드의 한계, 벡터 트렌드, Acceptance region, APHT(진폭·위상 vs 시간), 변화량으로 판단(수치는 P10-1) | 1X 벡터·Polar(P3-3·P4-1), 대역 RMS(P2-7), 보호 vs 상태감시(P3-5) |

**Part 7 개념 척추** (D-042 — 트랙 A. 결함마다 메커니즘 → 증거 5요소 → 감별 → 확인. 신호처리(Part 5)·플롯 판독(Part 6)은 되짚기만, 판정 수치는 Part 10. 나머지 절은 그 세부를 시작할 때 채운다)

| 페이지 | 새로 도입하는 개념 | 되짚기만 하는 것 (위치) |
|---|---|---|
| P7-1 | 주파수 → 원인 지도(차수로 후보 좁히기), 같은 자리의 후보를 위상·방향·운전조건으로 가르기, 결함 합성기(지문), 회전수 추정(하모닉 무리·켑스트럼·자기상관, 2배·절반으로 틀림), 명판·슬립·동기속도·기어비·날개 수로 역산 | 요소 주파수 지도(P1-8), 증거 5요소(P1-9), Δf = 1/T(P2-4), 측대역(P2-8), 스펙트로그램 줄 모양(P5-2), 엔벨로프(P5-6), 켑스트럼·자기상관(P5-7) |
| P7-2 | 1X를 만드는 것(도는 것·방향이 정해진 힘·런아웃·공진), 정적·커플·동적 불평형과 두 베어링 위상(동상·역상), 불평형의 지문(회전수² → 2배에 약 4배, 저속 0, 수평·수직 약 90°, 지지 강성 차이로 타원), 휨(bow)의 응답 b/(1 − r² + j2ζr)·런아웃과의 구별, slow roll 보상이 지우는 것과 남기는 것, 휨을 평형추로 덮는 한계, 크랙(방향마다 다른 강성 → 2X, 숨 쉬는 크랙, 임계속도 절반의 2X 봉우리, 1X·2X·slow roll 벡터 추세), 방향이 정해진 1X 힘(편심 풀리: 선 오빗, 회전수와 무관, 평형추로 안 잡힘), 구조(받침대) 공진(한 베어링 한 방향, 좁은 범위의 봉우리·위상 급변, 임팩트 시험), 1X 감별 순서 | 1X 벡터·Polar·slow roll 보상·정적/커플(P3-3), 런아웃(P3-2), 코스트다운(P2-4), 동상·역상 모드(P1-5), 공진·위상(P1-4), Bode·동적 배율·heavy spot(P4-1), 강체 병진·기울기·강성 로터·정방향 타원 오빗(P4-2), 오빗 판독(P6-3), APHT(P6-4), 트래킹 필터 2X(P5-5), 받침대(P1-6), 1X 후보 지도(P7-1) |
| P7-3 | 비선형(힘이 변위에 비례하지 않음 → 하모닉·분수 하모닉·운동이 바뀜), 접촉이 진동을 키우기도 함, 미스얼라인의 예하중·방향이 정해진 1X·2X 힘·축방향 힘, 바나나·8자 오빗과 축 자리(예하중이 Shaft centerline을 옮김, 덜린 베어링의 오일 휠), 커플링 건너 약 180°, "각 = 축방향, 평행 = 2X"는 단순화(I-013), 구조적 풀림(이음 양쪽 진폭·위상 급변)·회전 풀림(잘린 파형·하모닉 무리·½X 무리), 러브(부분: 하모닉·½X·⅓X·역방향 성분, 원주: 역방향 선회가 고유진동수에 잠김(dry whip)·빠르게 커짐(dry whirl) → 즉시 정지, 열적: Newkirk — 1X 벡터가 임계속도 아래에서 회전 반대로 돌며 커짐), 증거 5요소·감별 | 질량-스프링·공진(P1-4), 하모닉·사인파 아닌 주기 파형(P2-2), Jeffcott·정/역 선회(P4-2), Shaft centerline(P4-3), 오일 휠(P4-4), high spot(P4-1), 미스얼라인 정의·위상(P3-3), 측정 체인 잘림(P3-4), 파형 절단(P6-1), 오빗 판독·키페이저 점(P6-3), APHT(P6-4), Full spectrum(P5-3), 휨·방향이 정해진 힘(P7-2) |
| P7-4 | 1X 아래 후보 지도(오일 휠·휩, 유체력 선회, ½X, Rotating stall, 구조 공진, 케이지 FTF — 자리는 겹친다), 유체막 불안정의 증거 5요소(0.38 ~ 0.48X 추종 → 모드에 잠김, 정방향, 흩어지는 키페이저 점, 갑작스러운 시작, 히스테리시스), 가벼운 베어링·낮은 유온, 유체력 선회(증기·씰 교차연성 — 부하·압력 문턱), Rotating stall(유량 ↓), 운전조건 시험(유온·베어링 하중·공정 부하), 서브싱크로너스 감별표(방향·키페이저 점·반응하는 조건), 대책의 방향 | 교차연성·휠·휩·대책(P4-4), 편심률·Shaft centerline(P4-3), 캐스케이드 잠김(P6-2), 오빗·키페이저 점(P6-3), Full spectrum(P5-3), 러브·풀림 ½X·원주 러브(P7-3), 서브싱크로너스(P2-1), 케이지 FTF(P7-5) |
| P7-5 | 접촉각 α를 넣은 결함 주파수 식·앵귤러 볼베어링, 어림값의 한계, 미끄럼(케이지 늦음 → BPFO ↓·BPFI ↑), BSF 1배/2배 관례·볼 결함 2×BSF ± FTF, 위치마다의 변조(외륜 없음·내륜 1X·볼 FTF·케이지 FTF), 고장 4단계와 단계별 방법, 초음파 대역, 증거 5요소·감별·확인 | FTF·BPFO·BPFI·BSF(P1-8), 측대역·변조(P2-8), 가리비 손실·ENBW(P2-5), 설치 공진(P3-1), 엔벨로프·하중 영역·첨도·SK(P5-6), 특징량 추세(P5-7), 진단 지도·합성기(P7-1) |
| P7-6 | 맞물림 주파수 GMF = z₁f₁ = z₂f₂(두 축에 공통인 줄 하나)·피니언, 전달 오차(건전해도 GMF, 부하에 따라 변함 → 같은 부하끼리 비교), 측대역 간격 = 결함 축의 회전수, 헌팅 투스 주파수 f_HT = GMF ÷ LCM(z₁, z₂)·GCD·헌팅 투스 설계, 결함마다의 모양(마모 = 2×·3×GMF·인벌류트, 편심 = 측대역 한 쌍, 깨진 이 = 작은 측대역 다수·한 바퀴 한 번 충격, 백래시 = 가벼운 부하에서 덜컥거림), 축마다의 TSA → Residual·Difference·FM4·이빨 번호, 켑스트럼 봉우리 추세, 증거 5요소·감별·확인 | 기어 맞물림(P1-8), Δf·Zoom FFT(P2-4), TSA·빗살 통과·Residual(P2-6), AM·FM 측대역(P2-8), 측정 설정(P2-9), 차수추적(P5-4), 포락선·첨도(P5-6), 켑스트럼·헌팅 투스(P5-7), 회전수 역산·합성기(P7-1), 구름베어링 감별(P7-5) |
| P7-7 | 자기력 ∝ 전류² → 2×LF(회전수와 무관한 고정 자리), 고른 공극은 합력 0·고정자만 출렁, 정적 공극 편심·고정자 결함·소프트 풋 → 2×LF, 동기속도·슬립 주파수·극통과 주파수 PPF = P·f_slip = 2f_L − P·f_r(2×LF는 P·X보다 PPF 위, 4극은 4X), 로터바·동적 공극 편심 → 1X ± PPF·2×LF ± PPF(부하 의존, T ≥ 3/PPF, 전류 측대역 LF ± PPF), 전원 차단 시험(첫 순간에 사라지는 몫 = 전기), 인버터 구동의 LF, 2극 동기 발전기 1X = LF·2X = 2×LF → 회전수를 유지한 계자 차단·변경(즉시 = 자기력, 느림 = 계자 열 → P8-5), 축 전압·베어링 전식, 감별표 | 공극·고정자(P1-6), Δf = 1/T·2X vs 2LF·Zoom FFT(P2-4), AM 측대역·맥놀이(P2-8), 과도 수집(P3-5), 스펙트로그램(P5-2), 동기속도·슬립·명판(P7-1), 열 휨(P7-2), 미스얼라인 2X(P7-3), 구름베어링 결함(P7-5) |
| P7-8 | 날개 통과 f_BP = N_b f_r(볼류트 혀·디퓨저, 2배), 크기 = 간극·운전점·손상·공진, 최고 효율점(BEP)·성능 곡선, BEP에서 멀수록 날개 통과 ↑, 저유량 재순환(낮은 주파수 넓은 둔덕), 수력 불평형(유량에 반응하는 1X) vs 기계 불평형, 캐비테이션(증기압·NPSHa/NPSHr, 유량 ↑·흡입 ↓ → kHz 넓은 대역, 포락선에 줄 없음 → 베어링 결함과 구별), 압축기 성능 지도·서지선, Rotating stall(유량 ↑ → 사라짐, 오일 휠과 구별), 서지(역류, 몇 Hz 이하·축방향 위치 튐)·서지 방지(재순환 밸브), 연소 동역학(→ P8-4), 감별 시험 = 회전수를 두고 유량·압력 바꾸기 | 임펠러(P1-6), 날개 통과(P1-8), 넓은 대역·줄(P2-1), dB(P2-3), 포락선(P5-6), 1X 계열(P7-2), Rotating stall·오일 휠(P7-4), 구름베어링 단계·BPFO(P7-5), 기어 맞물림(P7-6) |

**Part 8 개념 척추** (D-043 — 트랙 B가 M8에서 쓴다. 현상 → 메커니즘(Part 4·7 링크) → 데이터에서 어떻게 보이나(Part 6 플롯) → 운전 대응. 메커니즘은 되짚기만, 판정 수치는 Part 10. 세부를 시작할 때 이 행을 다듬는다)

| 페이지 | 새로 도입하는 개념 | 되짚기만 하는 것 (위치) |
|---|---|---|
| P8-1 | 강체/굽힘 모드와 여러 동기 공진, 복소 모드 중첩·상쇄, 분리 모드의 약180° 전이와 합성 위상의 차이, 피크·위상·Polar를 함께 읽기, 동일 방향 센서의 동상/역상은 모드 형상 단서(두 곳으로 모드 차수 확정 불가), 중앙 마디의 센서·가진 참여의 함정, 감쇠·가까운 모드의 AF 해석 한계, 냉간/열간과 bow의 등가 모드 변위·slow roll 보상 편향, 승인된 통과/보호 절차·자료 비교 | 모드 형상(P1-5), 1모드 Bode/Polar·AF·개념SM(P4-1), 위상·slow roll(P3-3), 과도 수집·보호(P3-5), 강체/유연 로터(P4-2), 반공진(P5-3), 필터 지연(P5-5), Waterfall·오빗·벡터 트렌드(P6-2~4), bow/러브(P7-2~3·미공개 위치만) |
| P8-2 | 열 휨(thermal bow: 정지 중 상하 온도차 → 축이 휨 → 기동 시 큰 1X), 터닝 기어(정지 중 천천히 돌려 온도를 고르게)·eccentricity(slow roll 런아웃 p-p)로 기동 판단, bow 벡터 + 불평형 응답 벡터, Morton effect(저널 원주의 고르지 않은 가열·hot spot → 열 bow → 1X 벡터가 수 분 ~ 수 시간 주기로 선회·나선, 부하·오일 온도 영향), Newkirk effect와의 구별(접촉 마찰열 vs 유막 전단열) | slow roll 보상(P3-3), heavy/high spot(P4-1), 오빗·hot spot 자리(P6-3), APHT·Acceptance region(P6-4), 여러 모드 통과(P8-1), bow(P7-2), 러브·Newkirk(P7-3) |
| P8-3 | Steam whirl/whip(부하가 오르면 서브싱크로너스가 생기는 threshold load), 노즐 분사력 비대칭·씰 교차연성, partial arc admission(밸브 조건 → 증기력 방향 → 베어링 하중 → Shaft centerline·편심률 변화; 안정성은 베어링 동계수·증기력·모드로 별도 평가), 차열팽창(differential expansion)·축방향 위치(thrust)·eccentricity 감시의 의미와 한계, 다축 ST의 catenary·cold-hot alignment·베어링 하중 분배 | 교차연성·whirl/whip·안정 한계(P4-4), 유막·편심률·Shaft centerline(P4-3), 보호 채널(P3-5), 캐스케이드 판독(P6-2), 서브싱크로너스 감별(P7-4), 미스얼라인(P7-3) |
| P8-4 | Alford 팁 간극/일 추출 차이→교차력, 실속 셀 통과 vs 서지 압축계, 연소 압력/열방출·종방향/원주 진행·정재 모드·절점/위상, 센서 위치/단위/대역, 가상 기어축별 TSA, FOD 응답 벡터 차·국부 블레이드/Campbell 후보 | 교차연성(P4-4), 벡터 트렌드(P6-4), 구름베어링(P7-5), 기어·TSA(P7-6), stall/surge(P7-8), 블레이드·Campbell(P7-9) |
| P8-5 | 극수에 따른1X/LF/2LF 구별 → 코어·단부 국부 공진과 센서 위치 → 계자 전류 단계/복귀·열 지연·1X 벡터 합성/상쇄 → 설계된 축 접지/절연·전압/전류 경로 → 두관성 비틀림과LF기준 SSR·전기/기계 측정 → 냉간/열간 커플링 정렬의 추가 증거 | 벡터 트렌드·APHT(P6-4), 1X 계열(P7-2), 미스얼라인(P7-3), 2×LF·극통과(P7-7), 비틀림·SSR(P7-9) |

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
| 도는 화살표 (위상자, Phasor) | 길이 A, 각도 θ = 2πft + φ로 반시계로 도는 화살표. 끝의 높이 = x(t) | — | 그림에서 신호 축은 위(0°), φ = 출발 각도(반시계 +). 꼬리-머리로 이으면 끝 = 성분의 합. 오빗만 x 오른쪽·y 위 (D-044, `lib/dsp/phasor.ts`·`ui/PhasorView`) |
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
| N_rpm, T_r | 회전수 / 한 바퀴 시간 | rpm / s | T_r = 60/N_rpm (P6-1), 프레임 표본 수 N과 구별 |
| n_e, Δt_e | 한 바퀴 사건 수 / 사건 간격 | — / s | 등간격 회전 동기 사건에서 Δt_e = T_r/n_e (P6-1) |
| f_r, 1X | 회전 주파수 | Hz | f_r = rpm / 60 |
| z | 기어 잇수 | — | 맞물림 f_GM = z f_r (P1-8) |
| N_b | 날개 수 | — | 날개 통과 f_BP = N_b f_r |
| N_r, d, D | 구름베어링 볼(구름요소) 수 / 볼 지름 / 피치 지름 | —, m, m | 접촉각 α는 P7-5 (지수 평균 계수 α(P2-6)와 같은 글자 — 본문에서 "접촉각 α"로 밝혀 쓴다) |
| f_L | 전원 주파수 | Hz | 60 Hz. 전자기력 2 f_L |
| f_sync, f_slip, PPF | 동기속도 / 슬립 주파수 / 극통과 주파수 | Hz | f_sync = 2f_L/P (P 극수), f_slip = f_sync − f_r, PPF = P f_slip = 2f_L − P f_r (P7-7) |
| θ | 축 회전 각도 | rad | 키페이저 기준 |
| N_c, N_n | 임계속도(피크 회전수) / 고유 회전수 | rpm | |
| S | 비접촉 변위 센서 감도 | V/m (표시 V/mm) | 예 7.87 V/mm = 200 mV/mil (P3-2) |
| z | 복소 변위 x + jy | m | Jeffcott·안정성 (P4-2, P4-4) |
| A_f, A_b | 정방향 / 역방향 선회 성분 | m | z = A_f e^{jΩt} + A_b e^{−jΩt} (P4-2) |
| C_r, ε, φ | 반경 간극 / 편심률 e/C_r / 하중 방향 기준 자세각 | m / — / rad | P4-3, 직경 간극은 2C_r |
| μ, W, h_min | 점성계수 / 하중 / 최소 유막 두께 | Pa·s / N / m | P4-3 짧은 베어링 예제 |
| k_ij, c_ij | 평형점 근처 유막 강성 / 감쇠 계수 | N/m / N·s/m | 첫 첨자=힘 방향, 둘째=변위/속도 방향(P4-3) |
| q = k_xy = −k_yx | 예제의 반대칭 교차연성 강성 크기 | N/m | q ≥ 0, Fx = −qy·Fy = +qx. 전체 베어링의 일반 관계가 아님(P4-4) |
| λ = σ ± jω_d | 복소 고유치 | 1/s | σ > 0이면 불안정 (P4-4) |
| ζ | 감쇠비 | — | |
| k_eq, k_sh, k_br, k_sup | 직렬 예제의 등가 / 축 / 베어링 / 지지 강성 | N/m | P1-6 한 방향·무질량 연결 예제. k_br은 한 경로의 등가 값, 실제 두 베어링 일반식이 아님 |
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
- 지지 강성 직렬 예제(P1-6): `\dfrac{1}{k_{eq}} = \dfrac{1}{k_{sh}} + \dfrac{1}{k_{br}} + \dfrac{1}{k_{sup}}`, `f_n = \dfrac{1}{2\pi}\sqrt{\dfrac{k_{eq}}{m}}` (연결부 질량 무시, 같은 힘, 각 변형 합의 가정)
- 1X 벡터와 Slow roll 보상: `\vec V = A\,e^{-j\phi}`, `\vec V_c = \vec V - \vec V_{sr}`
- 여러 모드 1X (P8-1): X_j=Σ_m Φ_jm [e_m r_m² exp(−iθ_m)+b_m exp(−iβ_m)]/[1−r_m²+i2ζ_m r_m], r_m=N/N_m. Φ_jm는 고정된 실수 모드 형상·e_m/b_m는 같은 정규화의 등가 변위 Peak [m]. 표시 2|X_j|=p-p·φ_j=−arg X_j. i=√(−1), j는 센서 첨자. 고정 모드·대각 모드 감쇠·속도별 정상상태 가정.
- 벡터 트렌드 (P6-4): `\Delta\vec V = \vec V(t)-\vec V_{\rm ref}`, 동일 진폭이면 `\lvert\Delta\vec V\rvert = 2A\lvert\sin(\Delta\varphi/2)\rvert`. 진폭차와 구별하며 단위·Peak/Pk-Pk·기준을 명시한다.
- 학습용 허용 영역 (P6-4): `\lvert A/A_{\rm ref}-1\rvert\le\epsilon_A`, `\lvert\operatorname{wrap}_{[-\pi,\pi]}(\varphi-\varphi_{\rm ref})\rvert\le\epsilon_\varphi`. 두 조건·경계 포함, 작은 진폭이면 위상·판정 보류. 임의 학습값이며 보호 설정이 아니다.
- **위상 관례 (P3-3·P4-1·P8-1 공통, D-034)**: 위상 φ는 **지연각**(0° ≤ φ < 360°) — 키페이저 펄스에서 1X 신호의 다음 양의 피크까지의 회전각. 1X 벡터 = A∠φ (A의 단위·Peak/Pk-Pk를 함께 적는다), 복소수로는 `A\,e^{-j\phi}`. Polar 플롯은 0°를 위쪽(센서 방향)에 두고 지연이 커지는 쪽을 **회전 반대 방향**으로 그린다(기본 회전은 반시계 → 지연은 시계 방향). 시간에서 각도로: `arphi = 360^circ 	imes Delta t / T`. 장비마다 다른 관례(P3-3 §3): 앞섬각(cos 기준, FFT 위상) `psi = -arphi`, 영점 기준 `arphi - 90^circ`. Polar 플롯 랩은 `components/ui/PolarPlot`(D-035)
- 비접촉 변위 센서: `d = -V_{gap} / S` (S: 감도 크기, 양수. I-029), AC `d_{pp} = \Delta V_{pp} / S` (출력은 음전압, gap이 클수록 더 음)
- Jeffcott (P4-2): `m\ddot z + c\dot z + k z = m e \Omega^2 e^{j\Omega t}` (등방). 비등방이면 x·y를 따로 풀고 `A_f = (\tilde X + j\tilde Y)/2`, `A_b = (\tilde X^* + j\tilde Y^*)/2` (x = Re(X̃ e^{jΩt}), y = Re(Ỹ e^{jΩt}))
- 분리여유 (P4-1): SM = |N_op − N_c|/N_op × 100 %, 이 페이지의 운전 속도 기준 정의이며 규격 합격식이 아니다.
- 안정성 (P4-4): `m\ddot z + c\dot z + (k - j k_{xy}) z = 0` → `m\lambda^2 + c\lambda + k - j k_{xy} = 0`, `\delta = -2\pi\sigma/\omega_d`. 한계: `k_{xy} = c\,\omega_n = 2\zeta k`. 모델 `k_{xy} = c\Omega/2`이면 한계 `\Omega = 2\omega_n`
- Cascade 판독 (P6-2): `f_r=N/60`, `o=f/f_r`. 별도 정속 기록별 FFT(2 s·Hann·Δf=0.5 Hz); 쌓은 그림의 세로축은 시각/회전수 기준선에 진폭 표시 높이를 더한 좌표.
- 학습용 추종·잠김 (P4-4·P6-2): `f_{\rm sub}=\min(q f_r,f_n)`, 모델 교차 `N=60f_n/q`. 실제 불안정 발생 한계·진폭 예측 식이 아니다. Full spectrum은 원 반지름, +f=반시계·−f=시계(정/역 이름은 축 회전 방향과 함께).
- 오빗 점 (P6-3): `z=x+jy`, `t_k=k/f_r`, 단독 qX의 바퀴당 위상 `Δψ=±2πq`. 안정·비퇴화 단독 `q=p/n`(기약분수)은 n바퀴 뒤 점 반복. 표시 창의 펄스 수·서로 다른 자리 수·차수를 구별.
- 트래킹 필터 (lock-in): `\vec V_{nX}(t) = 2\,\mathrm{LPF}\{x(t)\,e^{-jn\theta(t)}\}`
- FRF 추정, 코히어런스: `H_1 = \dfrac{G_{xy}}{G_{xx}},\; H_2 = \dfrac{G_{yy}}{G_{yx}},\; \gamma^2 = \dfrac{|G_{xy}|^2}{G_{xx}G_{yy}}`
- 영향계수 밸런싱: `H = \dfrac{\vec V_1 - \vec V_0}{\vec W_t},\quad \vec W_c = -\dfrac{\vec V_0}{H}`
- 요소 주파수 (P1-8, D-032): `f_{GM} = z\,f_r`, `f_{BP} = N_b\,f_r`, `f_{FTF} = \dfrac{f_r}{2}\left(1 - \dfrac{d}{D}\cos\alpha\right)`, `f_{BPFO} = N_r f_{FTF}`, `f_{BPFI} = N_r (f_r - f_{FTF})`, `f_{BSF} = \dfrac{D}{2d} f_r \left(1 - \left(\dfrac{d}{D}\cos\alpha\right)^2\right)`, `f_{belt} = \pi D_p f_r / L` (D_p 풀리 지름, L 벨트 길이). P1-8은 α = 0과 근사(FTF ≈ 0.4 f_r)만 쓴다
- 응답 합성 (P1-9): `x(t) = \sum_i A_i\cos(2\pi f_i t + \phi_i) + n(t)` (정현파 + 잡음). φ_i는 시간 원점의 **시작 위상**, 키페이저 지연각과 구분한다. 감쇠 울림은 고정 A_i 정현파 하나가 아니라 별도 시간 응답으로 더한다.
- 베어링 결함 주파수: 원본 4-2 식 사용 (BSF 관례는 I-008). 위 요소 주파수 식과 같다

- P8-2 열 기여: V=U+Q, Q=B₀ exp(−t/τ) exp(−iβ) 또는 B₀(1+g t/t_end) exp[−i(β+2πt/P)]. U·Q는 센서의1X 복소 응답[m Peak], B₀[m Peak], β[rad], τ·P·t_end[s], g[—]. t_end=3600 s, Q는 Q factor와 구별. α_T[K⁻¹]는 열팽창계수. 저속 eccentricity 기하 예제는 고속 응답과 별개.

- P8-3 지정 법칙: ℓ[—]=부하율0~1, q=q₀+q_Lℓ[N/m], q는 P4-4 k_xy와 같은 교차연성. qcrit/k=2ζ, ℓ*=(2ζ−q₀/k)/(q_L/k), q_L>0·0≤ℓ*≤1일 때 유일한 구간 경계. 정적 ε에서 q·ζ를 계산하지 않는다. 자유팽창 ΔL=α_T LΔT[m], 공통 기준 타깃 예제 DE=ΔL_r+u_T−ΔL_c; u_T[m]는 전체 축 이동, 실제 센서 배치는 별도 확인.

- P8-4 동압: p′[Pa]=평균 압력에서의 변동, A_p[Pa Peak], θ[rad]=원주각, m[—]=공간 모드/셀 차수(축 차수와 구별), x/L[—]=축방향 위치. 진행 p′=A_p cos(2πft−mθ), 정재 p′=A_p cos(mθ)cos(2πft), 닫힌 관1차 p′=A_p cos(πx/L)cos(2πft). 랩의 A는 A_p. 표시 B−A 위상은 cos의 위상차·키페이저 지연각과 별도.

### 3-1. 공통 DSP 코어 구현 사양

코드와 테스트가 기준이다. 랩·그림을 만들 때 알아야 할 규약만 적는다 (끝난 코어의 설계 메모는 `archive/Milestones.md`, D-030).

- `singleSidedSpectrum` (`lib/dsp/spectrum.ts`): 진폭은 **Pk**(입력 SI 단위), 위상은 첫 샘플 기준(atan2), 정확히 0인 bin의 위상은 `NaN`. DC·나이퀴스트는 두 배 하지 않는다. 제로패딩 후에도 진폭 분모는 원래 N, 분해능·측정 시간은 패딩 전과 같다.
- `lib/dsp/average.ts`: 입력·반환은 **파워**(제곱근은 UI에서). 벡터 평균은 이미 위상 정렬된 복소 스펙트럼을 받는다(정렬은 수집 쪽 책임). 오버랩은 `frameLayout`·`splitOverlappingFrames`로 실제 샘플을 겹쳐 자른다.
- 모든 코어 함수는 입력을 바꾸지 않고, 잘못된 입력은 `RangeError`. 기준값은 §6.

- 계자 열 응답 (P8-5): i=If/기준전류 [—], h [—], τ [s], G [m Peak], β [rad]; τ h′+h=i², V=U+Gh exp(−jβ). h는 실제 온도 아님, 표시 µm Peak/RMS·지연각°.
- 자유2관성 비틀림 (P8-5): J1·J2 [kg·m²], Kt [N·m/rad], θ [rad]; ft=sqrt(Kt(1/J1+1/J2))/(2π). 강체0Hz·탄성모드, 전기/감쇠/SSR 경계 없음.

## 4. 페이지 목록

페이지 ID = `Curriculum.md`의 절 번호 (`P{Part}-{절}`). M 열은 세부 마일스톤 (`Roadmap.md` §6). 상태를 바꾸면 사이트 목차 `src/data/curriculum.ts`도 함께 고친다.

페이지 파일: `src/pages/p{Part}-{절}.mdx` (예: `p2-2.mdx` → `/p2-2/`). frontmatter에 `layout: ../layouts/MdxLayout.astro`, `sectionId: P2-2`을 넣으면 경로 표시와 이전/다음 절 이동이 붙는다. 목차 `src/data/curriculum.ts`의 `href`·`status`도 함께 고친다 (D-023).

| ID | 제목 | 랩 | M | 상태 |
|---|---|---|---|---|
| HOME | 홈 · 학습 지도 | — | M0.3 골격, M1.15, M0.6 개편 | 검토 (4단계 학습 지도·히어로, D-037) |
| LAB | Signal Lab 랩 모음 · 랩별 단독 페이지 | 모든 랩 | M0.6 | 검토 (/lab/ + /lab/{slug}/, 원문 링크 자동, D-037) |
| P1-1 | 진동이란: 평형 · 복원력 · 관성 | LAB-MCK-01 | M2.1 | 검토 (본문·그림 5·LAB-MCK-01 기본) |
| P1-2 | 고유진동수: 물체마다 정해진 박자 | LAB-MCK-01, LAB-BAS-01 (P2-1에서 이동) | M2.2 | 검토 (본문·그림 7·LAB-MCK-01 확장·LAB-BAS-01 이동) |
| P1-3 | 감쇠: 흔들림은 왜 잦아드나 | LAB-DAMP-01 | M2.3 | 검토 (본문·그림 6·감쇠 장치/파형 동기 재생, 2026-10-08) |
| P1-4 | 강제진동과 공진 | LAB-FRC-01 | M2.4 | 검토 (본문·그림7·강제진동 장치/파형 동기 재생, 2026-10-08) |
| P1-5 | 여러 질량과 모드 | LAB-2DOF-01 | M2.5 | 검토 (본문·그림 7·2자유도 모드 랩) |
| P1-6 | 회전기계의 구성: 무엇이 돌고, 무엇이 받치나? | LAB-SUP-01 | M5.0 | 검토 (구성·지지계 본문, 그림 7, 지지 강성 랩) |
| P1-7 | 회전기계의 진동: 불평형과 1X | LAB-UNB-01 | M2.6 | 검토 (본문·그림 7·불평형 런업 랩) |
| P1-8 | 기계 요소가 만드는 주파수: 한 바퀴에 몇 번? | LAB-FMAP-01 | M2.7 | 검토 (그림 10, LAB-FMAP-01 1곳, D-032·D-033) |
| P1-9 | 응답에서 원인으로: 진단은 거꾸로 푸는 문제 | LAB-SRC-01 | M2.8 | 검토 (그림 7, LAB-SRC-01 1곳) |
| P2-1 | 신호와 스펙트럼의 기본 | LAB-BAS-02 (LAB-BAS-01은 P1-2) | M1.0, M1.T, M1.T2, M2.9 | 검토 (측정 관점으로 정리, 기존 그림 7 재사용·LAB-BAS-02 1곳·Part 1 되짚기 링크) |
| P2-2 | 푸리에 기초 | LAB-FOU-01 | M1.4, M1.T, M1.T2 | 검토 (그림 9) |
| P2-3 | 샘플링 · 에일리어싱 · AAF · ADC | LAB-SMP-01, 02, 03 | M1.5~M1.6, M1.T, M1.T2 | 검토 (그림 8) |
| P2-4 | 분해능 · 측정 시간 · Zoom FFT | LAB-RES-01, 02, LAB-ZOOM-01 | M1.7~M1.8, M1.T, M1.T2 | 검토 (그림 5) |
| P2-5 | 윈도우 | LAB-WIN-01, 02, 03 | M1.9~M1.10, M1.T, M1.T2 | 검토 (그림 8) |
| P2-6 | 평균화와 TSA | LAB-AVG-01, 02 | M1.11~M1.12, M1.T2 | 검토 (D-026 개편: 평균화 그림 8 + TSA 그림 4, LAB-AVG-01 4곳·LAB-AVG-02 2곳 연결) |
| P2-7 | 스펙트럼 스케일링과 진동 단위 | LAB-SPC-01, 02, LAB-UNIT-01 | M1.13 | 검토 (그림 7, LAB-SPC-01·LAB-UNIT-01 각 1곳, LAB-SPC-02 2곳) |
| P2-8 | 변조 · 측대역 · 맥놀이 | LAB-MOD-01 | M1.14 | 검토 (그림 8, LAB-MOD-01 4곳) |
| P2-9 | 측정 설정 종합 | LAB-SBX-01 | M1.15 | 검토 (그림 4, LAB-SBX-01, Signal Lab 페이지 `/lab/`) |
| P3-1 | 센서 원리와 선택 | LAB-SNS-01 | M3.1 | 검토 (그림 7, LAB-SNS-01 3곳) |
| P3-2 | 프록시미티 프로브 시스템 | LAB-PROX-01 | M3.2 | 검토 (그림 6, LAB-PROX-01 3곳) |
| P3-3 | 키페이저 · 위상 · 1X 벡터 | LAB-PHS-01, LAB-SRO-01 | M3.3 | 검토 (그림 10, LAB-PHS-01 2곳, LAB-SRO-01 2곳) |
| P3-4 | 측정 체인 함정 | LAB-CHAIN-01 (판정 퀴즈) | M3.4 | 검토 (그림 7, LAB-CHAIN-01 3곳: 살펴보기 2 + 퀴즈 1) |
| P3-5 | 과도 데이터 수집과 보호 시스템 | LAB-ALM-01 | M3.5 | 검토 (그림 6, LAB-ALM-01 3곳) |
| P4-1 | 1자유도 불평형 응답을 Bode/Polar로 | LAB-AF-01 | M5.1 | 검토 (본문 8절, 그림 7, LAB-AF-01) |
| P4-2 | Jeffcott 로터 | LAB-JEF-01 | M5.2 | 검토 |
| P4-3 | 유막 베어링과 Shaft centerline | LAB-SCL-01 | M5.3 | 검토 |
| P4-4 | 안정성: 교차연성 · Whirl/Whip · Log decrement | LAB-STB-01 | M5.4 | 검토 |
| P5-1 | 디지털 필터와 적분 | LAB-FLT-01, LAB-INT-01 | M4.1 | 검토 (그림 10, LAB-FLT-01·LAB-INT-01 각 1곳, 2026-10-07) |
| P5-2 | 시간-주파수 분석 | LAB-STFT-01 | M4.3 | 검토 (그림 6, LAB-STFT-01 1곳, 2026-10-07) |
| P5-3 | 2채널 분석 · Full spectrum | LAB-XCH-01, LAB-FULL-01 | M4.4 | 검토 (그림 6, LAB-XCH-01·LAB-FULL-01 각 1곳, 2026-10-07) |
| P5-4 | 차수추적 | LAB-ORD-01 | M4.5 | 검토 (그림 5, LAB-ORD-01 3곳, 2026-10-07) |
| P5-5 | 트래킹 · 노치 필터 | LAB-FLT-02 | M4.6 | 검토 (그림 7, LAB-FLT-02 2곳, 2026-10-07) |
| P5-6 | 엔벨로프 · Spectral Kurtosis | LAB-ENV-01, LAB-SK-01 | M4.7 | 검토 (그림 8, LAB-ENV-01·LAB-SK-01 각 1곳, 2026-10-07) |
| P5-7 | 켑스트럼 · 특징량 | LAB-CEP-01, LAB-FEAT-01 | M4.8 | 검토 (그림 7, LAB-CEP-01·LAB-FEAT-01 각 1곳, 2026-10-07) |
| P6-1 | 시간파형 | LAB-TWF-01 | M6.1 | 검토 |
| P6-2 | 스펙트럼 · Waterfall · Cascade | LAB-WF-01 | M6.2 | 검토 |
| P6-3 | 오빗 | LAB-ORB-01 | M6.3 | 검토 |
| P6-4 | 트렌드 · 벡터 트렌드 · APHT | LAB-TRND-01 | M6.6 | 검토 |
| P7-1 | 진단 주파수 지도 · 회전수 추정 | LAB-MAP-01, LAB-FAULT-01, LAB-RPM-01 | M7.1 | 검토 (그림 6, 랩 3종 각 1곳, 2026-10-07) |
| P7-2 | 1X 계열 | LAB-1X-01 | M7.2 | 검토 (그림 8, LAB-1X-01 1곳, 2026-10-08) |
| P7-3 | 미스얼라인먼트 · 풀림 · 러브 | LAB-NL-01 | M7.2 | 검토 (그림 9, LAB-NL-01 1곳, 2026-10-08) |
| P7-4 | 유체막 · 유체력 불안정 | LAB-SUB-01 | M7.3 | 검토 (그림 5, LAB-SUB-01 1곳, 2026-10-08) |
| P7-5 | 구름베어링 | LAB-BRG-01, LAB-BRG-02 | M7.4 | 검토 (그림 7, LAB-BRG-01 1곳·LAB-BRG-02 2곳, 2026-10-07) |
| P7-6 | 기어 | LAB-GEAR-01, LAB-GEAR-02 | M7.5 | 검토 (그림 8, LAB-GEAR-01·LAB-GEAR-02 각 1곳, 2026-10-08) |
| P7-7 | 전기적 원인 | LAB-ELEC-01 | M7.6 | 검토 (그림 6, LAB-ELEC-01 1곳, 2026-10-08) |
| P7-8 | 유체 · 공력 원인 | LAB-FLOW-01 | M7.6 | 검토 (그림 6, LAB-FLOW-01 1곳, 2026-10-08) |
| P7-9 | 비틀림 · 블레이드 진동 | LAB-CAMP-01 | M7.7 | 계획 |
| P8-1 | 기동·정지와 임계속도 통과 (여러 모드 Bode/Polar 판독) | LAB-BODE-01 | M8.1 | 검토 |
| P8-2 | 열 휨 · 터닝 기어 · Morton | LAB-TRND-01 프리셋 | M8.5 (D-043) | 검토 |
| P8-3 | ST 특화 | LAB-ST-01 | M8.2 | 검토 (그림8·문제6·본문2랩, 2026-10-08) |
| P8-4 | GT 특화 | LAB-GT-01·LAB-GEAR-02 프리셋 | M8.3 | 검토 |
| P8-5 | 발전기와 축계 | LAB-GEN-01 (본문2곳) | M8.4 | 검토 (그림8·문제6, 2026-10-08) |
| P9-1 | 구조 공진 판별과 임팩트 시험 | LAB-HPB-01 | M9.1 | 계획 |
| P9-2 | 밸런싱 | LAB-BAL-01 | M9.2 | 계획 |
| P9-3 | 정렬 | LAB-ALN-01 (선택) | M9.3 | 계획 |
| P10-1 | 진동 판정 규격 | LAB-ISO-01 | M10.1 | 계획 |
| P10-2 | API 규격 요점 | — | M10.2 | 계획 |
| P10-3 | 진단 절차와 보고 | — | M10.2 | 계획 |
| P11-1 | 가상 기계 케이스 | LAB-CASE-01 | M11.1 | 계획 |
| P11-2 | 공개 데이터셋 실습 | (데이터셋 뷰어) | M11.2 | 계획 |
| P11-3 | 현장 데이터 복기 가이드 | — | M11.3 | 계획 |
| REF-1 | 공식 모음 | — | 세부 M마다 누적, M11.3 정리 | 계획 |
| REF-2 | 용어집 | — | 세부 M마다 누적, M11.3 정리 | 계획 |
| REF-3 | 참고자료 · 데이터셋 | — | M11.3 | 계획 |

## 5. 랩 사양

### 5-1. 구현된 랩 (한 줄 요약) — 원래 사양·검증 기준은 `archive/LabSpecs.md` (D-038)

구현이 끝난 랩은 코드와 테스트가 기준이다. 여기에는 찾아가는 길만 둔다. 랩 단독 페이지는 `/lab/{slug}/` (D-037).

| 랩 | 이름 | 처음 쓰인 곳 | 컴포넌트 (단독 페이지) · 계산 모듈 |
|---|---|---|---|
| LAB-BAS-01 | 정현파의 세 숫자 (진폭 · 주파수 · 위상) + 도는 화살표와 그 높이 (D-044) | P1-2 | `SineBasicsLab` (/lab/bas-01/) · `PhasorView` |
| LAB-BAS-02 | 진폭을 숫자 하나로 (Peak · Pk-Pk · RMS · Crest factor) | P2-1 | `AmplitudeMeasuresLab` (/lab/bas-02/) |
| LAB-FOU-01 | 푸리에 기초 (하모닉 쌓기는 화살표 사슬 끝이 파형을 그림, D-044) | P2-2 | `FourierHarmonicsLab` (/lab/fou-01/), `DftCorrelationLab` (/lab/fou-01-dft/), `ZeroPaddingLab` (/lab/fou-01-zeropad/) |
| LAB-SMP-01 | 샘플링 & 에일리어싱 + 스트로브로 본 회전 원판(마차 바퀴 효과, D-044) | P2-3 | `SamplingLab` (/lab/smp-01/) · `StrobeDisk` |
| LAB-SMP-02 | AAF와 f_s = 2.56 F_max | P2-3 | `AafLab` (/lab/smp-02/) |
| LAB-SMP-03 | ADC & 입력 레인지 | P2-3 | `AdcLab` (/lab/smp-03/) |
| LAB-RES-01 | 분해능: 두 성분 분리 | P2-4 | `ResolutionLab` (/lab/res-01/) |
| LAB-RES-02 | Smearing: 변하는 회전수 | P2-4 | `SmearingLab` (/lab/res-02/) |
| LAB-ZOOM-01 | Zoom FFT | P2-4 | `ZoomLab` (/lab/zoom-01/) |
| LAB-WIN-01 | 누설과 가리비 손실 | P2-5 | `WindowLeakageLab` (/lab/win-01/) |
| LAB-WIN-02 | 윈도우 비교: 메인로브와 사이드로브 | P2-5 | `WindowComparisonLab` (/lab/win-02/) |
| LAB-WIN-03 | 보정계수 & ENBW | P2-5 | `WindowCorrectionLab` (/lab/win-03/) |
| LAB-AVG-01 | 평균화 | P2-6 | `AveragingLab` (/lab/avg-01/) |
| LAB-AVG-02 | TSA (시간 동기 평균) | P2-6 | `TsaLab` (/lab/avg-02/) |
| LAB-SPC-01 | 스펙트럼의 세로축: 진폭 · 파워 · PSD | P2-7 §3 | `SpectrumScalingLab` (/lab/spc-01/) · lib/dsp/scaling.ts, lib/scalingDemo.ts |
| LAB-SPC-02 | 진폭 표기와 dB | P2-7 §5 | `AmplitudeScaleLab` (/lab/spc-02/) |
| LAB-UNIT-01 | 진동 단위 환산기 | P2-7 §6 | `UnitConverterLab` (/lab/unit-01/) · lib/units.ts |
| LAB-MOD-01 | 변조 · 측대역 · 맥놀이 + 도는 화살표(반송파와 같이 도는 틀: 합의 길이 = 포락선, D-044) | P2-8 §2 | `ModulationLab` (/lab/mod-01/) · lib/dsp/modulation.ts (modulationLines 복소 계수), lib/modulationDemo.ts |
| LAB-SBX-01 | Signal Lab 샌드박스 + 설정 도우미 | P2-9 §6 | `SandboxLab` (/lab/sbx-01/) · lib/sandbox.ts |
| LAB-SNS-01 | 센서 = 질량-스프링 계 + 케이스 안 질량의 움직임(r 아래·근처·위, D-044) | P3-1 §3· | `SensorLab` (/lab/sns-01/) · `SensorMotion` · lib/sensor.ts (seismicMotion) |
| LAB-PROX-01 | 비접촉 변위 센서: gap 전압과 런아웃 + 프로브 앞을 지나는 축(흠집·재질 얼룩·진동 → 전압, D-044) | P3-2 §3· | `ProximityLab` (/lab/prox-01/) · `ProbeMotion` · lib/proximity.ts |
| LAB-PHS-01 | 위상 측정: 키페이저 펄스와 1X 위상 + 두 단면이 도는 축(홈 → 펄스, high spot → 봉우리, D-044) | P3-3 §2· | `PhaseLab` (/lab/phs-01/) · `PhaseShaft` · lib/phase.ts |
| LAB-SRO-01 | Slow roll 보상: 런아웃을 벡터로 빼기 | P3-3 §5· | `SlowRollLab` (/lab/sro-01/) · lib/phase.ts |
| LAB-CHAIN-01 | 센서 문제인가, 기계 문제인가 (측정 체인 판정 퀴즈) | P3-4 §4· | `ChainQuizLab` (/lab/chain-01/) · lib/measurementChain.ts |
| LAB-ALM-01 | 보호 시스템 알람 논리: 레벨 · 지연 · 보팅 · 트립 배율 | P3-5 §4· | `AlarmLab` (/lab/alm-01/) · lib/protection.ts, lib/transient.ts |
| LAB-MCK-01 | 질량-스프링 자유진동 | P1-1 | `MassSpringLab` (/lab/mck-01/) |
| LAB-DAMP-01 | 감쇠 자유진동·장치/파형 동기 재생·다음 양의 피크 | P1-3 | `DampingLab` (/lab/damp-01/) |
| LAB-FRC-01 | 강제진동·공진, 장치/파형 동기 재생·T/4 | P1-4 | `ForcedVibrationLab` (/lab/frc-01/) |
| LAB-2DOF-01 | 2자유도 모드 | P1-5 | `TwoDofModeLab` (/lab/2dof-01/) |
| LAB-UNB-01 | 불평형 런업 입문 | P1-7 | `UnbalanceLab` (/lab/unb-01/) |
| LAB-FMAP-01 | 주파수 지도: 기계 요소별 관심 구간 | P1-8 | `FrequencyMapLab` (/lab/fmap-01/) · lib/machine/frequencies.ts |
| LAB-SRC-01 | 원인 합성: 파형 한 줄에 섞인 원인들 | P1-9 | `SourceSynthesisLab` (/lab/src-01/) |
| LAB-SUP-01 | 지지 강성과 고유진동수 (D-036) | P1-6 | `SupportStiffnessLab` (/lab/sup-01/) · lib/machine/supportModel.ts |
| LAB-AF-01 | Run-up Bode & 증폭계수 | P4-1 | `RunUpBodeLab` (/lab/af-01/) · lib/rotor/runup.ts |
| LAB-JEF-01 | Jeffcott 로터: 선회와 오빗 | P4-2 | `JeffcottLab` (/lab/jef-01/) · lib/rotor/jeffcott.ts |
| LAB-SCL-01 | 유막 지지와 Shaft centerline | P4-3 | `ShaftCenterlineLab` (/lab/scl-01/) · lib/rotor/journalBearing.ts |
| LAB-STB-01 | 교차연성과 Log decrement | P4-4 | `StabilityLab` (/lab/stb-01/) · lib/rotor/stability.ts |
| LAB-FLT-01 | 필터 설계: 크기 · 군지연 · 시간파형 | P5-1 | `FilterLab` (/lab/flt-01/) · lib/dsp/filter.ts, lib/filterDemo.ts |
| LAB-INT-01 | 적분 & ski-slope | P5-1 | `IntegrationLab` (/lab/int-01/) · lib/dsp/filter.ts (integrateSpectral·integrateCumulative), lib/filterDemo.ts |
| LAB-STFT-01 | 스펙트로그램 · 워터폴 · 캐스케이드 | P5-2 | `StftLab` (/lab/stft-01/) · lib/dsp/stft.ts, lib/stftDemo.ts |
| LAB-XCH-01 | FRF 추정과 코히어런스 | P5-3 | `FrfLab` (/lab/xch-01/) · lib/dsp/twoChannel.ts, lib/xchDemo.ts |
| LAB-FULL-01 | Full spectrum: 오빗과 정방향·역방향 + 반대로 도는 두 화살표가 오빗을 그림 (D-044) | P5-3 | `FullSpectrumLab` (/lab/full-01/) · lib/dsp/twoChannel.ts (fullSpectrum, forwardBackwardPhasors), lib/xchDemo.ts (orbitPhasors) |
| LAB-ORD-01 | 차수추적: 시간 FFT vs 차수 스펙트럼 | P5-4 | `OrderTrackingLab` (/lab/ord-01/) · lib/dsp/order.ts, lib/orderDemo.ts |
| LAB-FLT-02 | 트래킹 필터와 노치: 런업에서 1X 벡터 뽑기 | P5-5 | `TrackingLab` (/lab/flt-02/) · lib/dsp/tracking.ts, lib/trackingDemo.ts |
| LAB-ENV-01 | 엔벨로프 분석: 대역 고르기 → 포락선 → 엔벨로프 스펙트럼 | P5-6 | `EnvelopeLab` (/lab/env-01/) · lib/dsp/envelope.ts, lib/envelopeDemo.ts |
| LAB-SK-01 | Spectral Kurtosis · Kurtogram: 충격 대역 자동으로 찾기 | P5-6 | `KurtogramLab` (/lab/sk-01/) · lib/dsp/envelope.ts, lib/envelopeDemo.ts |
| LAB-CEP-01 | 켑스트럼: 줄 무리의 간격 → quefrency 봉우리, 리프터링 | P5-7 | `CepstrumLab` (/lab/cep-01/) · lib/dsp/cepstrum.ts, lib/cepstrumDemo.ts |
| LAB-FEAT-01 | 시간영역 특징량: 결함이 진행하는 동안의 추세 | P5-7 | `FeatureLab` (/lab/feat-01/) · lib/dsp/stats.ts, lib/cepstrumDemo.ts |
| LAB-TWF-01 | 시간파형 패턴 갤러리·퀴즈·회전당 사건 수 | P6-1 | `TimeWaveformLab` (/lab/twf-01/) · lib/plots/waveform.ts |
| LAB-TRND-01 | 스칼라·APHT·벡터 변화·허용 영역·열 휨/Morton형 | P6-4·P8-2 | `TrendLab` (/lab/trnd-01/) · lib/plots/trend.ts·thermal.ts |
| LAB-WF-01 | 스펙트럼 판독·추종/잠김·정속 유지·정/역 cascade | P6-2 | `WaterfallLab` (/lab/wf-01/) · lib/plots/cascade.ts |
| LAB-ORB-01 | 직접/실제1X 오빗·blank/dot 시간 순서·고정/이동 점 | P6-3 | `OrbitLab` (/lab/orb-01/) · lib/plots/orbit.ts |
| LAB-MAP-01 | 진단 주파수 지도: 주파수 → 원인 후보 | P7-1 | `FaultMapLab` (/lab/map-01/) · lib/faults/catalog.ts |
| LAB-FAULT-01 | 결함 신호 합성기: 원인마다의 지문 (Part 11 케이스 엔진) | P7-1 | `FaultSynthLab` (/lab/fault-01/) · lib/faults/synth.ts, catalog.ts |
| LAB-RPM-01 | 회전수 추정: 회전수를 모를 때 1X 찾기 | P7-1 | `RpmLab` (/lab/rpm-01/) · lib/faults/rpm.ts, synth.ts |
| LAB-1X-01 | 1X 감별: 1X가 크면 무엇일까 (원인 8종·숨은 케이스 7개, 코스트다운 Bode·2X·두 베어링 벡터·오빗) + 옆에서 본 로터(원통형·원추형, D-044) | P7-2 | `OneXLab` (/lab/1x-01/) · `OneXRotor` · lib/faults/oneX.ts (diskUnbalance) |
| LAB-NL-01 | 비선형의 지문: 미스얼라인 · 풀림 · 러브 (시간 적분 Jeffcott, 오빗·파형·Full spectrum) | P7-3 | `NonlinearLab` (/lab/nl-01/) · lib/faults/contact.ts |
| LAB-SUB-01 | 1X 아래 성분 감별 (원인 6종·숨은 케이스 7개, 런업 캐스케이드·Full spectrum·키페이저 점·운전조건 시험) | P7-4 | `SubsyncLab` (/lab/sub-01/) · lib/faults/subsync.ts |
| LAB-BRG-01 | 베어링 결함 주파수 계산기 (접촉각·미끄럼·BSF 1배/2배) | P7-5 | `BearingCalcLab` (/lab/brg-01/) · lib/machine/frequencies.ts, lib/faults/bearing.ts |
| LAB-BRG-02 | 결함 위치와 고장 단계: 어디에 먼저 보이나 + 도는 베어링(볼이 결함에 닿을 때 충격, 하중대 가중, D-044) | P7-5 | `BearingStageLab` (/lab/brg-02/) · `BearingSpin` · lib/faults/bearing.ts, bearingMotion.ts |
| LAB-GEAR-01 | 기어 결함의 스펙트럼 지문 (GMF 하모닉·측대역 간격과 개수·공진 대역·부하·헌팅 투스) + 맞물려 도는 기어(상한 이빨 충격·헌팅 투스 주기, D-044) | P7-6 | `GearSpectrumLab` (/lab/gear-01/) · `GearMesh` · lib/faults/gear.ts, gearMotion.ts |
| LAB-GEAR-02 | TSA와 켑스트럼: 어느 축의 몇 번 이빨인가 | P7-6 | `GearTsaLab` (/lab/gear-02/) · lib/faults/gear.ts |
| LAB-ELEC-01 | 전기냐 기계냐: 2×LF · 극통과 측대역 · 전원(계자) 차단 시험 (유도전동기 2극·4극, 2극 동기 발전기, 원인 6종·숨은 케이스 7개) | P7-7 | `ElectricLab` (/lab/elec-01/) · lib/faults/electric.ts |
| LAB-FLOW-01 | 운전점을 바꿔 원인 가리기: 날개 통과 · 재순환 · 수력 불평형 · 캐비테이션 · Rotating stall · 서지 (펌프 상태 5종, 압축기 서지 방지, 숨은 케이스 7개) | P7-8 | `FlowLab` (/lab/flow-01/) · lib/faults/flow.ts, synth.ts |
| LAB-BODE-01 | 여러 모드 Bode/Polar·센서 마디·열간 bow·slow roll | P8-1 | `MultiModeBodeLab` (/lab/bode-01/) · lib/rotor/multimode.ts |
| LAB-GT-01 | GT 동압의 실속/서지·종방향·원주 진행/정재 공간 모드·절점 | P8-4 | GasPressureLab (/lab/gt-01/) · lib/machine/gt.ts |
| LAB-ST-01 | ST 부하 경계·부분 분사 합력·정적 중심 위치 (독립 모델) | P8-3 | `SteamLoadLab` (/lab/st-01/) · lib/rotor/steam.ts, journalBearing.ts, stability.ts |
| LAB-GEN-01 | 계자 전류 변경·복귀와 열 지연, 1X 벡터 합성·상쇄 | P8-5 §3·§4 | GeneratorFieldLab (/lab/gen-01/) · lib/machine/generator.ts |

### 5-1b. 상세 사양 — 아직 구현하지 않은 랩

새 랩은 여기에 사양을 먼저 쓰고 구현한다 (템플릿 §2). 구현이 끝나면 사양을 `archive/LabSpecs.md`로 옮기고 위 표에 한 줄을 더한다.

### 5-2. 그 밖의 랩 (개요 — 해당 마일스톤 시작 시 상세화)

| ID | 이름 | 핵심 조작 → 보이는 것 | 페이지 | M |
|---|---|---|---|---|

| LAB-CAMP-01 | Campbell 선도 | 고유진동수 강성화, 엔진 차수선 → 교차점 | P7-9 | M7.7 |
| LAB-HPB-01 | Half-power & 임팩트 시험 | FRF 피크 → ζ, 지수 윈도우 영향, 해머 팁 → 가진 대역 | P9-1 | M9.1 |
| LAB-BAL-01 | 영향계수 밸런싱 | 시험추 → 영향계수 → 보정추 → 잔류 진동 | P9-2 | M9.2 |
| LAB-ALN-01 | 정렬 계산기 (선택) | 측정값 → 이동량, 열성장 보정 | P9-3 | M9.3 |
| LAB-ISO-01 | 진동 등급 판정 | 측정값·기계 분류 → Zone (경계값은 I-009 정책) | P10-1 | M10.1 |
| LAB-CASE-01 | 가상 기계 케이스 | 숨은 결함 → 측정 설정·플롯 선택 → 진단 제출 → 해설 | P11-1 | M11.1 |

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
| Jeffcott 등방 (D-034, M5.2) | k_x = k_y | A_b = 0, 원형 오빗, 반지름 = 1자유도 불평형 응답 (P1-7·P4-1과 같다) |
| Jeffcott 비등방 | ζ = 0, √(k_x/m) < Ω < √(k_y/m) | X·Y 부호 반대 → ∣A_b∣ > ∣A_f∣ (역방향 선회), 임계속도 2개 |
| Jeffcott 수치 (M5.2) | m = 10 kg, e = 10 µm, Nₓ = 3000 rpm, kᵧ/kₓ = 1.3, 공통 c(ζₓ = 0.05), N = 3200 rpm | Nᵧ = 3420.526 rpm, X = 65.2985·Y = 58.6033 µm Peak, ∣A_f∣ = 36.1101·∣A_b∣ = 50.4498 µm → 역방향 |
| Jeffcott 감쇠 증가 | 위 조건에서 ζₓ = 0.2 | ∣A_f∣ = 23.7295·∣A_b∣ = 8.33899 µm → 정방향 (두 고유 회전수 사이여도 역방향 보장 없음) |
| Jeffcott 고속 질량중심 | 등방, e = 10 µm, ζ = 0.05, r = 5 | C 반지름 10.4144 µm, G 반지름 0.465746 µm; r → ∞에서 C → e, G → 0 |
| 짧은 베어링 (M5.3) | ε = 0.5, Ocvirk half-Sommerfeld | WC_r²/(μΩRL³) = 0.750381081812, φ = 53.68020060°. 압력 적분과 하중 해석식 일치 |
| 유막 정적 기본 | R = 50 mm, L = 25 mm, Cr = 100 µm, μ = 20 mPa·s, W = 1000 N, N = 3000 rpm | ε = 0.6757879254, φ = 40.58502207°, X = 43.965121·Y = −51.322133 µm, h_min = 32.421207 µm |
| 하중/회전수 비 | 위 조건 W = 500 N 또는 N = 6000 rpm 또는 μ = 40 mPa·s | ε = 0.5596683869, φ = 49.30861855°, X = 42.435871·Y = −36.489503 µm, h_min = 44.033161 µm |
| Shaft centerline DC | 위 기본값, A45°/B135°, cold gap 1.2 mm, S = 7.874015748 V/mm | cold −9.448819 V, A −8.933004·B −9.422579 V.동일 바이어스 차분 소거, 복원 오차 0 |
| 기준/측정 오류 | cold 좌표 누락 / A +0.5 V drift / cold gap 0.30 mm | 위치 오차 100 / 63.5 µm / 선형 범위 밖 → 좌표 복원 중단. 선형·정수 회전 평균0 runout은 DC 변화0 |
| 안정성 (M5.4) | k_xy = 0, ζ = 0.05 | σ = −ζω_n, δ = 0.3146 (P1-3과 같다) |
| 안정 한계 | k_xy 독립 / k_xy = cΩ/2 | δ = 0 ↔ k_xy = cω_n = 2ζk / Ω = 2ω_n (c와 무관) |
| 안정성 수치 (M5.4) | m=10 kg, N_n=3000 rpm, ζ=0.05, q/k=0.05 / 0.10 / 0.15 | σ_f=−7.8466128 / 0 / +7.8174565 s⁻¹, δ=0.15707949 / 0 / −0.15610676; qcrit/k=0.1 |
| 감쇠 대책 비교 | ζ를 0.05→0.10, 직접 q/k=0.15 유지 / q=cΩ/2 | 직접 모드 한계 q/k=0.1→0.2, 안정으로 전환 / 속도 모드 한계 r=2 유지 |
| 모드 진폭비 | A=20 µm, 위 기본값 q/k=0.05 / 0.15, 순수 정방향 한 주기 | A exp(−δ)=17.09272235 / 23.37901991 µm |
| Whirl/Whip 개념 | f_n=50 Hz, 가상 min(0.45 f_r, f_n), 4800 / 9000 rpm | 36 Hz(0.45X) / 50 Hz(0.3333X), 전환 6666.6667 rpm. 선형 안정 한계 6000 rpm과 별개 |
| Campbell 개념 | f_FW/f_n=√(1+0.01r²)+0.1r, f_n=50 Hz | 가상 1X 교차 r=1/√0.8, 3354.101966 rpm. 고유치 안정 판정과 별개 |
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
| 차수 분해능·최대 차수 (M4.5) | N_rev 64, N_spr 64 | Δo = 1/64 = 0.0156, o_max = 25 |
| 차수추적 예시 (P5-4) | 1500 rpm에서 150 rpm/s, 64바퀴 | 2.3 s 동안 → 1844 rpm, 시간 FFT 1X 13.7 µm vs 차수 1X 25 µm(참값 25), 고정 95 Hz → 3.09 ~ 3.8차 |
| 차수 영역 에일리어싱 | N_spr 32, 23X 3 µm, 방지 없음 / 256점 → 걸러 솎음 | 9X에 2.96 µm / 0.006 µm |
| 보간 오차 | 23X(575 ~ 707 Hz), f_s 4096 Hz | 선형 8.1 % 손실, 3차 1.6 % |
| 트래킹 필터 (M4.6) | x = A cos(θ − φ) + 2X + 0.45X, B 1 Hz / 진폭이 일정하게 오름 | V̂ = A e^{−jφ}(오차 < 0.1 %) / 지연 = 0 Hz 군지연 √2/(πB)(B 0.5 → 0.900 s), 두 번 거르기는 지연 0 |
| 트래킹 필터 잡음 | 흰 잡음 σ, 2차 Butterworth | 크기 흔들림 σ√(4·ENBW/f_s), ENBW = 1.111·B/2 → B를 1/4로 하면 절반 (실측 ±15 % 안) |
| 런업 Bode와 필터 지연 (P5-5) | P4-1 로터, 200 rpm/s, σ 5 µm | 참 3008 rpm·100.1 µm pp·AF 9.90 / B 2 Hz → 3066·98.9·10.0 / B 0.5 Hz → 3197·76.5·5.88(ΔN 180 rpm), 코스트다운 2864, 두 번 거르기 3038·69.0 |
| Not-1X (P5-5) | 3600 rpm, 1X 31.57 µm pp + 2X 6 + 0.45X 12 µm pp, σ 1 µm | 직접 RMS 11.4 → 12.2 µm(+7 %), Not-1X 2.35 → 4.86 µm, 50 rpm/s·B 2 Hz에서 새어 나온 1X 최대 2.67 µm |
| 첨도 (M4.7) | 정규 잡음 / 정현파 / 드문 충격 | K = 3 / 1.5 / ≫ 3. 복소 포락선 SK: 정규 잡음 0, 정현파 −1 |
| 해석 신호 | (1 + m cos 2πf_m t) cos 2πf_c t | 포락선 = 1 + m cos 2πf_m t, H{cos} = sin, 엔벨로프 스펙트럼 f_m에 m·A |
| 엔벨로프 예시 (P5-6) | 6205·3000 rpm 외륜, 공진 3.3 kHz ζ 0.05, 기어 1200 Hz 1 g | 원신호 BPFO 0.009 g / 2800 ~ 3800 Hz 엔벨로프 BPFO 0.11 g(바닥의 약 180배), 기어 대역 → 50 Hz, 잡음 대역 → 2.2배, 원신호 K 2.31 vs 충격만 8.91 |
| Kurtogram 예시 (P5-6) | 같은 신호, 레벨 1 ~ 6 반 칸씩 | 레벨 3·2560 ~ 3584 Hz·SK 1.01, 결함 없음 → 좁은 칸 SK 0.3, 기어 0 → 2048 ~ 4096 Hz SK 2.5 |
| 켑스트럼 (M4.8) | 반송파 600 Hz를 25 Hz·16 Hz 펄스열로 변조 | 40 ms·62.5 ms 봉우리(바닥 중앙값의 5·3배 이상), 그대로 되돌리면 원래 스펙트럼, 빗 리프터 40 ms → 25 Hz 측대역 −10 dB 넘게·16 Hz는 3 dB 안 |
| 기어 켑스트럼 예시 (P5-7) | 피니언 24이빨 25 Hz, 기어 37이빨 16.22 Hz, 맞물림 600 Hz | 40 ms 0.071·61.7 ms 0.033, 피니언 리프터 → 625 Hz −15.0 dB, 자기상관 R(1.67/20/40 ms) = 0.966/0.974/0.952 |
| 자기상관 | 정현파 주기 T / 잡음 속 충격열 | R(T) = 1 − T/N (편향 추정), 충격 간격에 봉우리. P5-6 포락선 → 5.55 ms ≈ 180 Hz |
| 특징량 (P5-7) | RMS 1: 정현파 / 잡음 / 드문 충격 / 위쪽이 눌린 정현파 | CF 1.41·3.39·6.42·1.62, K 1.5·3.02·17.9·1.51, S 0·0.02·0.83·−0.42 |
| 결함 진행 추세 (P5-7, 설명용) | 건전 / 30 % / 55 % / 100 % | RMS 0.087·0.17·0.31·0.82 g, CF 3.07·6.61·6.93·5.39, K 2.36·10.7·14.8·3.43 |

P1-6 직렬 예제의 기준: m = 100 kg, k_sh = 1 MN/m, k_br = 2 MN/m, k_sup = 1 MN/m → k_eq = 0.4 MN/m, f_n = 10.06584242 Hz. 같은 강성 3개면 k_eq = k/3, 지지 강성을 키우면 f_n 단조 증가, m 두 배면 f_n/√2. §5 LAB-SUP-01과 테스트가 함께 확인한다.


### P6-1 시간파형 판독 (M6.1)

| 조건 | 기준값 |
|---|---|
| 3000 rpm·A=20 µm·정현·10바퀴 | T_r=20 ms, Pk-Pk=40 µm, RMS=14.1421 µm, CF=√2 |
| 1X·1.1X 각 A/2 / AM 깊이 0.5·0.1X (10바퀴) | RMS=10 / 15 µm, AM CF=2, 크기 변화 200 ms |
| 한 바퀴 세 사건, 3000 / 6000 rpm | 사건 간격 6.66667 / 3.33333 ms |
| 한쪽 −0.25A 절단 / 양쪽 ±0.65A 클리핑 | Pk-Pk=25 / 26 µm |
| 1X 20·2X 7 µm Peak, 2X 앞섬각 0° / 90° | 두 RMS=14.9833 µm, 모양은 다름; 0° 상하 Peak=27 / 약 14.14 µm |

### P6-2 스펙트럼·Waterfall·Cascade (M6.2)

| 조건 | 기준값 |
|---|---|
| 1024 Hz·2048점·Hann, 각 기록 정속 | T=2 s, Δf=0.5 Hz; 시각 0~120 s, 회전 20→120 Hz(1200→7200 rpm), 끝 3기록은120 Hz 유지 |
| 모드40 Hz·비율0.45·4800/7200 rpm | 비교 성분36/40 Hz, 차수0.45/0.333333X; 추종만이면 마지막54 Hz |
| 모델 모드40 / 50 Hz·비율0.45 | 교차5333.333333 / 6666.666667 rpm, 실제 발생 한계 아님 |
| 기본 기록10·7200 rpm·잡음 없음 | X1X120 Hz=20·2X240 Hz=5·40 Hz=12·73 Hz=3·320 Hz=2 µm Peak; X RMS=√((20²+5²+12²+3²+2²)/2) µm |
| 1X 역방향 몫0 / 25 / 50 / 75% | X1X20 µm Peak 유지, +/− 원 반지름20/0 ·15/5 ·10/10 ·5/15 µm (두 원의 위상 기준을 맞춘 조건) |
| 기록10~12: 시각100/110/120 s·모두7200 rpm | X1X20/25/30 µm Peak, Cascade 기준선 겹침 |
| 처음부터 고정40 Hz·기록2(2400 rpm) | 비교 줄과1X가 겹쳐 X40 Hz=32 µm Peak, +40 Hz 원 반지름27 µm |
| 기본 120 Hz bin·Hann | 120.5 Hz 옆 칸10 µm Peak, 메인로브이며 별도 성분 아님 |

### P6-3 오빗 판독 (M6.3)

| 조건 | 기대값 | 비고 |
|---|---|---|
| 3000 rpm · 1X 원20 µm Peak | f_r50 Hz · T_r20 ms · X/Y40 µm p-p | Y 반전이면 같은 크기·역 선회 |
| 1X 타원 | X/Y40/20 µm p-p | 진폭20/10 µm Peak |
| 바나나 기본 | X1X20, Y1X12 + Y2X12 µm Peak | 실제 필터 중앙 X/Y≈20/12 |
| 8자 기본 | X/Y40/40 µm p-p · Y1X0 | 실제 필터 Y는 유한 감쇠 잔여만 |
| 단독1/2X·1/3X,8축 바퀴 | 펄스8번, 자리2·3 | 끝 중복 제외, 안정·비퇴화 |
| 단독0.43X,8축 바퀴 | 자리8 · 154.8°/바퀴 | 정확한43/100은100바퀴 반복 |
| 정수1X+2X 또는 단독2X | 서로 다른 자리1 | 2X 선회 횟수와 자리 수 구별 |
| X 원 상단12 µm 절단·AC화 | X32 µm p-p · 1X17.15243 µm Peak | 평균 (12acos0.6−16)/π µm 제거 |
| 실제 트래킹 필터 | 띠 폭4 Hz·4차 LPF·준비4초 | 해석1X와 차이 <0.006 µm |
| 내부 루프·꽃잎 | 1X20+1/2X35 · 1X20+3X8 µm | 합성 예제, 고장 역학 해 아님 |
### P6-4 트렌드·APHT (M6.6)

| 조건 | 기준값 |
|---|---|
| 1X 20·2X 2 µm Peak, 1X 위상 350°→470° | Overall 14.2126704 µm RMS 일정, 1X 진폭차 0, 최종 표시 110° |
| 기준 0분·선택 60분, 위상차 120° / 기준 30분·선택 60분, 60° | 벡터 변화량 34.6410162 / 20 µm Peak |
| 기준 20 µm Peak·350°, 허용폭 ±20%·±30° | 진폭 16~24 µm·지연 320°~20° 경계 포함, 기본 첫 이탈 표본 16분 |
| 1X 그대로·2X 2→8 µm Peak | Overall 14.2126704→15.2315462 µm RMS (+7.168785%), Not-1X 1.4142136→5.6568542 µm RMS (4배) |
| 접힌 기본 위상 / 1X 진폭 ≤1 µm Peak | 4분 358°→5분 0°에서 선 끊기 / 위상·영역 판정 보류(임의 학습 바닥값) |

### P7-1 진단 주파수 지도 · 회전수 추정 (M7.1)

결함 크기는 모두 설명용(정도 0 ~ 1, 판정 기준 아님). `figures-p7-1.test.ts`·`faults.test.ts`가 고정한다.

| 조건 | 기준값 |
|---|---|
| 펌프: 2극 3575 rpm, 60 Hz, 6205(볼 9), 베인 7 | 1X 59.58 Hz, BPFO 213.6 Hz(3.585X), 2×LF = 2.014X(2X와 0.83 Hz), 7X 417.1 Hz |
| 불평형 / 정렬 불량 0.6 (펌프) | 불평형 H 4.91·V 3.53·A 0.49 mm/s, V가 90° 늦음 / 정렬 불량 A 1X 3.10·A 2X 2.57 mm/s, H-V 위상차 26° |
| 2X vs 2×LF (정렬 불량 + 전기) | 2 s 기록: 0.96·1.27 mm/s 따로 / 0.5 s 기록: 2.25 mm/s 하나로 |
| 풀림 / 외륜 0.6 (펌프 V) | ½X 0.98 mm/s, 가속도 첨도 약 10 / 엔벨로프(2800 ~ 3800 Hz) BPFO 0.41 g(바닥의 20배 넘게), 속도 스펙트럼 BPFO 약 0.5 mm/s |
| 회전수 추정 (참 3575 / 1490 / 1180 rpm) | 하모닉 무리 3573·1492·590, 켑스트럼 1792·1490·590, 자기상관 3576·1558·1180 rpm |
| 동기속도·슬립 | 60 Hz 2극 3600 rpm(명판 3560 → 1X 59.33 ~ 60 Hz), 50 Hz 4극 1500 rpm(명판 1460 → 24.33 ~ 25 Hz) |
| 역산 | 맞물림 571.2 Hz ÷ 23 = 1490 rpm, 417.1 Hz ÷ 7 = 3575 rpm, 23 → 61이빨 출력 561.8 rpm |
| 후보 찾기 (펌프 120 Hz / 59.6 Hz, 압축기 43 Hz) | 전기 2×LF + 2X 후보 4(정렬 불량·풀림·크랙·러브), "고정"이면 전기만 / 1X 후보 7 / 오일 휠·휩·Rotating stall |

### P7-2 1X 계열 (M7.2)

설명용 로터(베어링 2개, 운전 3000 rpm, 병진 모드 5000 / 5600 rpm ζ 0.06, 원추 6400 / 7200 rpm ζ 0.05, 정도 60 %). 진폭은 µm p-p, 베어링 1 수평. `figures-p7-2.test.ts`·`oneX.test.ts`가 고정한다.

| 조건 | 기준값 |
|---|---|
| 정적 불평형 | 300 rpm 2.2 µm(건전 2.0), 1500 → 3000 rpm 8.2 → 37 µm (4.5배), 수평·수직 89°, 수평 ÷ 수직 1.4, 두 베어링 −3°. 몫만 떼면 P4-1 `unbalanceVector`와 같음 |
| 커플 · 동적 | 회전수 비 4.4 · 두 베어링 −164° / 동적 −52.5° |
| 런아웃 · 휨 | 런아웃 slow roll 32 → 3000 rpm 34 µm(비 1.0), 보상 뒤 1.7 µm = 건전 / 휨 31 → 47 µm(비 1.4), 보상 뒤 17 µm, 두 베어링 동상. 휨 몫 = b/(1 − r² + j2ζr) |
| 크랙 | 2X 봉우리 수평 2500 · 수직 2800 rpm(병진 모드의 절반), 20 µm = c₂/(2ζ) / slow roll 1X 11.5 µm / 1년: 2X 0 → 8.6, 1X 3.7 ∠46° → 31 ∠313°, slow roll 2.0 → 19 µm |
| 방향이 정해진 힘 | 수평 ÷ 수직 3.3, 수평·수직 위상차 11°, slow roll 32 µm, 회전수 비 1.4 |
| 구조 공진 (받침대 2850 rpm, ζ 0.035) | 베어링 1 수평만 2850 rpm 117 µm, 3000 rpm 72 µm, 회전수 비 17, 2600 → 3000 rpm 위상 약 130° / 다른 센서 10 µm 미만 |
| 확인 문제 | Q2 22 ∠45° − 20 ∠40° = 2.7 µm ∠85°, Q6 (2700/2950)² = 0.84 |

### P7-3 미스얼라인먼트 · 풀림 · 러브 (M7.2)

설명용 무차원 Jeffcott 로터(ζ 0.05, RK4 한 바퀴 256걸음, 300바퀴 버리고 64바퀴 기록)를 간극 1 = 100 µm, 회전수비 1 = 3000 rpm으로 읽는다. `figures-p7-3.test.ts`·`contact.test.ts`가 고정한다.

| 조건 | 기준값 |
|---|---|
| 해석해 대조 | 접촉 없으면 1X 정방향 = e r²/∣1 − r² + j2ζr∣, 역방향 0, 평균 = 중력 처짐 / 미스얼라인 2X = a₂/∣1 − (2Ω)² + j2ζ·2Ω∣ (정 = 역, 선) |
| 그림 1 (4200 rpm, 씰 간극 100 µm, 처짐 70 µm) | 씰 없으면 반경 32 µm·2X 0 / 닿으면 1X 166 µm p-p(수직)·반경 85 µm, 2X 11 µm |
| 미스얼라인 (2400 rpm, 60° 방향) | 정도 25 % 2X ÷ 1X 0.59(바나나), 80 % 1.5(8자, 1X 42 · 2X 62 µm p-p), 평균 자리 −70 → −57 → −28 µm |
| 구조적 풀림 (받침·베이스, 1X 힘 1.6 × 무게) | 조임 받침 ÷ 베이스 1.3·위상차 0.4° / 풀림(당김 강성 0.5 %) 6.2배·37°·2X ÷ 1X 0.48 |
| 회전 풀림 (간극 안 강성 0.3, 중력 1.2) | 3600 rpm(정도 100 %) 2X 58 · 3X 28 · 4X 16 µm p-p, 수평 248 · 수직 127 µm / 4200 rpm(50 %) ½X 111 · 1½X 100 µm |
| 부분 러브 (접촉 강성 40, 마찰 0.05) | 7800 rpm 수직 ½X 132 µm p-p vs 1X 25 / 정도 100 %: 역방향 봉우리 −0.92 · −0.84 · −0.78X = 120 · 118 · 117 Hz (7800 · 8400 · 9000 rpm), 9600 rpm 발산 |
| 원주 러브 (마찰 0.15, 6900 rpm, 정지 위치 출발) | 11바퀴에 반지름 1.8배(180 µm), 마지막 세 바퀴 68 % 역방향 |
| Newkirk (설명용 반복 모델, 4시간) | 임계속도 아래(지연 40°) 1.6 ∠40° → 4.6 ∠140°, 위(150°) 1.3 → 1.2 |
| 확인 문제 | Q1 175°, Q2 27.5 Hz, Q3 6배·45° |

### P7-4 유체막 · 유체력 불안정 (M7.3)

설명용 규칙 모델(미끄럼베어링 압축기, 1차 임계 3000 rpm = 50 Hz, 휠 비 0.45). `figures-p7-4.test.ts`·`subsync.test.ts`가 고정한다.

| 조건 | 기준값 |
|---|---|
| 유체막 | 문턱 4800 rpm × 하중^0.6 × (1 + 0.03(유온 − 50)), 잠김 6667 rpm, 6000 rpm 45 Hz(0.45X), 7200 rpm 50 Hz(0.417X)·65 µm, 코스트다운 4200 rpm까지 (히스테리시스) |
| 운전조건 반응 | 휠(6000 rpm): 유온 58 °C 위·하중 1.5에서 사라짐 / 휩(7200 rpm): 문턱 6240 · 6120 rpm으로 올라도 그대로 / 회전 풀림 하중 1.5 → 0.61배 / 유체력 선회 하중 1.5 → 0.89배, 부하 80 % 아래 사라짐 / stall 유량 60 → 40 % 2배 / 러브·구조 공진 무반응 |
| 6300 · 6600 rpm | 러브·풀림 52.5 Hz(0.5X), 러브 역/정 0.73, 풀림 정 = 역 / 유체막 47.25 Hz / 유체력 선회 49 Hz(0.445X) / stall 18.7 Hz(0.17X, 유량 60 %) / 구조 공진 38 Hz |
| 확인 문제 | Q1 모드 40 Hz → 잠김 약 5330 rpm |

### P7-5 구름베어링 (M7.4)

결함 크기는 설명용 모델 값이다. `figures-p7-5.test.ts`·`bearing.test.ts`가 고정한다.

| 조건 | 기준값 |
|---|---|
| 6205 · 3575 rpm (α 0, d/D 0.2034) | FTF 23.73 Hz(0.3983X), BSF 140.4 · 2×BSF 280.8, BPFO 213.6(3.585X), BPFI 322.7 Hz(5.415X). 어림값 214.5(+0.4 %) · 321.8 Hz(−0.3 %). BPFO + BPFI = 9X = 536.3 Hz |
| 같은 치수, α 40° | BPFO 226.4 Hz(3.799X) · BPFI 309.9 Hz(5.201X), 어림값은 5 % 넘게 낮음 / 앵귤러 프리셋(N_r 12, d 9.5, D 46, α 40°) BPFO 5.051X vs 4.8X |
| 미끄럼 1 % / 2 % | BPFO 211.5 · BPFI 324.8 · 2×BSF 278.0 · FTF 23.5 Hz / BPFO 209.3(−2 %) · BPFI 326.9 Hz(+1.3 %) |
| 위치 (3단계, 엔벨로프 2.8 ~ 3.8 kHz) | 외륜 BPFO 0.24 · 2× 0.13 g / 내륜 BPFI 0.17 · −1X 0.085 · 1X 0.14 g / 볼 2×BSF 0.13 · −FTF 0.053 · FTF 0.094 g / 케이지 FTF 0.017 g (다른 위치보다 7 ~ 14배 작음) |
| 4단계 (외륜, 건전 · 1 · 2 · 3 · 4) | 엔벨로프 BPFO ÷ 바닥 초음파 2 · 78 · 83 · 86 · 3.4, 공진 1 · 2.3 · 117 · 168 · 4.6 / 속도 BPFO 0 · 0.004 · 0.036 · 0.72 · 0.23 mm/s / 1X 1.0 · 1.0 · 1.0 · 1.3 · 2.9 / 첨도 2.4 · 2.5 · 4.2 · 5.6 · 3.2 / overall 1.0 → 3.5 mm/s |
| 성분 크기 읽기 (Hann) | ±3칸 제곱합 ÷ ENBW 1.5칸의 제곱근 → 칸 사이 성분도 1 % 안 (바로 읽으면 가리비 손실) |

### P7-6 기어 (M7.5)

결함 크기는 설명용 모델 값이다 (정도 60 %, 부하 80 %가 기본). `figures-p7-6.test.ts`·`gear.test.ts`가 고정한다.

| 조건 | 기준값 |
|---|---|
| 감속기 23 → 61이빨, 입력 1490 rpm | f₁ 24.83 Hz, GMF 571.2 Hz, f₂ 9.363 Hz(561.8 rpm), 회전수비 2.652, LCM 1403 → f_HT 0.4071 Hz(2.456 s = 피니언 61바퀴 = 기어 23바퀴), 큰 충격 1.42 · 3.88 · 6.33 s |
| 잇수 조합의 LCM | 23·61 1403, 24·37 888, 24·36 72(GCD 12, 피니언 3바퀴), 20·60 60, 23·36 828 / Q1 20 → 47이빨 1800 rpm: GMF 600 Hz, f₂ 12.77 Hz(766 rpm), f_HT 0.6383 Hz(1.567 s) |
| 건전 / 마모 (기어) | GMF 0.86 g, 2×÷GMF 0.35, 3×÷GMF 0.15, 공진 대역(2.2 ~ 3.0 kHz) RMS 0.018 g / 마모 0.96 g, 0.79 · 0.46, 공진 0.067 g(3.6배) |
| 편심 | 측대역 ±1 약 19 %, ±2 약 1.8 %, GMF의 1 %를 넘는 것 4개 (그 축 간격만) |
| 깨진 이 (충격 6 g × 정도) | 그 축 간격 측대역 ±15까지 30개 모두 1 % 넘음 (기어 가장 큰 것 약 3 %, 피니언 1 ~ 6 %), 파형 충격 봉우리 2.5 g vs 맞물림 물결 1.3 g |
| 백래시 (부하 20 · 30 · 80 · 100 %) | 공진 대역 0.16 · 0.14(건전의 9.2배) · 0.044 · 0.020 g(= 건전) / 건전 공진 0.015 ~ 0.020 g, GMF 0.44 → 1.0 g |
| TSA (깨진 기어 18번) | 기어 축 15바퀴: 102°·18번·FM4 약 100 / 피니언 축 1 · 5 · 15 · 40바퀴 FM4 33 · 17 · 5.3 · 3.5 (건전 3.6) / 깨진 피니언 6번: 피니언 축 40바퀴 84°·FM4 35 / 편심(기어) Difference FM4 3.7 (건전 3.2) |
| 켑스트럼 | 깨진 피니언 1/f₁(40.27 ms) 0.11 (건전 0.0092), 깨진 기어 1/f₂(106.8 ms) 0.17 (건전 0.0064) |

### P7-7 전기적 원인 (M7.6)

크기·시간 상수는 설명용 모델 값이다(`lib/faults/electric.ts`). `figures-p7-7.test.ts`·`electric.test.ts`가 고정한다.

| 조건 | 기준값 |
|---|---|
| 2극 60 Hz, 명판 3560 rpm, 부하 60 % (슬립 ∝ 부하) | 3576 rpm, 1X 59.6 Hz, 슬립 0.67 %, f_slip 0.4 Hz, PPF 0.8 Hz, 2X 119.2 Hz, 맥놀이 1.25 s / 전부하 PPF 1.33 Hz / 부하 20 % PPF 0.27 Hz / 30 % 0.4 Hz |
| 4극 50 Hz, 명판 1470 rpm | 부하 60 %: 1482 rpm, 24.7 Hz, 4X 98.8 Hz, PPF 1.2 Hz / 80 %: 1476 rpm, 24.6 Hz, PPF 1.6 Hz / Q1 4극 60 Hz 1785 rpm: f_slip 0.25, PPF 1.0, 4X 119.0 Hz |
| 항등식 | PPF = P·f_slip = 2f_L − P·f_r, 전류 측대역 LF ± 2·s·LF = LF ± PPF, 동기기 PPF 0 (1X = LF, 2X = 2×LF) |
| 로터바 (2극, 부하 60 %, Hann) | 1X 둘레 봉우리: 2 s 1개, 4 s 이상 3개 (T ≥ 3/PPF = 3.75 s), 부하 20 %는 16 s에서 3개 / 측대역 0.5 × 부하 mm/s |
| 전원 차단 (τ_e 0.1 s, 회전수 f_r/(1 + t/3 s), 기계 ∝ 회전수²) | 0.5 s 뒤 전기 0.67 %, 기계 73 %, 회전수 86 %(2X 102.2 Hz) / 남은 크기(시험 전 = 1): 고정자 0.19 · 0.089(2 s), 미스얼라인 0.71 · 0.35 |
| 2극 동기 발전기 (계자 τ 0.8 s, 회전수 유지) | 120 Hz: 고정자 3.4 → 0.46, 미스얼라인 3.38 → 3.26 mm/s (2 s 뒤, 계자 8.2 %) |
| 8 s 기록 2×LF 둘레 (2극, 부하 60 %) | 고정자 120 Hz 3.2 · 119.2 Hz 약 0.22 / 미스얼라인 119.2 Hz 약 2.9(실제 3.25, 칸 사이) · 120 Hz 0.2 mm/s |

### P7-8 유체 · 공력 원인 (M7.6)

설명용 모델 값이다(`lib/faults/flow.ts`, 펌프는 P7-1·LAB-FAULT-01과 같은 3575 rpm·날개 7장). `figures-p7-8.test.ts`·`flow.test.ts`가 고정한다.

| 조건 | 기준값 |
|---|---|
| 펌프 3575 rpm, 날개 7장 | 1X 59.58 Hz, VPF 417.1 Hz, 2×VPF 834.2 Hz, 두 바퀴 33.6 ms / Q1 팬 6장 1480 rpm: 148 · 296 Hz |
| 날개 통과 0.6/간극 × (1 + 3(q − 1)²) | 0.6(BEP) · 1.25(40 %) · 0.71(125 %) · 1.2 mm/s(간극 절반, BEP) |
| 재순환 (q < 0.6) | 2.5 × ramp(0.6 − q, 0.3): 40 %에서 1.67 (측정 대역 RMS 약 1.8) mm/s |
| 1X | 수력 불평형 2.56(60 %) · 1.6(BEP) · 2.32(130 %), 기계 불평형 4.3 일정, 건전 0.8 mm/s |
| 캐비테이션 (NPSHr ∝ 0.55 + 0.45q², 여유 1.2 아래에서 시작) | 흡입 여유 1.0(BEP)에서 2 ~ 6 kHz 1 g, +0.2 또는 유량 70 %면 0, 110 %면 더 큼 / 정상 펌프 여유 1.34(120 %) · 1.22(130 %) / 외륜 결함 비교 BPFO 213.6 Hz |
| 압축기 9000 rpm (1X 150 Hz) | 압력비 설계 2.29, 서지선 0.55에서 3.0 / stall(φ < 0.72) λ = 0.22 − 0.3(0.72 − φ): 0.70 → 32.1 Hz · 0.214X · 2 µm, 0.64 → 29.4 Hz · 0.196X · 8 µm / 서지 방지 0.62 유지: 28.5 Hz · 10 µm / 서지(φ < 0.55) 0.7 Hz, 토출 압력 약 40 % 폭, 축방향 약 120 µm |

### P8-1 여러 모드 Bode/Polar (M8.1)
- 교육용 N₁/N₂=1500/3000 rpm·ζ=.06/.04·e=5/3 µm Peak·형상 [1,1,1.5]/[1,−1,0]·20 rpm 표본·운전3600 rpm.
- 베어링1 피크: 1500 rpm·83.4635277 µm pp, 3020 rpm·78.7255436 µm pp. 3000 rpm 베어링1/2/중앙=77.2051148/75.1176725/19.9363056 µm pp.
- 동일 방향 베어링 위상차: 1500 rpm 2.7418779°, 3000 rpm159.9606078°. 중앙2차성분0. 분리2차N₂응답은ζ .04/.20→75/15 µm pp.
- 분리1차AF(2 rpm)=8.2153257 (근사8.3333333), 개념SM=58.3333333/16.1111111% (규격판정 아님).
- 1차bow2 µm Peak·60°: 0rpm한계4 µm pp, 200rpm4.1793629 µm pp, 1500rpm103.6506260 µm pp; 200rpm보상뒤100.8227437 µm pp, 기준점0. 보상으로동적bow가모두사라지지않음.
- 검증: src/lib/rotor/multimode.test.ts·src/figures/figures-p8-1.test.ts, P4-1 simulateRunUp 복소극한 상대오차1e−12. SI Peak 내부·UI에서pp변환.

### P8-2 열 휨·Morton형 트렌드 (M8.5)
- 지정 곡선, 고정U=20 µm Peak@350°·2X=2 µm Peak·1분표본60분. 열전달/유막 피드백 해석·기동 허용 모델 아님.
- 열 휨 Q=12 exp(−t/1200) µm Peak@80°: 합0분23.32380758·60분20.00892152, 열 기여60분0.5974448204·벡터 변화11.40255518 µm Peak. τ60분이면 기여4.414553294·합20.48141306.
- 저속 별도 기하 예제 bow12·runout4 µm Peak@80°: 0분32·60분9.194889641·극한8 µm pp.
- Morton형 B₀5 µm Peak·P1800 s·g1: 60분Q10@80°·합22.36067977@16.56505118°·변화5 µm Peak. g0은30/60분 복귀, 15분 변화10.
- B₀20@170°·열 휨0분에서 합0. 합1X≤1 µm Peak의 위상/영역 보류는 학습 예제의 표시 조건.
- 검증: lib/plots/thermal.test.ts·figures/figures-p8-2.test.ts. 복소합·지수·닫힌 원·RMS/DFT·위상 공백·그림 범위.

### P8-3 ST 부하·부분 분사 (M8.2)
- 가상 Ω=3000 rpm·Nn=1800 rpm·ζ=.06·q/k=.03+.15ℓ, 경계ℓ*=.6. 50/60/80% 안정/경계/불안정, 경계σ=δ=0. ζ=.04 경계1/3.
- 부하50% δ=.04700480202, 80% δ=−.09367975528·σ=2.813220873/s·f=30.03019025Hz(.600603805X). 초기5µm Peak, 8고유주기 뒤3.433423040/5/10.58703506µm Peak.
- P4-3 원통·중력1000N·μ.02Pa·s. 50% 지정분사힘600N 상향/하향/우향→합력400/1600/1166.190379N. 전주/상향/하향 ε=.6757879254/.5165520952/.7389636618; 전주/상향 hmin=32.42120746/48.34479048µm. 분사·μ는 별도 안정 계수를 변경하지 않음.
- 자유팽창 α_T12e−6/K·L8m·ΔTr250/ΔTc150K→24/14.4mm·차이9.6mm. 전체축+.2mm→공통기준 상대타깃9.8mm. 실제 DE·열간 정렬·다축 반력 예측 아님.
- 검증: lib/rotor/steam.test.ts14·figures/figures-p8-3.test.ts2, 기존API동등·합력회전·지수해·초기진폭비례·경계구간·그림숫자/범위.

### P1-4 장치·파형 동기 재생 확장 (M2.4, 2026-10-08)
- 기존 m1kg·fn5Hz·Xst10mm·ζ.05 해석해. 공진 정상상태 t0/.05/.1/.15/.2s→F/F0=1/0/−1/0/1, x=0/100/0/−100/0mm. r.5/2의 t0 변위13.27433628/−3.318584071mm.
- 장치·현재점은 forcedMotionAt의 동일시각 해. 그림 자동변위축척을 명시, 재생속도는 물리계수와 무관. T/4는 가진주기의 다음 격자, 0Hz·범위 밖 비활성.
- 검증: lib/mck/forcedAnimation.test.ts6, 기존해 일치·방향/위상·영점·초기조건·T/4 경계. QA --forced-smoke에서 재생/정지/재개/탐색/조건변경/전체파형/0Hz 검사.

### P1-3 장치·파형 동기 재생 확장 (M2.3, 2026-10-08)
- m=1kg·fₙ=5Hz·x₀=10mm·v₀=0. ζ=.05: T_d=.20025046972870356s, 다음 양의 피크7.301153801794058mm. ζ=.2: T_d=.20412414523193154s, 다음 피크2.7732925563900745mm. ζ=0의 T/4=.05s에서는 x=0·감쇠력0.
- 현재 x/v/−cv는 dampedMotionAt의 동일 해. 다음 피크 t=nT_d(정지 초기조건·양의 x₀), 임계/과감쇠 또는 2초 밖이면 비활성. 장치 고정 축척 ±20mm, 피스톤과 질량 동기.
- 검증: dampedAnimation.test.ts 6개, 기존 해 동등·4감쇠 구간·피크 감소·감쇠력 방향·영점/경계. QA --damping-smoke·--anim-smoke: 재생/정지/재개/탐색 반복/속도/끝/화면밖·전체 Plot 갱신 없음.

### P8-4 GT 동압·벡터 (M8.3)

- LAB-GT-01: 셀 회전비0.4·셀1개·3000/6000 rpm →20/40 Hz, 셀2개·6000 rpm→80 Hz. 서지5 Hz·음향300 Hz는 회전수 독립 지정값.
- A2 kPa Peak의 RMS=1.414213562 kPa. 원주m1·B90° 진행파는B−A −90°, 정재파는B0·위상 없음. 종방향x/L0.5는0, x/L1은2 kPa·반대 위상. 닫힌 관 c600 m/s·L1 m→300 Hz.
- 가상23:61·입력1490 rpm: GMF571.1666667 Hz·출력9.363387978 Hz. 전후20 µm Peak·0→90°의응답 차=28.28427125 µm Peak. 12차 가진×3000 rpm=600 Hz 교차는 지정 모드 예제.
- 테스트: machine/gt.test.ts(파장·공간/시간 주기·위상·절점·RMS·선형성·경계), figures-p8-4.test.ts(본문 수치·그림7개 범위). 실기 발생/튜닝/손상/보호 경계 계산 아님.

### P8-5 발전기·축계 (M8.4)

- 동기 속도: 2극50 Hz→3000 rpm·1X50·2LF100 Hz=2X; 4극60 Hz→1800 rpm·1X30·2LF120 Hz=4X.
- 단부 단일모드 fn120 Hz, ζ0.05→r1 응답비10·90°; ζ0.1→5·90°. mck/forced 재사용.
- U20 µm Peak@0°, i0=.5→i1=1, G15 µm·β90°·τ120 s: 초기20.3485 µm·10.6197°, tτ22.7589 µm·28.5050°, hτ=.7240904, |ΔV|7.11136 µm.
- t600 s 전류50% 복귀, h연속; 정상 고전류25 µm·36.8699°. β180°는초기16.25→정상5 µm. I²는4배, 실제 온도·총진폭4배를 뜻하지 않음.
- 자유2관성 J1=100·J2=200 kg·m², Kt=10⁶ N·m/rad→강체0 Hz·탄성19.49242 Hz, 모드[2/3,−1/3]. 전기계·감쇠·SSR 경계 없음.
- 테스트: generator.test.ts(ODE·연속·극한·벡터·상쇄·동기속도·강제응답·고유방정식·에너지), figures-p8-5.test.ts(기준값·8그림 범위). 내부SI, h는무차원; β·φ는rad, 표시는°.

## 7. 참고자료

참고자료의 **단일 기준은 `src/data/references.ts`** (D-046). 사이트의 레퍼런스 > 참고 문헌(`/reference/sources/`)이 종류별 목록과 "인용한 페이지"를 보여 준다. 2026-10-08까지의 옛 표는 `archive/References.md`.

- 새 자료: `references.ts` 머리의 "다음 번호"로 한 줄(종류·저자·제목·출처·연도·확인한 url·쓰임·이용 범위) → 페이지 `## 참고자료`의 `<References items={[['R-xx', '이 페이지에서 쓴 곳']]} />`, 본문 인용은 `<Cite ids={['R-xx']} />`.
- 유료 규격(ISO·API)은 note에 "개념만 요약" — 본문·표·경계값은 옮기지 않는다 (I-009).
- 데이터셋(IMS/NASA, MFPT, PRONOSTIA/FEMTO, Paderborn, PHM09)은 M11.2에서 라이선스와 용량을 확인한 뒤 추가한다.

## 8. 추가 콘텐츠 후보 (백로그)

- 원본 말미의 심화 제안 ①~④는 Curriculum에 반영됨 (① → P2-9, ② → P7-4 감별표, ③ → P5-6, ④ → P6-3·P4-3)
- 학습 진도 체크 (브라우저에 저장)
- 페이지별 자가 점검 퀴즈
- 사이트 랩과 같은 결과를 numpy로 재현하는 교차검증 스크립트 (`scripts/verify/`, 원본 실습 1)
- 피크 보간(P2-5 심화)을 별도 미니 랩으로
