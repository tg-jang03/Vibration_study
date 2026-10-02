# 원본 커리큘럼 (읽기 전용)

> 2026-10-02 사용자가 제공한 원문을 그대로 옮김. **수정 금지** (D-004).
> 오류·보완 사항은 `../Issues.md`(유형: 콘텐츠), 사이트에 반영하는 내용은 `../Contents.md` 참조.

---

아래는 "학교에서 배운 MCK/모드해석" → "현장 회전체(GT/ST) 진단" 사이의 간극을 메우는 **학습 커리큘럼 체크리스트**입니다. 순서대로 쌓아올리는 구조로 짰고, 각 항목마다 "이걸 알면 현장에서 무엇을 할 수 있는지"를 붙였습니다.

---

# PHASE 0. 사고방식 전환 (1주)

학교: 시스템(M,C,K)을 알고 → 응답을 예측
현장: 응답(신호)만 알고 → 시스템의 결함을 역추정

| 학교 개념 | 현장 대응물 |
|---|---|
| Mode shape | Bode/Polar plot, Mode indicator (ODS) |
| Natural frequency | Critical speed, Structural resonance |
| Damping ratio ζ | Amplification Factor (AF = 1/2ζ), Half-power법, API 684 기준 |
| FRF | Bump test, Impact test, Run-up 데이터 |
| Forced response | Unbalance response, 1X vector |
| 복소 고유치 | Stability, Log decrement(δ), 서브싱크로너스 진동 |

👉 **첫 과제**: "AF = 1/(2ζ) = N1/(N2-N1)" 반공진법을 run-up 데이터에서 직접 뽑아보기. API 684의 Separation Margin 계산식까지.

---

# PHASE 1. 신호처리 기초 (가장 중요, 2~3주)

## 1-1. 샘플링과 Fmax
- Nyquist, Aliasing, Anti-aliasing filter(AAF)
- 왜 상용 분석기는 **fs = 2.56 × Fmax** 인가 (AAF roll-off 여유)
- Fmax 선정 기준: 일반 1X의 10배? 베어링은 40~50X? 기어는 3.5×GMF?

## 1-2. 분해능 (Resolution) — 질문하신 핵심
암기할 것은 이 식 3개뿐입니다.

```
Δf = Fmax / LOR  (LOR = Lines of Resolution)
T  = 1 / Δf      (필요한 측정 시간)
N  = 2.56 × LOR  (필요한 샘플 수)
```

**현장 판단 기준:**
- 2개 성분을 분리하려면 Δf ≤ (두 주파수 차이)/ 2~3 이상 여유
  - 예: 3600rpm(60Hz) 1X와 전기 2×LF(120Hz) 구분 → 쉬움
  - 예: 2pole 발전기 1X(60Hz)와 Line Frequency(60Hz) → **FFT로 분리 불가** → 다른 방법(위상, 부하 변화, 전원 차단 시 순간 소멸) 필요
  - 예: Oil whirl 0.42X vs 0.48X 구분, 베어링 BPFI 주변 ±1X 측대역 → 고분해능 필요
- **측정 시간 T를 먼저 생각하는 습관**: Δf = 0.1Hz 원하면 T = 10초가 필요. Run-up처럼 변하는 신호에서는 불가능 → 트레이드오프 이해

👉 **과제**: Fmax 1000Hz, 3200 line이면 Δf와 T는? 이게 3초 걸리는데 코스트다운 중 2초면 RPM이 얼마나 변하는가? (→ Smearing)

## 1-3. 윈도우 (Window)
| Window | 용도 | 특징 |
|---|---|---|
| Uniform(Rectangular) | 과도신호, Impact, 1 frame에 다 들어오는 신호, Order tracking(동기샘플링) | 누설 최대, 분해능 최고 |
| **Hanning** | 상시 회전체 진동 (90% 이 선택) | 진폭오차 최대 -16%(진폭보정 필요) |
| **Flat Top** | 교정, 진폭 정확도 필요시(밸런싱 전 측정) | 진폭오차 <1%, 주파수 분해능 나쁨 |
| Exponential | 임팩트 테스트 응답 채널(가벼운 구조, 잔향 긴 경우) | 인위적 감쇠 추가 → ζ 과대평가 주의 |
| Force window | 임팩트 해머 입력 채널 | 더블히트/노이즈 제거 |
| Kaiser-Bessel, Blackman-Harris | 큰 성분 옆 작은 성분 찾을 때 (동적영역 큼) | — |

반드시 이해할 것:
- **Spectral Leakage(누설)**와 **Picket Fence Effect(진폭 손실)**
- **ENBW (Equivalent Noise BandWidth)**: Hanning=1.5 bins → PSD 계산 시 필수
- **Amplitude Correction Factor** vs **Energy(Noise) Correction Factor** (언제 어떤 걸 쓰는가: 톤 신호는 진폭보정, 랜덤/노이즈는 에너지보정)

## 1-4. 평균화 (Averaging)
- **Linear(선형)**: 정상 운전 상태, 노이즈 저감 (랜덤 노이즈는 √N로 감소)
- **Exponential**: 변하는 상태 모니터링, 최근 값 가중
- **Peak Hold**: Run-up/Coast-down 최대값 포착, Bump test
- **Overlap (50~75%)**: Hanning 쓸 때 끝단 데이터 손실 보상 + 측정 시간 단축. **Uniform window엔 overlap 무의미**
- **Time Synchronous Average(TSA)** ⭐: Keyphasor 기준 시간영역 동기 평균
  - 비동기 성분 완전 제거 → 기어/블레이드 결함 특정 축 분리
  - GT 액세서리 기어박스, ST 턴기어, 다축 설비에서 필수
- **Synchronous vs Non-synchronous 성분 분리**, Residual signal 개념

## 1-5. 스펙트럼의 종류
- Linear Spectrum vs **Power Spectrum** vs **PSD(g²/Hz)**
  - PSD는 언제? → 랜덤/광대역(배경 노이즈, 구조 응답). Δf 바뀌어도 값 불변 ← 이게 핵심
  - 디스크리트 톤(1X 등)은 PSD로 보면 안 된다 (Δf에 따라 값이 변함)
- Peak / Peak-Peak / RMS 변환 (정현파 가정의 함정)
- Log scale, dB scale (dB = 20log(A/Aref), ISO ref 보통 1e-6 m/s or 1e-6 m/s²) → **작은 성분(베어링 초기결함) 볼 때 필수**
- Linear vs Log 축에서 보이는 것의 차이 (하모닉 패밀리는 log에서 잘 보임)

---

# PHASE 2. 센서와 측정 체인 (1~2주) — GT/ST는 특히 중요

## 2-1. 센서 3종
| 센서 | 측정량 | 유효대역 | GT/ST에서의 위치 |
|---|---|---|---|
| Proximity probe (Eddy current) | 상대 변위 | DC~2kHz | **저널베어링 기계 필수** (API 670), X-Y 90° |
| Velocity | 절대 속도 | 10~1000Hz | 케이싱 |
| Accelerometer | 절대 가속도 | 0.5Hz~15kHz+ | 케이싱, 기어박스, 구름베어링 |

- **왜 ST/GT는 변위(프록시미티)가 주인가**: 무거운 케이싱 + 저널베어링 → 케이싱 진동이 로터 거동을 반영 못함
- **Gap voltage / DC gap** 읽는 법 → Shaft Centerline Plot
- **Slow roll runout 보상** ⭐: 기계적/전기적 런아웃 제거 안 하면 오진. 150~600rpm 구간 벡터 저장 후 벡터 차감
- **Keyphasor(키페이저)**: 위상 기준. 없으면 밸런싱·오빗·Bode 전부 불가
- API 670 (Machinery Protection System) 한 번 통독

## 2-2. 측정 체인 함정
- 센서 마운팅(자석/핸드/스터드/접착)에 따른 주파수 한계 (핸드홀드 ~1kHz)
- **적분 노이즈(Ski-slope)**: 가속도→속도 적분 시 저주파 발산, HP filter 필요
- Settling time, AC/DC coupling, ICP 바이어스
- 케이블 노이즈, 그라운드 루프, Triboelectric
- 센서 공진 주파수와 Fmax 관계 (가속도계 공진 근처 증폭)

---

# PHASE 3. 필터와 특수 처리 (2주) — 질문하신 부분

## 3-1. 기본 필터
- LP / HP / BP / Band-stop(Notch)
- Butterworth/Chebyshev/Bessel, roll-off(dB/oct), 위상 왜곡
- **Zero-phase filtering (filtfilt)**: 시간파형 위상 중요할 때

## 3-2. 현장 특수 필터 ⭐
| 기법 | 용도 |
|---|---|
| **Tracking filter (Vector filter)** | 1X, 2X 성분만 추출 → Bode/Polar/밸런싱. 회전수 추종 narrow BPF |
| **Notch filter** | 1X 제거 후 서브싱크로너스/베어링 결함 보기 |
| **Envelope / Demodulation** ⭐⭐ | 베어링 초기 결함. 고주파 BPF(공진대역) → 정류 → LP → FFT |
| **Order filter** | 차수 기반 |
| **Cepstrum (Liftering)** | 하모닉/측대역 패밀리 간격 자동 추출, 전달경로 제거 |
| **Adaptive Noise Cancellation / SANC** | 기어 노이즈 속 베어링 신호 추출 |
| **Spectral Kurtosis / Kurtogram** ⭐ | **Envelope의 BPF 대역을 어디로 할지** 자동 결정 (실무 핵심 고민 해결) |
| **MED / Spectral Editing / Autocorrelation** | 임팩트 강조 |
| **PeakVue / gSE / Spike Energy / SEE** | 벤더별 특화 기법 (Emerson/SKF/CSI) — 원리는 결국 HP+피크검출 |

👉 **Envelope 실무 포인트**: 대역 선택을 "베어링 공진대역(보통 1~20kHz)" 중 SNR 높은 곳으로. 이걸 감(感)으로 하지 말고 **Kurtogram**으로 정량화하는 법 배우기.

## 3-3. 적분/미분
- 가속도 ↔ 속도 ↔ 변위 (시간영역 적분 vs 주파수영역 적분 ω 나누기)
- 어떤 영역에서 볼 것인가:
  - **변위**: <10Hz, 로터 거동, 간극 대비 평가
  - **속도**: 10~1000Hz, 일반 진단의 기본 (ISO 20816 평가량)
  - **가속도**: >1000Hz, 베어링/기어/임팩트

---

# PHASE 4. 회전체 진단 주파수 사전 (3주) — "몇 X에 뭐가 나오나"

## 4-1. 차수(Order) 기반 결함 지도

| 주파수 | 결함 후보 | 구별 포인트 |
|---|---|---|
| **1X** | 불평형, 벤트샤프트, 열변형(Thermal bow), 로터 크랙, 공진, 런아웃 | 위상 안정성, 부하/온도 의존, 폴라 플롯 |
| **1X + 2X (축방향 큼)** | 미스얼라인먼트(각)  | 커플링 양쪽 축방향 위상 ~180° |
| **2X 우세** | 평행 미스얼라인, 크랙(2X 성장), 비등방 강성 | Full spectrum의 역방향(reverse) 성분 |
| **0.5X, 1.5X, 2.5X...** | 기계적 풀림(Looseness), 러브 | 하모닉 다수 + Non-linear |
| **0.38~0.48X** | **Oil Whirl (저널베어링)** ⭐ | 서브싱크로너스, 회전수 따라 비례 추종 |
| **고정 주파수 = 1st critical** | **Oil Whip / Steam Whip** ⭐⭐ | 회전수 올려도 주파수 고정 → 불안정, 위험 |
| **0.3~0.5X 광대역** | 로터 불안정(seal, aero cross-coupling), ST Steam whirl | Log decrement, 부하 의존 |
| 1X 하모닉 다수 + 노이즈 | 러브(Rub) — partial / full annular | Full spectrum 역방향 성분, 오빗 변형, 열적 영향 |
| **BPFO/BPFI/BSF/FTF** | 구름베어링 (GT 액세서리, 보조기기) | 비정수배, 측대역 |
| **GMF ± n×RPM** | 기어 (측대역 간격이 결함 축 지시) | Cepstrum 유용 |
| **Nb × RPM** | 블레이드 통과(BPF), GT 압축기/터빈 단 | 블레이드 손상/파손 |
| **Nv × RPM** | 베인 통과 |
| **LF, 2×LF (50/60, 100/120Hz)** | 전기적(발전기, 모터), 고정자 편심, 로터바 | 전원 차단 순간 소멸 여부 |
| **Pole pass freq 측대역** | 모터 로터바 결함 | 1X ± PPF |
| 랜덤 광대역 | 캐비테이션, 유동, 마찰, 심한 풀림 | |

## 4-2. 베어링 결함주파수 계산
```
BPFO = (n/2)·fr·(1 − (d/D)cosα)
BPFI = (n/2)·fr·(1 + (d/D)cosα)
BSF  = (D/2d)·fr·(1 − ((d/D)cosα)²)
FTF  = (1/2)·fr·(1 − (d/D)cosα)
```
- **4단계 베어링 고장 진행(Stage 1~4)**과 각 단계에서 보이는 지표(초음파/엔벨로프 → 공진 → 결함주파수+하모닉 → 노이즈바닥 상승)
- 슬립(slip) 때문에 실제 ±1~2% 어긋남 → "정확히 안 맞아도 베어링"

## 4-3. GT/ST 특화 현상 ⭐⭐ (여기가 본업)
- **Critical speed와 Run-up/Coast-down**: 1st, 2nd bending critical, 통과 시 위상 180° 반전
- **Thermal bow / Rotor bow**: 기동 시 1X 변화, Turning gear 중요성
- **Morton Effect**: 저널베어링 비대칭 가열 → 느린 주기 1X 벡터 선회(수 분~수십 분 주기)
- **Steam Whirl / Steam Whip (ST)**: 부하 증가 시 서브싱크로너스 발생, 부하 임계값(Threshold load)
- **Alford force / Aero cross-coupling (GT)**
- **Partial arc admission** 영향 (ST 밸브 시퀀스)
- **Differential expansion, Axial position, Eccentricity** 모니터링
- **Catenary alignment / Cold-hot alignment** (대형 ST 다축)
- **Rotating stall / Surge (GT 압축기)**: 서브싱크로너스 광대역, 동압(dynamic pressure) 신호
- **Combustion dynamics (GT)**: 동압센서, 수백~수천 Hz, 모드(Longitudinal/Circumferential)
- **Generator**: 2×LF 코어 진동, 엔드와인딩 공진, 샤프트 전압/전류
- **Torsional vibration**: 발전기 계통 외란, 서브싱크로너스 공진(SSR) — 횡진동 센서로 안 보임
- **Blade vibration**: Campbell diagram, BTT(Blade Tip Timing), NSMS

---

# PHASE 5. 현장 플롯 읽기 (2주)

반드시 능숙해져야 할 8가지:
1. **Time waveform** — 임팩트/변조/클리핑/트런케이션, Crest factor, Pk-Pk
2. **Spectrum** — 위 사전 적용
3. **Orbit (X-Y)** ⭐ — 프리세션 방향, 8자/바나나/루프 형태별 진단, Keyphasor dot 개수 = 차수
4. **Shaft Centerline Plot** ⭐ — 베어링 내 축 위치, 편심률, 얼라인 변화, 과도한 상승 = 불안정 징후
5. **Bode (진폭/위상 vs rpm)** — Critical speed, AF, 위상 반전
6. **Polar / Nyquist** — 모드 식별, 밸런싱에 직결
7. **Waterfall / Cascade / Full Spectrum Cascade** ⭐ — 서브싱크로너스 추적, Oil whip 식별의 결정적 도구
8. **Trend / Vector trend (1X amplitude+phase)** — 변화 감지는 절대값보다 **벡터 변화량**

추가: **Full Spectrum** (X,Y 복소 조합 → 정/역방향 분리) — 러브, 비등방, 미스얼라인 구별에 강력. ST/GT 진단에서 Bently 계열 쓰면 필수.

---

# PHASE 6. 차수추적 & 회전수 모를 때 (1~2주) — 질문하신 부분

## 6-1. Order Tracking
- **동기 샘플링(Synchronous resampling)**: 시간축 → 각도축 재샘플링 → Smearing 제거
- Order spectrum vs Frequency spectrum
- Tacho/Keyphasor 신호 처리 (Zero-crossing, PLL)
- **Tacholess Order Tracking** ⭐: 태코 없이 스펙트로그램에서 instantaneous frequency 추출 → 위상 복원 → 리샘플링

## 6-2. 회전수를 모를 때 전략
**저주파에서:**
- 스펙트럼에서 **하모닉 패밀리**(f, 2f, 3f...) 찾기 → 기본 간격이 1X 후보
- **Cepstrum** 쓰면 하모닉 간격(quefrency) 자동 검출
- 전기 성분(50/60Hz 정배수)과 구분
- 명판 rpm, 슬립(유도전동기 1~3%), 기어비로 역산
- 다축 설비는 축별 1X 후보군 만들기

**고주파에서:**
- **Envelope spectrum의 측대역 간격** = 1X 또는 FTF (내륜 결함 측대역 = 1X)
- **GMF 측대역 간격** = 해당 축의 회전수
- **BPF(블레이드 통과)/Nb** = 1X
- **FTF ≈ 0.4×1X** 역산

**신호처리적:**
- Autocorrelation으로 주기 검출
- Spectrogram(STFT)에서 차수 라인들의 기울기 비 → 어느 라인이 1차인지 추정
- 운전조건 바꾸기(부하/속도 변경) → 추종하는 성분 = 회전 관련, 고정 = 구조/전기

---

# PHASE 7. 공진/구조 시험 (1주)
- **Bump test / Impact test** 실무 (운전 중 vs 정지 중)
- Coherence, 평균, 더블히트 체크
- **ODS(Operating Deflection Shape)** — 현장 모드 가시화
- **Half-power bandwidth**로 ζ 추정, Q factor
- 공진 vs 강제진동 구별법: 속도 변화 시 추종 여부, 위상 거동
- Soft foot, 기초 강성, 배관 반력

---

# PHASE 8. 밸런싱 & 정렬 (2주)
- 1면/2면 **Influence Coefficient Method**, Trial weight 선정
- **Modal balancing** (유연 로터, GT/ST처럼 critical 넘는 기계)
- 4-run method (위상 없을 때)
- ISO 21940 (구 1940) balance quality grade G
- **High-speed balancing (현장 트림밸런싱)** vs 공장 밸런싱
- Split weight, Vector 계산 연습
- 레이저 얼라인먼트, Thermal growth 보정, Hot alignment

---

# PHASE 9. 규격 & 판정 기준 (1주)
- **ISO 20816** (구 10816/7919) — 특히 **Part 2 (대형 ST/GT 발전설비)**, Part 3, Part 5
- Zone A/B/C/D 판정, 절대값보다 **변화량(Zone 경계, Δ25%)**
- **API 670** (보호 시스템), **API 612/616** (ST/GT), **API 684** (로터다이나믹 튜토리얼 — 꼭 읽으세요)
- **ISO 13373** (상태감시 진단 절차), ISO 18436 (자격, CAT I~IV)
- 알람/트립 셋팅 로직 (Voting, Alarm delay, Danger bypass)

👉 자격증으로 체계 잡기: **ISO 18436-2 CAT II → CAT III** 또는 Vibration Institute **CAT III/IV**. GT/ST면 CAT III 이상 + Rotordynamics 교육(Bently Nevada / Rotating Machinery 과정).

---

# PHASE 10. 심화 (지속)
- **Rotordynamics**: 베어링 강성/감쇠 계수(Kxx,Kxy,Cxx...), Campbell diagram, Log decrement, 안정성 해석, 틸팅패드 vs 고정패드
- **Torsional analysis**: Holzer, SSR, 전기계통 외란
- **Condition Monitoring 시스템**: Bently 3500/System1, Emerson AMS, ADRE, Prüftechnik 등 실제 툴 숙달
- **Machine Learning 기반 진단**: Feature engineering (RMS, Kurtosis, Crest, Spectral features), 이상탐지. 단, **물리 기반 feature 없이 하면 실패**
- **Acoustic Emission, 초음파, 서모그래피** 상호보완

---

# 실습 추천 (이게 제일 빨리 늘어요)

1. **Python으로 직접 FFT 뷰어 만들기** (numpy/scipy/matplotlib)
   - 윈도우/오버랩/평균/보정계수 직접 구현 → 상용 SW가 무슨 짓 하는지 체감
   - 합성신호 생성: 1X + 하모닉 + 베어링 임펄스 + 노이즈 → 자기가 넣은 결함을 자기 알고리즘으로 찾기
2. **공개 데이터셋으로 검증**
   - CWRU Bearing Data, IMS(NASA) Bearing, MFPT, PRONOSTIA/FEMTO, Paderborn
   - Gearbox: PHM09
3. **분해능 실험**: 같은 신호를 Δf 바꿔가며 FFT → 측대역이 사라지고 나타나는 걸 눈으로 확인
4. **윈도우 실험**: 정현파 주파수를 bin 중심 / bin 사이에 놓고 Uniform vs Hanning vs Flattop 진폭 비교
5. **현장 데이터 아카이빙**: 자사 GT/ST의 기동/정지 Raw waveform을 모아두고 Bode/Cascade 직접 재생성

---

# 추천 자료

| 분류 | 자료 |
|---|---|
| 진단 바이블 | **"Machinery Vibration: Measurement and Analysis" – Victor Wowk** |
| 신호처리+진단 | **"Vibration-based Condition Monitoring" – Robert Bond Randall** ⭐ (Envelope/Cepstrum/TSA의 교과서) |
| 로터다이나믹스 | **"Fundamentals of Rotating Machinery Diagnostics" – Donald Bently** ⭐⭐ (GT/ST 하신다면 필독) |
| 로터다이나믹스 이론 | Vance, "Machinery Vibration and Rotordynamics" / Muszynska |
| 실무 핸드북 | Mobius / Technical Associates of Charlotte (Berry) 차트 |
| 규격 | API 684 (무료 아님이지만 요약본 많음), ISO 20816-2 |
| 온라인 | Mobius Institute, Bently Nevada ORBIT Magazine 아카이브 (무료, GT/ST 사례 풍부) ⭐ |

---

# 3개월 학습 순서 제안

```
1개월차: PHASE 1 (신호처리) + PHASE 2 (센서)  ← 여기에 시간 제일 많이
         + Python 실습 병행
2개월차: PHASE 4 (결함 사전) + PHASE 5 (플롯 읽기) + PHASE 3 (필터)
         + 자사 설비 과거 데이터로 복기
3개월차: PHASE 6,7,8,9 + GT/ST 특화 현상 집중
         + ORBIT 사례 논문 20편 읽기
이후:    PHASE 10, 자격증
```

---

필요하시면 다음 중 하나를 깊게 파드릴 수 있습니다:
- ① **Resolution/Window 설정 실무 의사결정 플로우차트** (측정 목적별 Fmax/LOR/Window/Avg 조합표)
- ② **GT/ST 서브싱크로너스 진동 진단 플로우** (Oil whirl / whip / steam whirl / rub 구별)
- ③ **Envelope 분석 대역 선정 실전 가이드 (Kurtogram 포함, Python 코드)**
- ④ **Orbit + Shaft centerline 판독 패턴 모음**

어느 쪽부터 갈까요?
