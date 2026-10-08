# References — 옛 참고자료 표 (보관)

> D-046(2026-10-08)으로 참고자료의 단일 기준은 `src/data/references.ts`가 되었다. 아래는 그때까지 Contents §7에 있던 표다. R-04·R-15는 이후 앞 자료만 남기고 뒤 자료는 R-49(Muszynska)·R-50(SKF)으로 갈렸다.

## 옛 Contents §7 참고자료

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
| R-11 | J. Antoni, "Fast computation of the kurtogram…" (2007) | Kurtogram (P5-6) | |
| R-12 | [NumPy DFT 정의·정규화](https://numpy.org/doc/stable/reference/routines.fft.html), [fft 제로패딩](https://numpy.org/doc/stable/reference/generated/numpy.fft.fft.html) | M1.2 FFT의 부호·bin 순서·위상·정규화 검증 | 공식 문서, 2026-10-02 확인 |

| R-13 | [NI Spectrum Averaging Mode](https://www.ni.com/docs/en-US/bundle/rfsacref/page/rfsacref/nirfsa_attr_spectrum_averaging_mode.html) | RMS·피크홀드·벡터 평균과 트리거 조건 (P2-6) | 공식 문서, 2026-10-02 확인 |
| R-14 | [SciPy Welch](https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.welch.html) | 겹친 구간의 파워 평균·오버랩 조건 (P2-6) | 공식 문서, 2026-10-02 확인 |
| R-15 | [ABB 모터 설계](https://new.abb.com/motors-generators/motors-and-generators-for-explosive-atmospheres/design-of-motors--4-and-6-poles), [SKF bearing arrangement damping](https://evolution.skf.com/damping-in-a-rolling-bearing-arrangement/) | 모터 구성·베어링과 지지계 강성/감쇠 (P1-6) | 제조사 공개 자료, 2026-10-06 확인. 직렬 예제의 실제 기계 검증 자료로 쓰지 않음 |
| R-16 | S. W. Smith, [*The Scientist and Engineer's Guide to Digital Signal Processing*](https://www.dspguide.com/) | 필터의 크기·계단 응답, Chebyshev, 되먹임 필터, 창 sinc FIR (P5-1) | 공개 |
| R-17 | [SciPy signal](https://docs.scipy.org/doc/scipy/reference/signal.html) (butter·cheby1·bessel·sosfiltfilt·decimate) | 필터 설계·두 번 거르기·데시메이션의 대조 기준 (P5-1) | 공식 문서, 2026-10-07 확인 |
| R-18 | J. S. Bendat, A. G. Piersol, *Random Data: Analysis and Measurement Procedures* | 교차 스펙트럼, H1·H2, 코히어런스와 쏠림 (P5-3) | |
| R-19 | K. R. Fyfe, E. D. S. Munck, "Analysis of computed order tracking", *Mechanical Systems and Signal Processing* 11(2), 1997 | 계산형 차수추적, 키페이저 시각의 2차 보간 (P5-4) | |
| R-20 | R. B. Randall, J. Antoni, "Rolling element bearing diagnostics — A tutorial", *Mechanical Systems and Signal Processing* 25 (2011) | 베어링 결함 주파수 식·미끄럼·위치마다의 변조 (P7-5) | |
| R-21 | P. D. McFadden, "Examination of a technique for the early detection of failure in gears by signal processing of the time domain average of the meshing vibration", *Mechanical Systems and Signal Processing* 1(2), 1987 | 축마다의 TSA, 규칙 성분을 뺀 신호(Residual·Difference)로 이빨 결함 찾기 (P7-6) | |
| R-22 | [COMSOL, Mode Superposition](https://www.comsol.com/multiphysics/mode-superposition) | 선형 모드 중첩·형상 정규화·모드 감쇠 가정 (P8-1) | 제조사 공개 이론, 2026-10-08 확인 |
| R-23 | [Bently Nevada, Rub Diagnostics based on Vibration Data](https://www.bakerhughes.com/bently-nevada/orbit-home/orbit-article/rub-diagnostics-based-vibration-data) | 기동·정지의 열 상태·접촉 영향 비교 (P8-1) | 공개 사례, 수치/그림 전재 없음 |
| R-24 | J. C. Nicholas, E. J. Gunter, P. E. Allaire, "Effect of residual shaft bow on unbalance response and balancing of a single mass flexible rotor", *Journal of Engineering for Power* 98(2), 1976 | 휨의 응답 b/(1 − r² + j2ζr), 휨과 평형추 (P7-2) | |
| R-25 | [Zhuo 외, A new computational method for predicting the thermal bow of a rotor](https://doi.org/10.1177/0954406218815722) | 정지 중 열 휨·터닝 목적 (P8-2) | 공개 초록 개념, 기계별 수치 미사용 |
| R-26 | [Bently Nevada, Centrifugal Compressor Application Note](https://www.bakerhughes.com/sites/bakerhughes/files/2022-01/GEA31971A%20Centrifugal%20Compress%20App%20Note_R4.pdf) | Morton·Newkirk의 열원 구별 (P8-2) | 개념 요약, 표/사례 그림 전재 없음 |
| R-27 | [Marscher·Illis, Journal Bearing “Morton Effect” Cause of Cyclic Vibration in Compressors](https://doi.org/10.1080/10402000601147781) | 순환 진동·열 전달 지연 (P8-2) | 공개 초록, 사례 조치를 일반화하지 않음 |
| R-28 | [Bently Nevada, Vibration and Dynamic Measurements](https://www.bakerhughes.com/cordant/blog/vibration-and-dynamic-measurements) | Eccentricity 측정 목적 (P8-2) | 공개 개념 요약 |
| R-29 | F. F. Ehrich, "High order subharmonic response of high speed rotors in bearing clearance", *Journal of Vibration, Acoustics, Stress, and Reliability in Design* 110(1), 1988 | 간극 안 로터의 ½X·⅓X (P7-3) | |
| R-30 | [ASME Turbo Expo, Steam Whirl Detection and Correction in 135 MW Steam Turbine](https://asme-turboexpo.secure-platform.com/a/solicitations/223/sessiongallery/15461/application/128518) | 증기 조건·모드·감쇠·부하 이력 (P8-3) | 공개 사례 개념, 수치·그림 미사용 |
| R-31 | [Edney·Lucas (2000), Designing High Performance Steam Turbines With Rotordynamics As A Prime Consideration](https://oaktrust.library.tamu.edu/items/8ee29812-bbba-46ff-8efb-7488ec823470) | 부분 분사 힘·씰/블레이드 교차력 (P8-3) | 공개 초록 요약 |
| R-32 | [Bently Nevada, ORBIT 2012 Q4](https://www.bakerhughes.com/sites/bakerhughes/files/2022-01/orbit_v32n4_2012_q4.pdf) | DE·축위치·케이싱 팽창 기준 (P8-3) | 측정 개념 요약 |
| R-33 | [Salamone (1982), Rotor Dynamic Analysis And Bearing Optimization Study Of A 3800 Hp Steam Turbine](https://oaktrust.library.tamu.edu/items/2d8b06df-f769-41ed-aa81-6c88e9544387) | 열 정렬·하중 감소와 불안정 사례 (P8-3) | 베어링별 조건, 일반화하지 않음 |
| R-34 | [Detection Of Rotor Cracks](https://oaktrust.library.tamu.edu/server/api/core/bitstreams/0a54b65f-73e8-4c3c-9018-3b612a9dcc15/content) | 연결 축계·catenary·응력 검토 (P8-3) | 공개 개념 요약 |
| R-35 | [Martinez-Sanchez 외, Turbine Blade-Tip Excitation Forces](https://ntrs.nasa.gov/api/citations/19940029671/downloads/19940029671.pdf) | Alford 힘·팁 누설·씰 힘 구별 (P8-4) | 개념 요약·실험 수치/그림 전재 없음 |
| R-36 | [NACA, Surge-Inception Study](https://ntrs.nasa.gov/citations/20050019238) | 압력 자료·실속/서지 관계 (P8-4) | 특정 엔진 경계를 일반화하지 않음 |
| R-37 | [Noiray·Schuermans, Azimuthal thermoacoustic modes](https://doi.org/10.1098/rspa.2012.0535) | 원주 진행/정재 모드·동시 동압 (P8-4) | 공개 초록 개념 요약 |
| R-38 | [GE Vernova, GER-3620P](https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/resources/reference/GER-3620-P.pdf) | 연소 동압 감시·튜닝·점검 (P8-4) | 경계값·정비 주기 전재 없음 |
| R-39 | W. R. Finley, M. M. Hodowanec, W. G. Holter, "An analytical approach to solving motor vibration problems", *IEEE Transactions on Industry Applications* 36(5), 2000 | 2×LF·공극 편심·로터바·소프트 풋, 전원 차단으로 전기/기계 가르기 (P7-7) | |
| R-40 | W. T. Thomson, M. Fenger, "Current signature analysis to detect induction motor faults", *IEEE Industry Applications Magazine* 7(4), 2001 | 로터바 결함의 전류 측대역 LF(1 ± 2s), 부하 의존 (P7-7) | |
| R-41 | J. F. Gülich, *Centrifugal Pumps* (Springer) | 날개 통과 압력 맥동과 간극, 부분 유량 재순환, NPSH·캐비테이션 (P7-8) | |
| R-42 | I. J. Day, "Stall, surge, and 75 years of research", *Journal of Turbomachinery* 138(1), 2016 | Rotating stall 셀 속도, 서지·서지 방지 (P7-8) | |
| R-43 | E. M. Greitzer, "Surge and rotating stall in axial flow compressors, Part I · II", *Journal of Engineering for Power* 98(2), 1976 | 압축계 체적이 만드는 서지, stall과 서지 구분 (P7-8) | |
| R-44 | [Hitachi Review, Turbine Generator](https://www.hitachi.com/ICSFiles/afieldfile/2007/11/05/r2007_04_102.pdf) | 코어2LF·단부 모드/구조 (P8-5) | 제조사 공개 자료, 2026-10-08 확인 |
| R-45 | [Iris Power, Endwinding monitoring](https://irispower.com/monitoring/end-winding-vibration-monitoring/) | 국부 진동·지지·센서 (P8-5) | 실제 허용값 전재 없음 |
| R-46 | [TG Advisers, Thermally Sensitive Generator Rotors](https://tgadvisers.com/thermally-sensitive-generator-rotors/) | 불균일 발열/팽창·계자 전류 시험 (P8-5) | 작성사 원문 개념 요약 |
| R-47 | [GE Vernova, Rotor Shaft Grounding Braids](https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/services/generator-services/GEA33584-L1-Sensors-Rotor-Shaft-Grounding-Braids.pdf) | 축전압·설계된 접지 경로 (P8-5) | 제조사 공개 자료 |
| R-48 | [SEL, Advanced Generator Protection and Monitoring](https://selinc.com/api/download/117046/) | 비틀림·SSR·전기/속도 측정 (P8-5) | 허용값·보호 설정 전재 없음 |

그 밖의 데이터셋(IMS/NASA, MFPT, PRONOSTIA/FEMTO, Paderborn, PHM09)은 M11.2에서 라이선스와 용량을 확인한 뒤 추가한다.
