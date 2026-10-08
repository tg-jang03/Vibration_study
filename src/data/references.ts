/**
 * 참고 문헌 단일 기준 (D-046). 페이지의 "참고자료"는 `components/content/References.astro`가 이 목록에서 ID로 꺼내 같은 형식으로 그리고,
 * 레퍼런스 > 참고 문헌(/reference/sources/)이 전체를 종류별로 보여 준다.
 *
 * 새 자료를 더할 때: 다음 번호(맨 아래 + 1, 한 번 쓴 ID는 다시 쓰지 않는다)로 한 줄 추가 → 페이지에서 `['R-xx', '이 페이지에서 쓴 곳']`.
 * - url은 원문(공식 페이지·DOI·공개 PDF)만 넣는다. 확인하지 못한 주소는 넣지 않는다 — 없으면 화면에 "찾아보기"(검색) 링크가 붙는다.
 * - 유료 규격은 개념만 요약하고 본문·표·경계값은 옮기지 않는다 (I-009) — note에 적는다.
 * 다음 번호: R-66
 */

export type RefKind = 'book' | 'paper' | 'standard' | 'web' | 'dataset';

export interface Reference {
  /** R-01 형식 */
  id: string;
  kind: RefKind;
  /** 저자·기관 (없으면 생략) */
  authors?: string;
  title: string;
  /** 출판사·학술지(권호)·발행 기관·사이트 */
  source?: string;
  year?: string;
  /** 원문 주소 (확인한 것만) */
  url?: string;
  /** 이 사이트에서 무엇에 쓰나 (참고 문헌 목록에 보임) */
  about: string;
  /** 이용 범위·주의 */
  note?: string;
}

export const KIND_LABEL: Record<RefKind, string> = {
  book: '책',
  paper: '논문 · 보고서',
  standard: '규격',
  web: '온라인 자료 · 제조사 문서',
  dataset: '데이터셋',
};
export const KIND_ORDER: RefKind[] = ['book', 'paper', 'standard', 'web', 'dataset'];

const STD_NOTE = '유료 규격 — 개념만 요약하고 본문·표·경계값은 옮기지 않는다';

export const REFERENCES: Reference[] = [
  { id: 'R-01', kind: 'book', authors: 'R. B. Randall', title: 'Vibration-based Condition Monitoring: Industrial, Aerospace and Automotive Applications', source: 'Wiley', year: '2011', about: '엔벨로프·켑스트럼·TSA·차수추적 등 진단 신호처리 전반, 구름베어링·기어 진단' },
  { id: 'R-02', kind: 'book', authors: 'D. E. Bently, C. T. Hatch', title: 'Fundamentals of Rotating Machinery Diagnostics', source: 'Bently Pressurized Bearing Press', year: '2002', about: '1X 벡터·위상·Bode/Polar·오빗·Full spectrum, 유체 유발 불안정, 회전기계 진단' },
  { id: 'R-03', kind: 'book', authors: 'V. Wowk', title: 'Machinery Vibration: Measurement and Analysis', source: 'McGraw-Hill', year: '1991', about: '측정량·센서·측정 설정, 결함별 스펙트럼 패턴' },
  { id: 'R-04', kind: 'book', authors: 'J. M. Vance, F. Y. Zeidan, B. Murphy', title: 'Machinery Vibration and Rotordynamics', source: 'Wiley', year: '2010', about: '임계속도·불평형 응답, 유체력 선회·씰 교차연성, 틸팅 패드 베어링' },
  { id: 'R-05', kind: 'paper', authors: 'G. Heinzel, A. Rüdiger, R. Schilling', title: 'Spectrum and spectral density estimation by the Discrete Fourier transform (DFT), including a comprehensive list of window functions and some new flat-top windows', source: 'Max-Planck-Institut für Gravitationsphysik', year: '2002', about: '스펙트럼·PSD 정규화, 윈도우 계수(S₁·S₂·ENBW), 평균과 오버랩 — 사이트 DSP 코어의 검증 기준' },
  { id: 'R-06', kind: 'paper', authors: 'F. J. Harris', title: 'On the use of windows for harmonic analysis with the discrete Fourier transform', source: 'Proceedings of the IEEE 66(1)', year: '1978', url: 'https://doi.org/10.1109/PROC.1978.10837', about: '윈도우 특성(메인로브·사이드로브·가리비 손실) 비교표' },
  { id: 'R-07', kind: 'standard', authors: 'American Petroleum Institute', title: 'API RP 684 — Rotordynamic Tutorial: Lateral Critical Speeds, Unbalance Response, Stability, Train Torsionals, and Rotor Balancing', source: 'API', about: '증폭계수(AF)·분리여유(SM)·불평형 응답 해석의 개념', note: STD_NOTE },
  { id: 'R-08', kind: 'standard', authors: 'ISO', title: 'ISO 20816-1 — Mechanical vibration: Measurement and evaluation of machine vibration, Part 1: General guidelines', source: 'ISO', year: '2016', url: 'https://www.iso.org/standard/63180.html', about: '진동 크기와 변화에 따른 평가의 일반 취지', note: STD_NOTE },
  { id: 'R-09', kind: 'web', authors: 'Bently Nevada (Baker Hughes)', title: 'ORBIT Magazine 아카이브', source: 'Baker Hughes', about: '프로브 설치·위상·런아웃 보상·보호 시스템 사례' },
  { id: 'R-10', kind: 'dataset', authors: 'Case Western Reserve University', title: 'Bearing Data Center', source: 'CWRU', url: 'https://engineering.case.edu/bearingdatacenter', about: '6205 시험 베어링 치수와 결함 데이터 (Part 11 실습 예정)' },
  { id: 'R-11', kind: 'paper', authors: 'J. Antoni', title: 'Fast computation of the kurtogram for the detection of transient faults', source: 'Mechanical Systems and Signal Processing 21(1)', year: '2007', about: 'Kurtogram으로 엔벨로프 대역 고르기' },
  { id: 'R-12', kind: 'web', authors: 'NumPy', title: 'Discrete Fourier Transform (numpy.fft)', source: 'NumPy 공식 문서', url: 'https://numpy.org/doc/stable/reference/routines.fft.html', about: 'DFT의 부호·bin 순서·정규화 — FFT 코어의 대조 기준' },
  { id: 'R-13', kind: 'web', authors: 'National Instruments', title: 'Spectrum Averaging Mode (NI-RFSA)', source: 'NI 공식 문서', url: 'https://www.ni.com/docs/en-US/bundle/rfsacref/page/rfsacref/nirfsa_attr_spectrum_averaging_mode.html', about: 'RMS·피크 홀드·벡터 평균과 트리거 조건' },
  { id: 'R-14', kind: 'web', authors: 'SciPy', title: 'scipy.signal.welch', source: 'SciPy 공식 문서', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.signal.welch.html', about: '겹친 구간의 파워 평균(Welch)과 오버랩' },
  { id: 'R-15', kind: 'web', authors: 'ABB', title: 'Design of motors, 4 and 6 poles', source: 'ABB', url: 'https://new.abb.com/motors-generators/motors-and-generators-for-explosive-atmospheres/design-of-motors--4-and-6-poles', about: '전동기의 로터·고정자·축·베어링·프레임 구성' },
  { id: 'R-16', kind: 'book', authors: 'S. W. Smith', title: "The Scientist and Engineer's Guide to Digital Signal Processing", source: 'California Technical Publishing', year: '1997', url: 'https://www.dspguide.com/', about: '샘플링·ADC, DFT·FFT, 디지털 필터(크기·계단 응답, Chebyshev, 되먹임, 창 sinc FIR) — 공개 전자책' },
  { id: 'R-17', kind: 'web', authors: 'SciPy', title: 'Signal processing (scipy.signal)', source: 'SciPy 공식 문서', url: 'https://docs.scipy.org/doc/scipy/reference/signal.html', about: '필터 설계·두 번 거르기·데시메이션·STFT·교차 스펙트럼의 대조 기준' },
  { id: 'R-18', kind: 'book', authors: 'J. S. Bendat, A. G. Piersol', title: 'Random Data: Analysis and Measurement Procedures', source: 'Wiley', year: '2010', about: '교차 스펙트럼, H1·H2, 코히어런스, 자기상관' },
  { id: 'R-19', kind: 'paper', authors: 'K. R. Fyfe, E. D. S. Munck', title: 'Analysis of computed order tracking', source: 'Mechanical Systems and Signal Processing 11(2)', year: '1997', about: '계산형 차수추적, 키페이저 시각의 2차 보간' },
  { id: 'R-20', kind: 'paper', authors: 'R. B. Randall, J. Antoni', title: 'Rolling element bearing diagnostics — A tutorial', source: 'Mechanical Systems and Signal Processing 25(2)', year: '2011', about: '베어링 결함 주파수 식·미끄럼·위치마다의 변조' },
  { id: 'R-21', kind: 'paper', authors: 'P. D. McFadden', title: 'Examination of a technique for the early detection of failure in gears by signal processing of the time domain average of the meshing vibration', source: 'Mechanical Systems and Signal Processing 1(2)', year: '1987', about: '축마다의 TSA, Residual·Difference 신호로 이빨 결함 찾기' },
  { id: 'R-22', kind: 'web', authors: 'COMSOL', title: 'Mode Superposition', source: 'COMSOL Multiphysics Cyclopedia', url: 'https://www.comsol.com/multiphysics/mode-superposition', about: '선형 모드 중첩·형상 정규화·모드 감쇠의 가정' },
  { id: 'R-23', kind: 'web', authors: 'Bently Nevada (Baker Hughes)', title: 'Rub Diagnostics Based on Vibration Data', source: 'ORBIT', url: 'https://www.bakerhughes.com/bently-nevada/orbit-home/orbit-article/rub-diagnostics-based-vibration-data', about: '러브 판독에서 파형·오빗·트렌드·Full spectrum을 함께 보는 이유', note: '공개 사례 — 수치·그림은 옮기지 않음' },
  { id: 'R-24', kind: 'paper', authors: 'J. C. Nicholas, E. J. Gunter, P. E. Allaire', title: 'Effect of residual shaft bow on unbalance response and balancing of a single mass flexible rotor', source: 'Journal of Engineering for Power 98(2)', year: '1976', about: '휨의 응답 b/(1 − r² + j2ζr), 휨과 평형추의 한계' },
  { id: 'R-25', kind: 'paper', authors: 'Zhuo 외', title: 'A new computational method for predicting the thermal bow of a rotor', source: 'Proceedings of the Institution of Mechanical Engineers, Part C', url: 'https://doi.org/10.1177/0954406218815722', about: '정지 중 열 휨과 터닝의 목적', note: '공개 초록의 개념만 — 기계별 수치는 쓰지 않음' },
  { id: 'R-26', kind: 'web', authors: 'Bently Nevada (Baker Hughes)', title: 'Centrifugal Compressor Application Note (GEA31971A)', source: 'Baker Hughes', url: 'https://www.bakerhughes.com/sites/bakerhughes/files/2022-01/GEA31971A%20Centrifugal%20Compress%20App%20Note_R4.pdf', about: 'Morton·Newkirk의 열원과 1X 변화 구별', note: '표·경계값·사례 그림은 옮기지 않음' },
  { id: 'R-27', kind: 'paper', authors: 'Marscher, Illis', title: 'Journal Bearing "Morton Effect" Cause of Cyclic Vibration in Compressors', source: 'Tribology Transactions', url: 'https://doi.org/10.1080/10402000601147781', about: '순환하는 1X 진동과 열 전달 지연', note: '공개 초록 — 사례의 조치를 일반 지침으로 쓰지 않음' },
  { id: 'R-28', kind: 'web', authors: 'Bently Nevada (Baker Hughes)', title: 'Vibration and Dynamic Measurements', source: 'Baker Hughes', url: 'https://www.bakerhughes.com/cordant/blog/vibration-and-dynamic-measurements', about: 'eccentricity 측정의 목적' },
  { id: 'R-29', kind: 'paper', authors: 'F. F. Ehrich', title: 'High order subharmonic response of high speed rotors in bearing clearance', source: 'Journal of Vibration, Acoustics, Stress, and Reliability in Design 110(1)', year: '1988', about: '간극 안 로터의 ½X·⅓X' },
  { id: 'R-30', kind: 'paper', authors: 'ASME Turbo Expo', title: 'Steam Whirl Detection and Correction in 135 MW Steam Turbine', source: 'ASME Turbo Expo 발표 개요', url: 'https://asme-turboexpo.secure-platform.com/a/solicitations/223/sessiongallery/15461/application/128518', about: '증기 조건·교차력·로터 모드·베어링 감쇠를 잇는 steam whirl 사례', note: '공개 개요의 개념만' },
  { id: 'R-31', kind: 'paper', authors: 'Edney, Lucas', title: 'Designing High Performance Steam Turbines With Rotordynamics As A Prime Consideration', source: 'Turbomachinery Symposium (Texas A&M)', year: '2000', url: 'https://oaktrust.library.tamu.edu/items/8ee29812-bbba-46ff-8efb-7488ec823470', about: '부분 분사 힘·베어링 하중·씰과 블레이드의 불안정 힘' },
  { id: 'R-32', kind: 'web', authors: 'Bently Nevada (Baker Hughes)', title: 'ORBIT 2012 Q4', source: 'ORBIT', url: 'https://www.bakerhughes.com/sites/bakerhughes/files/2022-01/orbit_v32n4_2012_q4.pdf', about: '차팽창·축위치·케이싱 팽창의 측정 기준, 서브싱크로너스 선회 분석의 맥락' },
  { id: 'R-33', kind: 'paper', authors: 'Salamone', title: 'Rotor Dynamic Analysis And Bearing Optimization Study Of A 3800 Hp Steam Turbine', source: 'Turbomachinery Symposium (Texas A&M)', year: '1982', url: 'https://oaktrust.library.tamu.edu/items/2d8b06df-f769-41ed-aa81-6c88e9544387', about: '열 정렬·베어링 하중 감소와 불안정 사례', note: '베어링별 조건 — 일반화하지 않음' },
  { id: 'R-34', kind: 'paper', authors: 'D. E. Bently, A. Muszynska', title: 'Detection of Rotor Cracks', source: 'Turbomachinery Symposium (Texas A&M)', url: 'https://oaktrust.library.tamu.edu/server/api/core/bitstreams/0a54b65f-73e8-4c3c-9018-3b612a9dcc15/content', about: '크랙 감시, 연결 축계의 정렬·응력 검토' },
  { id: 'R-35', kind: 'paper', authors: 'M. Martinez-Sanchez 외', title: 'Experimental investigation of turbine blade-tip excitation forces', source: 'NASA NTRS (학회 발표)', year: '1994', url: 'https://ntrs.nasa.gov/citations/19940029671', about: '팁 간극·일 추출과 교차력(Alford 힘)의 실험적 메커니즘', note: '수치·그림은 옮기지 않음' },
  { id: 'R-36', kind: 'paper', authors: 'L. E. Wallner, R. J. Lubick, M. J. Saari', title: 'Surge-Inception Study in a Two-Spool Turbojet Engine (NACA RM E57I27)', source: 'NACA', year: '1957', url: 'https://ntrs.nasa.gov/citations/20050019238', about: '빠른 압력 측정으로 본 실속·서지의 관계', note: '특정 엔진 사례 — 운전 경계로 일반화하지 않음' },
  { id: 'R-37', kind: 'paper', authors: 'N. Noiray, B. Schuermans', title: 'On the dynamic nature of azimuthal thermoacoustic modes in annular gas turbine combustion chambers', source: 'Proceedings of the Royal Society A', url: 'https://doi.org/10.1098/rspa.2012.0535', about: '원주방향 음향 모드의 정재·진행 성분과 방향 전환' },
  { id: 'R-38', kind: 'web', authors: 'GE Vernova', title: 'Heavy-Duty Gas Turbine Operating and Maintenance Considerations (GER-3620P)', source: 'GE Vernova', url: 'https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/resources/reference/GER-3620-P.pdf', about: '연소 동압 감시·튜닝과 점검의 연결', note: '경계값·정비 주기는 옮기지 않음' },
  { id: 'R-39', kind: 'paper', authors: 'W. R. Finley, M. M. Hodowanec, W. G. Holter', title: 'An analytical approach to solving motor vibration problems', source: 'IEEE Transactions on Industry Applications 36(5)', year: '2000', about: '2×LF·공극 편심·로터바·소프트 풋, 전원 차단으로 전기/기계 가르기' },
  { id: 'R-40', kind: 'paper', authors: 'W. T. Thomson, M. Fenger', title: 'Current signature analysis to detect induction motor faults', source: 'IEEE Industry Applications Magazine 7(4)', year: '2001', about: '로터바 결함의 전류 측대역 LF(1 ± 2s), 부하 의존' },
  { id: 'R-41', kind: 'book', authors: 'J. F. Gülich', title: 'Centrifugal Pumps', source: 'Springer', about: '날개 통과 압력 맥동과 간극, 부분 유량 재순환, NPSH·캐비테이션' },
  { id: 'R-42', kind: 'paper', authors: 'I. J. Day', title: 'Stall, surge, and 75 years of research', source: 'Journal of Turbomachinery 138(1)', year: '2016', about: 'Rotating stall 셀의 회전 속도, 서지와 서지 방지' },
  { id: 'R-43', kind: 'paper', authors: 'E. M. Greitzer', title: 'Surge and rotating stall in axial flow compressors, Part I · II', source: 'Journal of Engineering for Power 98(2)', year: '1976', about: '압축계 체적이 만드는 서지, stall과 서지의 구분' },
  { id: 'R-44', kind: 'paper', authors: 'S. Muramatsu 외 (Hitachi)', title: 'Completion of a 1,120-MVA Turbine Generator for Huadian International Zouxian Power Plant in China', source: 'Hitachi Review 56(4)', year: '2007', url: 'https://www.hitachi.com/ICSFiles/afieldfile/2007/11/05/r2007_04_102.pdf', about: '대형 2극 발전기의 고정자 코어 2×LF·단부 구조' },
  { id: 'R-45', kind: 'web', authors: 'Iris Power', title: 'End Winding Vibration Monitoring', source: 'Iris Power', url: 'https://irispower.com/monitoring/end-winding-vibration-monitoring/', about: '단부 권선의 국부 진동·지지·센서', note: '허용값은 옮기지 않음' },
  { id: 'R-46', kind: 'web', authors: 'TG Advisers', title: 'Thermally Sensitive Generator Rotors', source: 'TG Advisers', url: 'https://tgadvisers.com/thermally-sensitive-generator-rotors/', about: '계자의 불균일 발열·팽창과 계자 전류 시험' },
  { id: 'R-47', kind: 'web', authors: 'GE Vernova', title: 'Rotor Shaft Grounding Braids (GEA33584)', source: 'GE Vernova', url: 'https://www.gevernova.com/content/dam/gepower-new/global/en_US/downloads/gas-new-site/services/generator-services/GEA33584-L1-Sensors-Rotor-Shaft-Grounding-Braids.pdf', about: '축 전압과 설계된 접지 경로' },
  { id: 'R-48', kind: 'web', authors: 'Schweitzer Engineering Laboratories', title: 'Advanced Generator Protection and Monitoring', source: 'SEL', url: 'https://selinc.com/api/download/117046/', about: '축계 비틀림·SSR의 전기·속도 측정', note: '허용값·보호 설정은 옮기지 않음' },
  { id: 'R-49', kind: 'book', authors: 'A. Muszynska', title: 'Rotordynamics', source: 'CRC Press', year: '2005', about: '유체 평균 선회 속도비·교차연성, 러브·Newkirk, 크랙 로터' },
  { id: 'R-50', kind: 'web', authors: 'SKF', title: 'Damping in a rolling bearing arrangement', source: 'SKF Evolution', url: 'https://evolution.skf.com/damping-in-a-rolling-bearing-arrangement/', about: '축·베어링 위치와 강성·하우징 변형이 동특성에 관여한다는 설명' },
  { id: 'R-51', kind: 'book', authors: 'D. J. Inman', title: 'Engineering Vibration', source: 'Pearson', about: '질량-스프링·감쇠·강제진동·다자유도계의 기본 모델' },
  { id: 'R-52', kind: 'book', authors: 'S. S. Rao', title: 'Mechanical Vibrations', source: 'Pearson', about: '고유진동수·감쇠비·대수감쇠율, 진폭비·위상, 모드' },
  { id: 'R-53', kind: 'standard', authors: 'American Petroleum Institute', title: 'API 670 — Machinery Protection Systems', source: 'API', about: '센서 설치·채널 구성·알람과 트립의 기본 틀', note: STD_NOTE },
  { id: 'R-54', kind: 'standard', authors: 'ISO', title: 'ISO 1683 — Acoustics: Preferred reference values for acoustical and vibratory levels', source: 'ISO', about: '진동 레벨(dB)의 기준값', note: STD_NOTE },
  { id: 'R-55', kind: 'web', authors: 'NPTEL (IIT Guwahati)', title: 'Theory & Practice of Rotor Dynamics', source: 'NPTEL 공개 강의', url: 'https://nptel.ac.in/courses/112103024', about: 'Jeffcott 로터, 유막 베어링과 동적 계수, 안정성·자기여진, steam whirl' },
  { id: 'R-56', kind: 'paper', authors: 'F. W. Ocvirk', title: 'Short-bearing approximation for full journal bearings (NACA TN-2808)', source: 'NACA', year: '1952', url: 'https://ntrs.nasa.gov/citations/19930083541', about: '짧은 베어링의 정적 하중·자세각 관계' },
  { id: 'R-57', kind: 'paper', authors: 'R. Grissom', title: 'Whirl/whip demonstration', source: 'NASA NTRS (학회 발표, Bently Nevada)', year: '1985', url: 'https://ntrs.nasa.gov/citations/19860020723', about: '회전수 추종(휠)에서 모드 근처 고정 주파수(휩)로 이어지는 관측' },
  { id: 'R-58', kind: 'web', authors: 'Ansys', title: 'Campbell Diagram (Rotordynamic Analysis Guide)', source: 'Ansys Help', url: 'https://ansyshelp.ansys.com/public/Views/Secured/corp/v251/en/ans_rot/Hlp_G_ROTCAMPDIAGS.html', about: '모드 주파수·차수선 교차와 성장률·Log decrement의 구분' },
  { id: 'R-59', kind: 'paper', authors: 'Gruntfest, Andronis, Marscher', title: '틸팅패드 지지 압축기의 불안정 사례', source: 'Turbomachinery Symposium (Texas A&M)', year: '2001', url: 'https://oaktrust.library.tamu.edu/bitstreams/0e5fd805-577b-420a-b14d-e33c937b46aa/download', about: '베어링 밖의 씰 교차력과 스월 브레이크 효과' },
  { id: 'R-60', kind: 'paper', authors: 'M. Martinez-Sanchez, E. M. Greitzer', title: 'Blade-Tip-Clearance Forces in Turbines', source: 'NASA Tech Brief', year: '1987', url: 'https://ntrs.nasa.gov/citations/19870000039', about: '팁 간극의 불균일이 만드는 교차력의 배경' },
  { id: 'R-61', kind: 'web', authors: 'Fluke', title: 'Fluke 805 Vibration Meter 사용자 설명서', source: 'Fluke', url: 'https://assets.fluke.com/manuals/805_____umeng0000.pdf', about: 'Crest factor 정의와 CF 하나로 상태를 판단할 때의 한계' },
  { id: 'R-62', kind: 'web', authors: 'Bently Nevada (Baker Hughes)', title: 'Vibration issue on Compressor in a Nitric Acid Plant', source: 'Baker Hughes', url: 'https://www.bakerhughes.com/cordant/blog/vibration-issue-compressor-nitric-acid-plant', about: '직교 X/Y 신호·선회 방향·Full spectrum cascade를 함께 본 공개 사례' },
  { id: 'R-63', kind: 'web', authors: 'Siemens', title: 'Orbit Plots', source: 'Siemens Community', url: 'https://community.sw.siemens.com/articles/en_US/Knowledge/Orbit-Plots', about: '같은 평면의 X/Y, AC/DC, 키페이저와 직접·필터 오빗' },
  { id: 'R-64', kind: 'web', authors: 'Bently Nevada (Baker Hughes)', title: "Radial rub at centrifugal compressor's ISO carbon seals", source: 'ORBIT', url: 'https://www.bakerhughes.com/bently-nevada/orbit-home/orbit-article/radial-rub-centrifugal-compressors-iso-carbon-seals', about: '운전 중 위상·오빗 변화와 다른 플롯을 잇는 러브 사례' },
  { id: 'R-65', kind: 'web', authors: 'Bently Nevada (Baker Hughes)', title: 'The Usefulness of Acceptance Regions (ORBIT 2011 Q3)', source: 'ORBIT', url: 'https://www.bakerhughes.com/sites/bakerhughes/files/2022-01/orbit_v31n3_2011_q3.pdf', about: 'APHT의 시간축, Polar 표현과 허용 영역의 개념' },
];

export const REF_BY_ID: Record<string, Reference> = Object.fromEntries(REFERENCES.map((r) => [r.id, r]));

/** 화면의 앵커 이름: R-01 → r-01 */
export const refAnchor = (id: string) => id.toLowerCase();

/** 원문 주소, 없으면 검색 주소 (책·논문·규격은 Google Scholar, 그 밖은 일반 검색) */
export function refLink(r: Reference): { href: string; label: string; direct: boolean } {
  if (r.url) return { href: r.url, label: '원문', direct: true };
  const surname = (r.authors ?? '').split(',')[0].trim().split(/\s+/).pop() ?? '';
  const q = encodeURIComponent(`${r.title} ${surname}`.trim());
  return r.kind === 'web' || r.kind === 'dataset'
    ? { href: `https://www.google.com/search?q=${q}`, label: '찾아보기', direct: false }
    : { href: `https://scholar.google.com/scholar?q=${q}`, label: '찾아보기', direct: false };
}

/** 페이지 MDX 원문에서 <References> 블록이 인용한 ID 목록 */
export function citedIds(mdx: string): string[] {
  const at = mdx.indexOf('<References');
  if (at < 0) return [];
  const ends = [mdx.indexOf('/>', at), mdx.indexOf('</References>', at)].filter((i) => i > 0);
  const block = mdx.slice(at, ends.length ? Math.min(...ends) : undefined);
  return [...block.matchAll(/\['(R-\d{2})'/g)].map((m) => m[1]);
}
